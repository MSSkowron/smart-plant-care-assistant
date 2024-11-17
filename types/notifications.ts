import { Plant } from '@/utils/supabase'
import * as Notifications from 'expo-notifications'

export interface NotificationData {
    plantId: string
    type: NotificationType
    timestamp: string
}

export type NotificationType = 'WATERING' | 'MAINTENANCE'

export interface Notification {
    id: string
    content: Notifications.NotificationContentInput
    trigger: Notifications.DateTriggerInput
    retries: number
    createdAt: string
}

export interface NotificationState {
    enabled: boolean
    token: string | null
    error: Error | null
}

export interface NotificationHandlers {
    onNotificationReceived?: (notification: Notifications.Notification) => void
    onNotificationResponse?: (
        response: Notifications.NotificationResponse,
    ) => void
    onError?: (error: Error) => void
}

export interface ScheduleOptions {
    plant: Plant
    notificationType: NotificationType
    retryAttempts?: number
    immediate?: boolean
}
