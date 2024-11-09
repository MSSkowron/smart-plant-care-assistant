import React, { useEffect, useState } from 'react'
import {
    Text,
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { COLOR_PRIMARY, COLOR_SECONDARY } from '@/assets/colors'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { Plant, supabase } from '@/utils/supabase'
import { getNextWateringDate, getStatusInfo } from '@/utils/utils'

const EmptyState = () => (
    <View style={styles.emptyState}>
        <View style={styles.emptyStateIconContainer}>
            <Ionicons name="leaf-outline" size={40} color={COLOR_SECONDARY} />
        </View>
        <Text style={styles.emptyStateTitle}>No Plants Yet</Text>
        <Text style={styles.emptyStateText}>
            Add some plants to start tracking their watering schedule
        </Text>
        <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/addPlant')}
        >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add Your First Plant</Text>
        </TouchableOpacity>
    </View>
)

const PlantCard = ({ plant }: { plant: Plant }) => {
    const nextWatering = getNextWateringDate(
        plant.last_watered,
        plant.watering_frequency,
    )
    const statusInfo = getStatusInfo(nextWatering)
    const lastWateredDate = plant.last_watered
        ? parseISO(plant.last_watered)
        : null

    return (
        <View style={styles.scheduleCard}>
            <View style={styles.cardHeader}>
                <View style={styles.plantInfo}>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusInfo.bgColor },
                        ]}
                    >
                        <Ionicons
                            name={statusInfo.icon}
                            size={16}
                            color={statusInfo.color}
                        />
                        <Text
                            style={[
                                styles.statusText,
                                { color: statusInfo.color },
                            ]}
                        >
                            {statusInfo.status}
                        </Text>
                    </View>
                    <View style={styles.plantDetails}>
                        <Text style={styles.plantName}>{plant.name}</Text>
                        <Text style={styles.plantSpecies}>{plant.species}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.scheduleInfo}>
                <View style={styles.scheduleRow}>
                    <View style={styles.scheduleItem}>
                        <Text style={styles.scheduleLabel}>Next watering</Text>
                        <Text style={styles.scheduleValue}>
                            {nextWatering
                                ? format(nextWatering, 'MMM d, yyyy')
                                : 'Not set'}
                        </Text>
                    </View>
                    <View style={styles.scheduleItem}>
                        <Text style={styles.scheduleLabel}>Frequency</Text>
                        <Text style={styles.scheduleValue}>
                            Every {plant.watering_frequency} days
                        </Text>
                    </View>
                </View>
                <View style={styles.lastWateredRow}>
                    <Text style={styles.lastWateredText}>
                        Last watered:{' '}
                        <Text style={styles.lastWateredValue}>
                            {lastWateredDate
                                ? formatDistanceToNow(lastWateredDate, {
                                      addSuffix: true,
                                  })
                                : 'Never'}
                        </Text>
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default function ScheduleScreen() {
    const [plants, setPlants] = useState<Plant[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

    const fetchPlants = async () => {
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
            setIsRefreshing(false)
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
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            {plants.length === 0 ? (
                <EmptyState />
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => {
                                setIsRefreshing(true)
                                fetchPlants()
                            }}
                            colors={[COLOR_PRIMARY]}
                        />
                    }
                >
                    {plants.map((plant) => (
                        <PlantCard key={plant.id} plant={plant} />
                    ))}
                </ScrollView>
            )}
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
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    scheduleCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 12,
    },
    plantInfo: {
        flex: 1,
        gap: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    plantDetails: {
        gap: 2,
    },
    plantName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E3440',
    },
    plantSpecies: {
        fontSize: 14,
        color: '#4C566A',
    },
    scheduleInfo: {
        padding: 16,
        paddingTop: 12,
        backgroundColor: '#F8FAFC',
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    scheduleItem: {
        flex: 1,
    },
    scheduleLabel: {
        fontSize: 12,
        color: '#6C7A89',
        marginBottom: 4,
    },
    scheduleValue: {
        fontSize: 14,
        color: '#2E3440',
        fontWeight: '500',
    },
    lastWateredRow: {
        borderTopWidth: 1,
        borderTopColor: '#E5E9F0',
        paddingTop: 12,
    },
    lastWateredText: {
        fontSize: 12,
        color: '#6C7A89',
    },
    lastWateredValue: {
        color: '#4C566A',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyStateIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F4F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2E3440',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#4C566A',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLOR_PRIMARY,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
    },
})
