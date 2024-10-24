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
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { Plant, supabase } from '@/utils/supabase'
import { useAuth } from '@/contextes/AuthContext'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import { COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TERTIARY } from '@/assets/colors'

export default function PlantsScreen() {
    const { session } = useAuth()
    const userID = session!.user.id

    const [plants, setPlants] = useState<Plant[]>([])
    const [plantImages, setPlantImages] = useState<Record<string, string[]>>({})

    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const params = useLocalSearchParams()
    const { imageURI, plantName, plantIndex } = params

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
            const imagesByPlant: Record<string, string[]> = {}

            await Promise.all(
                data?.map(async (file) => {
                    const fileName = file.name.split('.')[0]
                    const [plantName, index] = fileName.split('-')
                    const { data: publicData } = supabase.storage
                        .from('user-plant-images')
                        .getPublicUrl(`${userID}/${file.name}`)

                    if (publicData.publicUrl) {
                        if (!imagesByPlant[plantName]) {
                            imagesByPlant[plantName] = []
                        }
                        imagesByPlant[plantName][parseInt(index, 10)] =
                            publicData.publicUrl
                    }
                }) || [],
            )
            setPlantImages(imagesByPlant)
        }
        setLoading(false)
    }

    const uploadImage = async (
        imageURI: string,
        plantName: string,
        plantIndex: string,
        userID: string,
    ) => {
        setLoading(true)
        try {
            const response = await fetch(String(imageURI))
            if (!response.ok) throw new Error('Failed to fetch image.')

            const blob = await response.blob()
            const arrayBuffer = await new Response(blob).arrayBuffer()

            const fileName = `${userID}/${plantName}-${plantIndex}.jpg`

            const { error } = await supabase.storage
                .from('user-plant-images')
                .upload(fileName, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: false,
                })

            if (error) {
                const errorMessage =
                    error.message?.replace(/^Error:\s*/, '') ||
                    'An unexpected error occurred. Please try again.'

                Alert.alert('Error', errorMessage, [{ text: 'OK' }])
            } else {
                Alert.alert('Success', 'Image uploaded successfully!', [
                    { text: 'OK' },
                ])
                fetchImages()
            }
        } catch (err) {
            const errorMessage =
                String(err)?.replace(/^Error:\s*/, '') ||
                'An unexpected error occurred. Please try again.'

            Alert.alert('Error', errorMessage, [{ text: 'OK' }])
        } finally {
            router.setParams({})
            setLoading(false)
        }
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
        if (imageURI && imageURI.length > 0) {
            uploadImage(
                imageURI as string,
                plantName as string,
                plantIndex as string,
                userID,
            )
        }
    }, [imageURI, plantName, plantIndex])

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
            router.setParams({})
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
                        data={plants}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.plantContainer}>
                                <View style={styles.plantHeader}>
                                    <Text style={styles.plantName}>
                                        {item.name}
                                    </Text>
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
                                                    images: plantImages[
                                                        item.name
                                                    ],
                                                },
                                            }}
                                        >
                                            <View style={styles.detailsButton}>
                                                <Text
                                                    style={
                                                        styles.detailsButtonText
                                                    }
                                                >
                                                    Details
                                                </Text>
                                                <Ionicons
                                                    name="search-outline"
                                                    size={24}
                                                    color="white"
                                                    style={
                                                        styles.detailsButtonIcon
                                                    }
                                                />
                                            </View>
                                        </Link>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.imageRow}>
                                    {[0, 1, 2].map((index) => (
                                        <View
                                            key={index}
                                            style={styles.imageContainer}
                                        >
                                            {plantImages[item.name] &&
                                            plantImages[item.name][index] ? (
                                                <Image
                                                    source={{
                                                        uri: plantImages[
                                                            item.name
                                                        ][index],
                                                    }}
                                                    style={styles.imagePreview}
                                                />
                                            ) : (
                                                <TouchableOpacity
                                                    style={
                                                        styles.addImageButton
                                                    }
                                                >
                                                    <Link
                                                        href={{
                                                            pathname: '/camera',
                                                            params: {
                                                                plantName:
                                                                    item.name,
                                                                plantIndex:
                                                                    index,
                                                                previousScreen:
                                                                    '/plants',
                                                            },
                                                        }}
                                                    >
                                                        <Ionicons
                                                            name="camera-outline"
                                                            size={24}
                                                            color="white"
                                                        />
                                                    </Link>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
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
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerButton: {
        width: 50,
        height: 50,
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plantContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    plantHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    plantName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: COLOR_SECONDARY,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailsButtonIcon: {
        color: '#fff',
        fontWeight: 'bold',
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    imageContainer: {
        marginVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePreview: {
        width: 90,
        height: 90,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    addImageButton: {
        padding: 10,
        backgroundColor: COLOR_TERTIARY,
        borderRadius: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    addImageText: {
        fontSize: 14,
        color: '#fff',
    },
})
