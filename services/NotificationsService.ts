import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import { addDays, isToday, setHours, subDays } from 'date-fns'
import {
    NOTIFICATION_ACTIONS,
    NOTIFICATION_CATEGORIES,
    NOTIFICATION_CONSTANTS,
    STORAGE_KEYS,
} from '@/constants/notifications'
import {
    Notification,
    NotificationHandlers,
    NotificationState,
    ScheduleOptions,
} from '@/types/notifications'
import { Plant } from '@/utils/supabase'

const SENDING_HOUR = 9

class NotificationService {
    private static instance: NotificationService
    private notificationState: NotificationState = {
        enabled: false,
        token: null,
        error: null,
    }
    private notificationListener: Notifications.EventSubscription | null = null
    private responseListener: Notifications.EventSubscription | null = null

    private constructor() {
        // Private constructor for singleton pattern
        this.loadState().then(() => {
            console.log('notificationService loaded')
        })
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService()
        }
        return NotificationService.instance
    }

    private async loadState() {
        try {
            const state = await AsyncStorage.getItem(
                STORAGE_KEYS.NOTIFICATION_STATE,
            )
            if (state) {
                this.notificationState = JSON.parse(state)
            }
        } catch (error) {
            console.error('Error loading notification state:', error)
        }
    }

    private async saveState() {
        try {
            await AsyncStorage.setItem(
                STORAGE_KEYS.NOTIFICATION_STATE,
                JSON.stringify(this.notificationState),
            )
        } catch (error) {
            console.error('Error saving notification state:', error)
        }
    }

    async init(handlers?: NotificationHandlers): Promise<boolean> {
        try {
            // First check device capability
            if (!Device.isDevice) {
                throw new Error(
                    'Must use physical device for Push Notifications',
                )
            }

            // Check if running in Expo Go
            if (
                Constants.executionEnvironment ===
                ExecutionEnvironment.StoreClient
            ) {
                console.warn(
                    'Running in Expo Go. Some notification features might be limited. ' +
                        'Consider using a development build for full notification support.',
                )
            }

            // Set up notification handler first
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                }),
            })

            // Request permissions
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync()
            let finalStatus = existingStatus

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync()
                finalStatus = status
            }

            if (finalStatus !== 'granted') {
                throw new Error('Permission not granted for notifications')
            }

            // Set up Android channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Plant Care',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#228B22',
                })
            }

            // Get push token
            const token = await this.getPushToken()

            if (!token) {
                throw new Error('Failed to get push token')
            }

            console.log(token)

            // Set up categories
            if (Platform.OS !== 'web') {
                await Promise.all(
                    Object.entries(NOTIFICATION_ACTIONS).map(([key, actions]) =>
                        Notifications.setNotificationCategoryAsync(
                            key,
                            actions,
                        ),
                    ),
                )
            }

            // Remove existing listeners if they exist
            this.removeListeners()

            // Set up handlers
            if (handlers?.onNotificationReceived) {
                this.notificationListener =
                    Notifications.addNotificationReceivedListener(
                        handlers.onNotificationReceived,
                    )
            }

            if (handlers?.onNotificationResponse) {
                this.responseListener =
                    Notifications.addNotificationResponseReceivedListener(
                        handlers.onNotificationResponse,
                    )
            }

            // Update state
            this.notificationState = {
                enabled: true,
                token,
                error: null,
            }
            await this.saveState()

            return true
        } catch (error) {
            const typedError =
                error instanceof Error ? error : new Error(String(error))
            this.notificationState = {
                enabled: false,
                token: null,
                error: typedError,
            }
            await this.saveState()

            if (handlers?.onError) {
                handlers.onError(typedError)
            }
            return false
        }
    }

    private async getPushToken(): Promise<string> {
        try {
            const isExpoGo =
                Constants.executionEnvironment ===
                ExecutionEnvironment.StoreClient

            // For development builds and standalone apps, use device push token
            if (!isExpoGo) {
                return (await Notifications.getDevicePushTokenAsync()).data
            }

            // Fallback to Expo push token (mainly for testing in Expo Go)
            const projectId = Constants.expoConfig?.extra?.eas?.projectId
            if (!projectId) {
                throw new Error('Project ID is not defined in app config')
            }

            const { data } = await Notifications.getExpoPushTokenAsync({
                projectId,
            })

            return data
        } catch (error) {
            console.error('Error getting push token:', error)
            throw error
        }
    }

    private getNotificationBody(
        plantName: string,
        isDayBefore: boolean,
    ): string {
        if (isDayBefore) {
            return `${plantName} will need watering tomorrow!`
        } else {
            return `${plantName} needs watering!`
        }
    }

    async getScheduledNotifications(
        plantId?: number,
    ): Promise<Notifications.NotificationRequest[]> {
        try {
            const allNotifications =
                await Notifications.getAllScheduledNotificationsAsync()
            if (plantId) {
                return allNotifications.filter(
                    (notification) =>
                        notification.content.data?.plantId === plantId,
                )
            }
            return allNotifications
        } catch (error) {
            console.error('Error getting scheduled notifications:', error)
            return []
        }
    }

    async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync()
        } catch (error) {
            console.error('Error canceling all notifications:', error)
            throw error
        }
    }

    getNotificationState(): NotificationState {
        return { ...this.notificationState }
    }

    async scheduleWateringNotifications(
        options: ScheduleOptions,
    ): Promise<void> {
        const { plant, retryAttempts = NOTIFICATION_CONSTANTS.MAX_RETRIES } =
            options

        if (!plant.last_watered || !plant.watering_frequency) {
            throw new Error('Plant missing watering information')
        }

        try {
            // Cancel existing notifications first
            await this.cancelPlantNotifications(plant.id)
            const lastWateringDate = new Date(plant.last_watered)
            const nextWateringDate = setHours(
                addDays(lastWateringDate, plant.watering_frequency),
                SENDING_HOUR,
            )
            const dayBeforeNotificationDate = subDays(nextWateringDate, 1)

            const wateringDateNotification: Notification =
                this.buildNotification(plant, nextWateringDate, false)

            try {
                await Notifications.scheduleNotificationAsync({
                    content: wateringDateNotification.content,
                    trigger: wateringDateNotification.trigger,
                })
            } catch (error) {
                console.error(
                    'Error scheduling immediate notification for watering day:',
                    error,
                )
            }

            const dayBeforeNotification: Notification = this.buildNotification(
                plant,
                dayBeforeNotificationDate,
                false,
            )
            if (!isToday(dayBeforeNotificationDate)) {
                // if it's today, don't bother sending notification
                try {
                    await Notifications.scheduleNotificationAsync({
                        content: dayBeforeNotification.content,
                        trigger: dayBeforeNotification.trigger,
                    })
                } catch (error) {
                    console.error(
                        'Error scheduling immediate notification for watering day:',
                        error,
                    )
                }
            }
        } catch (error) {
            console.error('Error scheduling notifications:', error)
            throw error
        }
    }

    private buildNotification(
        plant: Plant,
        date: Date,
        isDayBefore: boolean,
    ): Notification {
        const title = isDayBefore
            ? `Remeber to water ${plant.name} tomorrow`
            : `Time to water ${plant.name}`
        return {
            id: uuidv4(),
            content: {
                title: title,
                body: this.getNotificationBody(plant.name, isDayBefore),
                data: {
                    plantId: plant.id,
                    type: 'WATERING',
                    timestamp: new Date().toISOString(),
                },
                categoryIdentifier: NOTIFICATION_CATEGORIES.WATERING.identifier,
            },
            trigger: date,
            retries: 0,
            createdAt: new Date().toISOString(),
        }
    }

    async cancelPlantNotifications(plantId: number): Promise<void> {
        try {
            // Cancel scheduled notifications
            const allNotifications =
                await Notifications.getAllScheduledNotificationsAsync()
            const plantNotifications = allNotifications.filter(
                (notification) =>
                    notification.content.data?.plantId === plantId,
            )

            await Promise.all(
                plantNotifications.map((notification) =>
                    Notifications.cancelScheduledNotificationAsync(
                        notification.identifier,
                    ),
                ),
            )
        } catch (error) {
            console.error('Error canceling notifications:', error)
            throw error
        }
    }

    private removeListeners() {
        if (this.notificationListener) {
            Notifications.removeNotificationSubscription(
                this.notificationListener,
            )
            this.notificationListener = null
        }
        if (this.responseListener) {
            Notifications.removeNotificationSubscription(this.responseListener)
            this.responseListener = null
        }
    }

    async cleanup() {
        try {
            // Cancel all scheduled notifications
            await Notifications.cancelAllScheduledNotificationsAsync()

            // Reset state
            this.notificationState = {
                enabled: false,
                token: null,
                error: null,
            }
            await this.saveState()
        } catch (error) {
            console.error('Error during cleanup:', error)
            throw error
        }
    }
}

export default NotificationService.getInstance()
