import React, { useState, useEffect } from 'react'
import {
    Text,
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Platform,
    RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Plant, supabase } from '@/utils/supabase'
import { useAuth } from '@/contextes/AuthContext'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_PRIMARY } from '@/assets/colors'
import { getNextWateringDate } from '@/utils/utils'

interface WateringStatus {
    daysUntil: number
    isOverdue: boolean
    status: 'OVERDUE' | 'NEEDS_WATER' | 'TOMORROW' | 'OK'
    message: string
}

const getDaysUntilWatering = (plant: Plant): WateringStatus => {
    if (!plant.last_watered) {
        return {
            daysUntil: 0,
            isOverdue: true,
            status: 'NEEDS_WATER',
            message: 'Needs water now',
        }
    }

    const lastWatered = new Date(plant.last_watered)
    const now = new Date()

    const diffTime = now.getTime() - lastWatered.getTime()
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const daysUntil = plant.watering_frequency - daysPassed

    if (daysUntil < 0) {
        return {
            daysUntil: Math.abs(daysUntil),
            isOverdue: true,
            status: 'OVERDUE',
            message: `Overdue by ${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'day' : 'days'}`,
        }
    }

    if (daysUntil === 0) {
        return {
            daysUntil: 0,
            isOverdue: false,
            status: 'NEEDS_WATER',
            message: 'Needs water today',
        }
    }

    if (daysUntil === 1) {
        return {
            daysUntil: 1,
            isOverdue: false,
            status: 'TOMORROW',
            message: 'Needs water tomorrow',
        }
    }

    return {
        daysUntil,
        isOverdue: false,
        status: 'OK',
        message: `Water in ${daysUntil} days`,
    }
}

const getWateringStatusStyle = (status: WateringStatus) => {
    switch (status.status) {
        case 'OVERDUE':
            return {
                icon: 'water',
                iconColor: '#EF4444',
                textColor: '#EF4444',
                showWaterButton: true,
            }
        case 'NEEDS_WATER':
            return {
                icon: 'water',
                iconColor: '#EAB308',
                textColor: '#EAB308',
                showWaterButton: true,
            }
        case 'TOMORROW':
            return {
                icon: 'water-outline',
                iconColor: '#0EA5E9',
                textColor: '#0EA5E9',
                showWaterButton: false,
            }
        default:
            return {
                icon: 'water-outline',
                iconColor: COLOR_PRIMARY,
                textColor: '#4C566A',
                showWaterButton: false,
            }
    }
}

