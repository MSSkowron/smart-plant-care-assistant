import React, { useState, useEffect } from 'react'
import {
    Text,
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
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

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size="large" color={'#228B22'} />
                </View>
            ) : (
                <>
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

                    <FlatList
                        data={plants}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity>
                                <Link
                                    href={{
                                        pathname: '/plantDetails',
                                        params: {
                                            name: item.name,
                                            species: item.species,
                                            lightRequirements:
                                                item.light_requirements,
                                            wateringFrequency:
                                                item.watering_frequency,
                                            createdAt: item.created_at,
                                            image: plantImages[item.name],
                                        },
                                    }}
                                >
                                    <View style={styles.plantContainer}>
                                        <View style={styles.plantHeader}>
                                            <Text style={styles.plantName}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.plantSpecies}>
                                                {item.species}
                                            </Text>
                                        </View>
                                        <View style={styles.plantImage}>
                                            <Image
                                                source={{
                                                    uri: plantImages[item.name],
                                                }}
                                                style={styles.imagePreview}
                                            />
                                        </View>
                                    </View>
                                </Link>
                            </TouchableOpacity>
                        )}
                    />
                </>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#222',
    },
    headerButton: {
        width: 48,
        height: 48,
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plantContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    plantHeader: {
        flex: 1,
    },
    plantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    plantSpecies: {
        fontSize: 14,
        color: '#666',
    },
    plantImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePreview: {
        width: 90,
        height: 90,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: '#CCC',
    },
})
