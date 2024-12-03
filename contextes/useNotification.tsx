import React, {
    createContext,
    useEffect,
    useCallback,
    useState,
    useContext,
} from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { Plant, supabase } from '@/utils/supabase'
import { useAuth } from '@/contextes/AuthContext'
import { NotificationState, NotificationData } from '@/types/notifications'
import NotificationsService from '@/services/NotificationsService'
import { NotificationRequest } from 'expo-notifications'

interface NotificationsContextProps {
    scheduleNotifications: (plant: Plant) => Promise<void>
    cancelNotifications: (plantId: number) => Promise<void>
    notificationState: NotificationState
    getState: (plant: Plant) => Promise<NotificationRequest[]>
}

const NotificationsContext = createContext<
    NotificationsContextProps | undefined
>(undefined)

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [notificationState, setNotificationState] =
        useState<NotificationState>({
            enabled: false,
            token: null,
            error: null,
        })

    const { user } = useAuth()

    const handleNotificationReceived = useCallback(
        (notification: Notifications.Notification) => {
            console.log('Notification received:', notification)
        },
        [],
    )

    const handleNotificationResponse = useCallback(
        async (response: Notifications.NotificationResponse) => {
            try {
                const { plantId, type, timestamp } = response.notification
                    .request.content.data as NotificationData
                const actionId = response.actionIdentifier

                switch (actionId) {
                    case 'MARK_WATERED':
                        await handleMarkWatered(plantId)
                        break
                    case 'REMIND_LATER':
                        await handleRemindLater(plantId, type)
                        break
                    default:
                        console.log('Unknown action:', actionId)
                }
            } catch (error) {
                console.error('Error handling notification response:', error)
            }
        },
        [],
    )

    const initializeNotifications = useCallback(async () => {
        if (Platform.OS === 'web') return

        try {
            const success = await NotificationsService.init({
                onNotificationReceived: handleNotificationReceived,
                onNotificationResponse: handleNotificationResponse,
                onError: (error) =>
                    setNotificationState((prev) => ({ ...prev, error })),
            })

            setNotificationState((prev) => ({ ...prev, enabled: success }))
        } catch (error) {
            setNotificationState((prev) => ({
                ...prev,
                enabled: false,
                error:
                    error instanceof Error
                        ? error
                        : new Error('Failed to initialize notifications'),
            }))
        }
    }, [handleNotificationReceived, handleNotificationResponse])

    const handleMarkWatered = async (plantId: string) => {
        try {
            const now = new Date().toISOString()
            const { error } = await supabase
                .from('plants')
                .update({ last_watered: now })
                .eq('id', plantId)

            if (error) throw error

            const { data: plant, error: fetchError } = await supabase
                .from('plants')
                .select('*')
                .eq('id', plantId)
                .single()

            if (fetchError) throw fetchError

            if (plant) {
                await scheduleNotifications(plant)
            }
        } catch (error) {
            console.error('Error updating plant watering status:', error)
            throw error
        }
    }

    const handleRemindLater = async (
        plantId: string,
        notificationType: string,
    ) => {
        try {
            const oneHourFromNow = new Date()
            oneHourFromNow.setHours(oneHourFromNow.getHours() + 1)

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Watering Reminder',
                    body: "Don't forget to water your plant!",
                    data: {
                        plantId,
                        type: notificationType,
                        timestamp: new Date().toISOString(),
                    },
                    categoryIdentifier: 'WATERING',
                },
                trigger: oneHourFromNow,
            })
        } catch (error) {
            console.error('Error scheduling reminder:', error)
            throw error
        }
    }

    const scheduleNotifications = async (plant: Plant) => {
        try {
            await NotificationsService.scheduleWateringNotifications({
                plant,
                notificationType: 'WATERING',
            })
        } catch (error) {
            console.error('Error scheduling notifications:', error)
            throw error
        }
    }

    const cancelNotifications = async (plantId: number) => {
        try {
            await NotificationsService.cancelPlantNotifications(plantId)
        } catch (error) {
            console.error('Error canceling notifications:', error)
            throw error
        }
    }

    const getState = async (plant: Plant) => {
        return await NotificationsService.getScheduledNotifications(plant.id)
    }

    useEffect(() => {
        initializeNotifications()

        return () => {
            NotificationsService.cleanup()
        }
    }, [user, initializeNotifications])

    return (
        <NotificationsContext.Provider
            value={{
                scheduleNotifications,
                cancelNotifications,
                notificationState,
                getState,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    )
}

export const useNotifications = () => {
    const context = useContext(NotificationsContext)
    if (!context) {
        throw new Error(
            'useNotifications must be used within a NotificationsProvider',
        )
    }
    return context
}