export default function MyPlantsScreen() {
    const { session } = useAuth()
    const router = useRouter()
    const userID = session!.user.id

    const [plants, setPlants] = useState<Plant[]>([])
    const [plantImages, setPlantImages] = useState<Record<string, string>>({})
    const [searchQuery, setSearchQuery] = useState('')

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isRefreshing, setIsRefreshing] = React.useState(false)

    const fetchPlants = async () => {
        try {
            const { data, error } = await supabase
                .from('plants')
                .select('*')
                .returns<Plant[]>()
            if (error) throw error
            setPlants(data)
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to fetch plants')
        } finally {
            setIsRefreshing(false)
            setIsLoading(false)
        }
    }

    const fetchImages = async () => {
        const { data, error } = await supabase.storage
            .from('user-plant-images')
            .list(userID)

        if (error) {
            Alert.alert('Error', 'Failed to fetch images')
        } else {
            const imagesByPlant: Record<string, string> = {}
            await Promise.all(
                data?.map(async (file) => {
                    const fileName = file.name
                    if (fileName === '.emptyFolderPlaceholder') return

                    const plantName = fileName.split('.')[0]
                    const { data: publicData } = supabase.storage
                        .from('user-plant-images')
                        .getPublicUrl(`${userID}/${fileName}`)

                    if (publicData.publicUrl) {
                        imagesByPlant[plantName] = publicData.publicUrl
                    }
                }) || [],
            )
            setPlantImages(imagesByPlant)
        }
    }

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

    useEffect(() => {
        const fetch = async () => {
            await fetchPlants()
            await fetchImages()
        }

        const subscription = supabase
            .channel('public:plants')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'plants' },
                (payload) => {
                    switch (payload.eventType) {
                        case 'INSERT':
                            setPlants((prev) => [...prev, payload.new as Plant])
                            break
                        case 'UPDATE':
                            setPlants((prev) =>
                                prev.map((plant) =>
                                    plant.id === payload.new.id
                                        ? (payload.new as Plant)
                                        : plant,
                                ),
                            )
                            break
                        case 'DELETE':
                            setPlants((prev) =>
                                prev.filter(
                                    (plant) => plant.id !== payload.old.id,
                                ),
                            )
                            break
                    }
                },
            )
            .subscribe()

        fetch()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    const renderPlantItem = ({ item }: { item: Plant }) => {
        const wateringStatus = getDaysUntilWatering(item)
        const statusStyle = getWateringStatusStyle(wateringStatus)

        return (
            <TouchableOpacity
                style={styles.plantTouchable}
                activeOpacity={0.7}
                onPress={() =>
                    router.push({
                        pathname: '/plantDetails',
                        params: {
                            id: item.id,
                            name: item.name,
                            species: item.species,
                            lightRequirements: item.light_requirements,
                            wateringFrequency: item.watering_frequency,
                            lastWatered: item.last_watered,
                            createdAt: item.created_at,
                            image: plantImages[item.name],
                        },
                    })
                }
            >
                <View style={styles.plantContainer}>
                    <View style={styles.plantInfo}>
                        <Text style={styles.plantName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={styles.plantSpecies} numberOfLines={1}>
                            {item.species}
                        </Text>
                        <View style={styles.plantDetails}>
                            <View style={styles.detailItem}>
                                <Ionicons
                                    name={statusStyle.icon}
                                    size={16}
                                    color={statusStyle.iconColor}
                                />
                                <Text
                                    style={[
                                        styles.detailText,
                                        { color: statusStyle.textColor },
                                    ]}
                                >
                                    {wateringStatus.message}
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons
                                    name="sunny-outline"
                                    size={16}
                                    color={COLOR_PRIMARY}
                                />
                                <Text style={styles.detailText}>
                                    {item.light_requirements}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.rightContainer}>
                        <Image
                            source={{
                                uri:
                                    plantImages[item.name] ||
                                    'https://via.placeholder.com/90',
                            }}
                            style={styles.imagePreview}
                            transition={300}
                        />
                        {statusStyle.showWaterButton && (
                            <TouchableOpacity
                                style={[
                                    styles.waterButton,
                                    { backgroundColor: statusStyle.iconColor },
                                ]}
                                onPress={() => handleWaterPlant(item)}
                            >
                                <Ionicons
                                    name="water"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR_PRIMARY} />
            </View>
        )
    }

    const renderHeader = () => (
        <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#4C566A" />
            <TextInput
                style={styles.searchInput}
                placeholder="Search your plants..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close-circle" size={20} color="#4C566A" />
                </TouchableOpacity>
            )}
        </View>
    )

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={64} color={COLOR_PRIMARY} />
            <Text style={styles.emptyStateTitle}>
                You don't have any plants yet
            </Text>
            <Text style={styles.emptyStateSubtitle}>
                Add your first plant by clicking the "+" button
            </Text>
        </View>
    )

    const filteredPlants = plants.filter(
        (plant) =>
            plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plant.species.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Your Plants</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.push('/addPlant')}
                >
                    <Ionicons
                        name="add-circle-outline"
                        size={30}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredPlants}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPlantItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => {
                            setIsRefreshing(true)
                            fetchPlants()
                        }}
                        tintColor={COLOR_PRIMARY}
                        colors={[COLOR_PRIMARY]}
                    />
                }
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
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
        ...Platform.select({
            ios: {
                shadowColor: COLOR_PRIMARY,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        marginRight: 8,
        fontSize: 16,
        color: '#2E3440',
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 32,
    },
    plantTouchable: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#FFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    plantContainer: {
        flexDirection: 'row',
        padding: 12,
    },
    plantInfo: {
        flex: 1,
        justifyContent: 'flex-start',
        marginRight: 12,
    },
    rightContainer: {
        alignItems: 'center',
        gap: 8,
    },
    imagePreview: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: '#F5F7FA',
    },
    waterButton: {
        backgroundColor: '#3B82F6',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    plantName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E3440',
        marginBottom: 4,
    },
    plantSpecies: {
        fontSize: 14,
        color: '#4C566A',
        marginBottom: 8,
    },
    plantDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: '#4C566A',
    },
    wateringAlert: {
        color: '#3B82F6',
        fontWeight: '500',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E3440',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#4C566A',
        textAlign: 'center',
        marginBottom: 24,
    },
})
