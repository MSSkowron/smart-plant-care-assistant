import React, { useState, useEffect } from 'react'
import {
    Text,
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useLocalSearchParams } from 'expo-router'
import { Plant, supabase } from '@/utils/supabase'
import { useAuth } from '@/contextes/AuthContext'
import { Image } from 'expo-image'

export default function PlantsScreen() {
    const { session } = useAuth()
    const userID = session!.user.id

    const [plants, setPlants] = useState<Plant[]>([])
    const [plantImages, setPlantImages] = useState<Record<string, string[]>>({})

    const params = useLocalSearchParams()
    const { imageURI, plantName, plantIndex } = params

    useEffect(() => {
        const uploadImage = async () => {
            try {
                if (!imageURI || imageURI.length === 0) return

                console.log('Uploading image', imageURI, plantName, plantIndex)

                const response = await fetch(String(imageURI))
                if (!response.ok) throw new Error('Failed to fetch image.')

                const blob = await response.blob()
                const arrayBuffer = await new Response(blob).arrayBuffer()

                const fileName = `${userID}/${plantName}-${plantIndex}.jpg`

                const { data, error } = await supabase.storage
                    .from('user-plant-images')
                    .upload(fileName, arrayBuffer, {
                        contentType: 'image/jpeg',
                        upsert: false,
                    })

                if (error) {
                    console.error('Error uploading image:', error.message)
                } else {
                    console.log('Image uploaded successfully:', data)
                    fetchImages()
                }
            } catch (err) {
                console.error('Image upload failed:', String(err))
            }
        }

        uploadImage()
    }, [params])

    const fetchPlants = async () => {
        const { data, error } = await supabase
            .from('plants')
            .select('*')
            .returns<Plant[]>()

        if (error) {
            console.error(error)
        } else {
            setPlants(data)
        }
    }

    const fetchImages = async () => {
        const { data, error } = await supabase.storage
            .from('user-plant-images')
            .list(userID)

        if (error) {
            console.error('Error fetching images:', error.message)
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
    }

    const handleRealtimeChange = (payload: any) => {
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
                    handleRealtimeChange(payload)
                },
            )
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={plants}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.plantContainer}>
                        <Text style={styles.plantItem}>{item.name}</Text>

                        {[0, 1, 2].map((index) => (
                            <View key={index} style={styles.imageContainer}>
                                {plantImages[item.name] &&
                                plantImages[item.name][index] ? (
                                    <Image
                                        source={{
                                            uri: plantImages[item.name][index],
                                        }}
                                        style={styles.imagePreview}
                                    />
                                ) : (
                                    <TouchableOpacity>
                                        <Link
                                            href={{
                                                pathname: '/camera',
                                                params: {
                                                    plantName: item.name,
                                                    plantIndex: index,
                                                },
                                            }}
                                        >
                                            <Text>Add image!</Text>
                                        </Link>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    plantContainer: {
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    plantItem: {
        fontSize: 18,
        marginVertical: 10,
    },
    imageContainer: {
        marginVertical: 5,
    },
    imagePreview: {
        width: 100,
        height: 100,
    },
})
