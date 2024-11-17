import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '@/constants/notifications'
import { Notification } from '@/types/notifications'

/**
 * Checks if notifications are supported on the current platform
 */
export const isNotificationsSupported = (): boolean => {
    return Platform.OS !== 'web'
}

/**
 * Validates a notification trigger date
 */
export const isValidTriggerDate = (date: Date): boolean => {
    const now = new Date()
    return date > now
}

/**
 * Formats notification date for display
 */
export const formatNotificationDate = (date: Date): string => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffHours = diffTime / (1000 * 60 * 60)

    if (diffHours < 24) {
        if (diffHours < 1) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60))
            return `in ${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`
        }
        const hours = Math.floor(diffHours)
        return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return `in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`
}

/**
 * Gets all scheduled notifications for a specific plant
 */
export const getPlantNotifications = async (
    plantId: number,
): Promise<Notifications.NotificationRequest[]> => {
    const allNotifications =
        await Notifications.getAllScheduledNotificationsAsync()
    return allNotifications.filter(
        (notification) => notification.content.data?.plantId === plantId,
    )
}

/**
 * Gets all failed notifications from the queue
 */
export const getFailedNotifications = async (): Promise<Notification[]> => {
    try {
        const queueData = await AsyncStorage.getItem(
            STORAGE_KEYS.NOTIFICATION_QUEUE,
        )
        if (!queueData) return []

        const queue: Notification[] = JSON.parse(queueData)
        return queue.filter((item) => item.status === 'failed')
    } catch (error) {
        console.error('Error getting failed notifications:', error)
        return []
    }
}

/**
 * Clears all notification data
 */
export const clearNotificationData = async (): Promise<void> => {
    try {
        await Promise.all([
            Notifications.cancelAllScheduledNotificationsAsync(),
            AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_QUEUE),
            AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_STATE),
        ])
    } catch (error) {
        console.error('Error clearing notification data:', error)
        throw error
    }
}

/**
 * Validates notification permissions
 */
export const validateNotificationPermissions = async (): Promise<boolean> => {
    try {
        const permissionsStatus = await Notifications.getPermissionsAsync()
        return permissionsStatus.status === 'granted'
    } catch (error) {
        console.error('Error validating notification permissions:', error)
        return false
    }
}

/**
 * Gets the exponential backoff delay for retries
 */
export const getRetryDelay = (
    retryAttempt: number,
    baseDelay: number = 1000,
): number => {
    return Math.min(baseDelay * Math.pow(2, retryAttempt), 1000 * 60 * 60) // Max 1 hour
}

/**
 * Creates a notification debug log
 */
export const createNotificationLog = async (
    type: string,
    message: string,
    data?: any,
): Promise<void> => {
    const log = {
        type,
        message,
        data,
        timestamp: new Date().toISOString(),
    }

    try {
        const logs = await AsyncStorage.getItem('notification_logs')
        const existingLogs = logs ? JSON.parse(logs) : []
        existingLogs.push(log)

        // Keep only last 100 logs
        const trimmedLogs = existingLogs.slice(-100)
        await AsyncStorage.setItem(
            'notification_logs',
            JSON.stringify(trimmedLogs),
        )
    } catch (error) {
        console.error('Error creating notification log:', error)
    }
}
