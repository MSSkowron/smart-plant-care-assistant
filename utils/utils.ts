import { DateTriggerInput } from 'expo-notifications'
import { addDays, parseISO } from 'date-fns'

// Function to calculate next watering date
export const getNextWateringDate = (
    lastWatered: string | null,
    frequency: number,
) => {
    if (!lastWatered) return null
    const lastWateredDate = parseISO(lastWatered)
    return addDays(lastWateredDate, frequency)
}

// Function to get status info based on days until next watering
export const getStatusInfo = (nextWateringDate: Date | null) => {
    if (!nextWateringDate)
        return {
            color: '#9AA5B1',
            status: 'Not set',
            bgColor: '#F5F7FA',
            icon: 'help-circle',
        }

    const today = new Date()
    const daysUntilWatering = Math.ceil(
        (nextWateringDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysUntilWatering <= 0)
        return {
            color: '#FF4444',
            status: 'Overdue',
            bgColor: '#FFF5F5',
            icon: 'alert-circle',
        }
    if (daysUntilWatering <= 2)
        return {
            color: '#FFA500',
            status: 'Due soon',
            bgColor: '#FFF9E6',
            icon: 'time',
        }
    return {
        color: '#4CAF50',
        status: 'On track',
        bgColor: '#F0FFF4',
        icon: 'checkmark-circle',
    }
}

export function getTriggerDate(trigger: DateTriggerInput): Date {
    if (trigger instanceof Date) {
        return trigger
    }
    if (typeof trigger === 'number') {
        return new Date(trigger)
    }
    if (typeof trigger === 'object' && 'date' in trigger) {
        const date = trigger.date
        if (date instanceof Date) {
            return date
        }
        return new Date(date)
    }
    throw new Error('Invalid trigger date format')
}

export function isValidTrigger(trigger: DateTriggerInput): boolean {
    try {
        const date = getTriggerDate(trigger)
        return date instanceof Date && !isNaN(date.getTime())
    } catch {
        return false
    }
}

export function isFutureTrigger(trigger: DateTriggerInput): boolean {
    try {
        const date = getTriggerDate(trigger)
        return date > new Date()
    } catch {
        return false
    }
}
