import { useEffect, useCallback, useState } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { Plant, supabase } from '@/utils/supabase'
import { useAuth } from '@/contextes/AuthContext'
import { NotificationState, NotificationData } from '@/types/notifications'
import NotificationsService from '@/services/NotificationsService'

export const useNotifications = () => {
    const [notificationState, setNotificationState] =
        useState<NotificationState>({
            enabled: false,
            token: null,
            error: null,
        })

    const { user } = useAuth()

    // Handle incoming notifications
    const handleNotificationReceived = useCallback(
        (notification: Notifications.Notification) => {
            console.log('Notification received:', notification)
        },
        [],
    )

    // Handle notification responses with improved error handling
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

    // Initialize notifications with proper error handling
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

    // Handle marking a plant as watered
    const handleMarkWatered = async (plantId: string) => {
        try {
            const now = new Date().toISOString()
            const { error } = await supabase
                .from('plants')
                .update({ last_watered: now })
                .eq('id', plantId)

            if (error) throw error

            // Fetch updated plant data
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

    // Handle reminding later
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

    // Schedule notifications for a plant with improved error handling
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

    // Cancel notifications for a plant
    const cancelNotifications = async (plantId: number) => {
        try {
            await NotificationsService.cancelPlantNotifications(plantId)
        } catch (error) {
            console.error('Error canceling notifications:', error)
            throw error
        }
    }

    // Setup and cleanup notifications
    useEffect(() => {
        initializeNotifications()

        return () => {
            // NotificationsService will handle the cleanup of listeners
            NotificationsService.cleanup()
        }
    }, [user, initializeNotifications])

    return {
        scheduleNotifications,
        cancelNotifications,
        notificationState,
    }
}
