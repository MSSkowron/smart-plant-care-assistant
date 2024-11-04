import React, { useState, useEffect } from 'react'
import {
    Text,
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { Plant, supabase } from '@/utils/supabase'
import { useAuth } from '@/contextes/AuthContext'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import { COLOR_PRIMARY } from '@/assets/colors'

export default function PlantsScreen() {
    const { session } = useAuth()
    const userID = session!.user.id

    const [plants, setPlants] = useState<Plant[]>([])
    const [plantImages, setPlantImages] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const fetchPlants = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('plants')
                .select('*')
                .returns<Plant[]>()
            if (error) throw error
            setPlants(data)
        } catch (err) {
            const errorMessage =
                String(err)?.replace(/^Error:\s*/, '') ||
                'An unexpected error occurred. Please try again.'

            Alert.alert('Error', errorMessage, [{ text: 'OK' }])
        } finally {
            setLoading(false)
        }
    }

    const fetchImages = async () => {
        setLoading(true)
        const { data, error } = await supabase.storage
            .from('user-plant-images')
            .list(userID)

        if (error) {
            const errorMessage =
                error.message?.replace(/^Error:\s*/, '') ||
                'An unexpected error occurred. Please try again.'

            Alert.alert('Error', errorMessage, [{ text: 'OK' }])
        } else {
            const imagesByPlant: Record<string, string> = {}

            await Promise.all(
                data?.map(async (file) => {
                    const fileName = file.name
                    if (fileName === '.emptyFolderPlaceholder') {
                        return
                    }

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
        setLoading(false)
    }

    const handleRealtimePlantsDataChange = async (payload: any) => {
        setLoading(true)
        switch (payload.eventType) {
            case 'INSERT':
                setPlants((prevPlants) => [...prevPlants, payload.new])
                break
            case 'UPDATE':
                setPlants((prevPlants) =>
                    prevPlants.map((plant) =>
                        plant.id === payload.new.id ? payload.new : plant,
                    ),
                )
                break
            case 'DELETE':
                setPlants((prevPlants) =>
                    prevPlants.filter((plant) => plant.id !== payload.old.id),
                )
                break
            default:
                break
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchPlants()
        fetchImages()

        const subscription = supabase
            .channel('public:plants')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'plants' },
                (payload) => {
                    handleRealtimePlantsDataChange(payload)
                },
            )
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

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

    const renderPlantItem = ({ item }: { item: Plant }) => (
        <TouchableOpacity style={styles.plantTouchable} activeOpacity={0.7}>
            <Link
                href={{
                    pathname: '/plantDetails',
                    params: {
                        name: item.name,
                        species: item.species,
                        lightRequirements: item.light_requirements,
                        wateringFrequency: item.watering_frequency,
                        createdAt: item.created_at,
                        image: plantImages[item.name],
                    },
                }}
                asChild
            >
                <Pressable>
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
                                        name="water-outline"
                                        size={16}
                                        color={COLOR_PRIMARY}
                                    />
                                    <Text style={styles.detailText}>
                                        {item.watering_frequency}
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
                        <View>
                            <Image
                                source={{
                                    uri:
                                        plantImages[item.name] ||
                                        'https://via.placeholder.com/90',
                                }}
                                style={styles.imagePreview}
                                transition={300}
                            />
                        </View>
                    </View>
                </Pressable>
            </Link>
        </TouchableOpacity>
    )

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Your plants</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Link href={'/addPlant'}>
                        <Ionicons
                            name="add-circle-outline"
                            size={30}
                            color="#fff"
                        />
                    </Link>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLOR_PRIMARY} />
                </View>
            ) : (
                <FlatList
                    data={plants}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPlantItem}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    plantTouchable: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#FFF',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        flex: 1,
    },
    plantContainer: {
        flexDirection: 'row',
        padding: 12,
    },
    imagePreview: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: '#F5F7FA',
    },
    plantInfo: {
        flex: 1,
        justifyContent: 'flex-start',
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
    },
})
