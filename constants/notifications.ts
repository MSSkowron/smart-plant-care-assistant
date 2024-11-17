export const NOTIFICATION_CONSTANTS = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000 * 60, // 1 minute
    BATCH_SIZE: 25,
} as const

// Define the actions separately without 'as const'
export const NOTIFICATION_ACTIONS = {
    WATERING: [
        {
            identifier: 'MARK_WATERED',
            buttonTitle: 'Mark as Watered',
            options: {
                isDestructive: false,
                isAuthenticationRequired: false,
            },
        },
        {
            identifier: 'REMIND_LATER',
            buttonTitle: 'Remind in 1 hour',
            options: {
                isDestructive: false,
                isAuthenticationRequired: false,
            },
        },
    ],
}

export const NOTIFICATION_CATEGORIES = {
    WATERING: {
        identifier: 'WATERING',
        actions: NOTIFICATION_ACTIONS.WATERING,
    },
} as const

export const STORAGE_KEYS = {
    NOTIFICATION_STATE: 'notification_state',
} as const
