import React, { useEffect, useState } from 'react'
import {
    Text,
    StyleSheet,
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contextes/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TERTIARY } from '@/assets/colors'
import { router } from 'expo-router'
import { Plant, supabase } from '@/utils/supabase'
import { getNextWateringDate } from '@/utils/utils'
import { format } from 'date-fns'

export default function HomeScreen() {
    const { user } = useAuth()
    const [plants, setPlants] = useState<Plant[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const handleWaterPlant = async (plant: Plant) => {
        const nextWatering = getNextWateringDate(
            plant.last_watered,
            plant.watering_frequency,
        )

        if (nextWatering) {
            const today = new Date()
            const daysUntilWatering = Math.ceil(
                (nextWatering.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24),
            )

            if (daysUntilWatering > 0) {
                Alert.alert(
                    'Early Watering',
                    `This plant is scheduled for watering in ${daysUntilWatering} days. Do you still want to water it now?`,
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                        {
                            text: 'Water Now',
                            onPress: async () => {
                                try {
                                    const now = new Date()
                                    const formattedDate = now.toISOString()

                                    const { error } = await supabase
                                        .from('plants')
                                        .update({ last_watered: formattedDate })
                                        .eq('id', plant.id)

                                    if (error) throw error
                                    Alert.alert(
                                        'Success',
                                        'Plant watered successfully!',
                                    )
                                    fetchPlants()
                                } catch (error: any) {
                                    Alert.alert(
                                        'Error',
                                        error.message ||
                                            'Failed to water plant',
                                    )
                                }
                            },
                            style: 'default',
                        },
                    ],
                    { cancelable: true },
                )
            } else {
                // Plant needs watering, proceed without confirmation
                try {
                    const now = new Date()
                    const formattedDate = now.toISOString()

                    const { error } = await supabase
                        .from('plants')
                        .update({ last_watered: formattedDate })
                        .eq('id', plant.id)

                    if (error) throw error
                    Alert.alert('Success', 'Plant watered successfully!')
                    fetchPlants()
                } catch (error: any) {
                    Alert.alert(
                        'Error',
                        error.message || 'Failed to water plant',
                    )
                }
            }
        }
    }

    const fetchPlants = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('plants')
                .select('*')
                .returns<Plant[]>()
            if (error) throw error

            const sortedPlants = [...data].sort((a, b) => {
                const nextWateringA = getNextWateringDate(
                    a.last_watered,
                    a.watering_frequency,
                )
                const nextWateringB = getNextWateringDate(
                    b.last_watered,
                    b.watering_frequency,
                )

                if (!nextWateringA) return 1
                if (!nextWateringB) return -1
                return nextWateringA.getTime() - nextWateringB.getTime()
            })

            setPlants(sortedPlants)
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to fetch plants')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPlants()
    }, [])

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR_PRIMARY} />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text
                        style={styles.headerText}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        Welcome, {user?.email}!
                    </Text>
                </View>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="leaf-outline" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={styles.contentContainer}>
                <View style={[styles.card, styles.tasksCard]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Upcoming Waterings</Text>
                        {plants.length > 3 && (
                            <TouchableOpacity
                                style={styles.viewAllButton}
                                onPress={() => router.push('/schedule')}
                            >
                                <Text style={styles.viewAllText}>View all</Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color={COLOR_PRIMARY}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.taskContainer}>
                        {plants.slice(0, 3).map((plant) => {
                            const nextWatering = getNextWateringDate(
                                plant.last_watered,
                                plant.watering_frequency,
                            )

                            return (
                                <View key={plant.id} style={styles.taskItem}>
                                    <View style={styles.taskItemContent}>
                                        <View style={styles.taskItemHeader}>
                                            <View style={styles.plantIcon}>
                                                <Ionicons
                                                    name="water-outline"
                                                    size={18}
                                                    color={COLOR_SECONDARY}
                                                />
                                            </View>
                                            <Text style={styles.taskPlantName}>
                                                {plant.name}
                                            </Text>
                                        </View>
                                        <View style={styles.taskDetails}>
                                            <Text style={styles.taskDate}>
                                                {nextWatering
                                                    ? format(
                                                          nextWatering,
                                                          'MMM d, yyyy',
                                                      )
                                                    : 'Not set'}
                                            </Text>
                                            <Text style={styles.frequencyText}>
                                                Every {plant.watering_frequency}{' '}
                                                days
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.waterNowButton}
                                        onPress={() => handleWaterPlant(plant)}
                                    >
                                        <Ionicons
                                            name="water"
                                            size={20}
                                            color="#FFF"
                                        />
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                        {plants.length === 0 && (
                            <View style={styles.emptyStateContainer}>
                                <Ionicons
                                    name="water-outline"
                                    size={32}
                                    color={COLOR_SECONDARY}
                                    style={styles.emptyStateIcon}
                                />
                                <Text style={styles.noPlantText}>
                                    No plants to water. Add some plants to get
                                    started!
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={[styles.card, styles.actionsCard]}>
                    <Text style={styles.cardTitle}>Quick Actions</Text>
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={[
                                styles.actionItem,
                                { borderColor: COLOR_PRIMARY },
                            ]}
                            onPress={() => router.push('/addPlant')}
                        >
                            <Ionicons
                                name="add-circle-outline"
                                size={30}
                                color={COLOR_PRIMARY}
                            />
                            <Text
                                style={[
                                    styles.actionText,
                                    { color: COLOR_PRIMARY },
                                ]}
                            >
                                Add Plant
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.actionItem,
                                { borderColor: COLOR_PRIMARY },
                            ]}
                            onPress={() => router.push('/schedule')}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={30}
                                color={COLOR_PRIMARY}
                            />
                            <Text
                                style={[
                                    styles.actionText,
                                    { color: COLOR_PRIMARY },
                                ]}
                            >
                                View Schedule
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E9F0',
    },
    headerTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    headerText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2E3440',
    },
    headerButton: {
        width: 48,
        height: 48,
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLOR_PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statisticsCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLOR_PRIMARY,
    },
    tasksCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLOR_SECONDARY,
    },
    actionsCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLOR_TERTIARY,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E3440',
        marginBottom: 12,
    },
    statisticsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statText: {
        fontSize: 14,
        color: '#4C566A',
    },
    taskText: {
        fontSize: 14,
        color: '#4C566A',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionItem: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#E5E9F0',
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E3440',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        color: COLOR_PRIMARY,
        fontWeight: '500',
    },
    taskContainer: {
        gap: 12,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    taskItemContent: {
        flex: 1,
    },
    taskItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    plantIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E9F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    taskPlantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E3440',
    },
    taskDetails: {
        marginLeft: 44,
        gap: 2,
    },
    taskDate: {
        fontSize: 14,
        color: '#2E3440',
        fontWeight: '500',
    },
    frequencyText: {
        fontSize: 12,
        color: '#4C566A',
    },
    waterNowButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLOR_SECONDARY,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: COLOR_SECONDARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    emptyStateContainer: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
    },
    emptyStateIcon: {
        marginBottom: 12,
        opacity: 0.7,
    },
    noPlantText: {
        fontSize: 14,
        color: '#4C566A',
        textAlign: 'center',
        lineHeight: 20,
    },
})
