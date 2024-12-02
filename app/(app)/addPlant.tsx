import React, { useEffect, useState } from 'react'
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/contextes/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useImage } from '@/store/hooks'
import { COLOR_PRIMARY } from '@/assets/colors'
import { useNotifications } from '@/hooks/useNotification'

interface plantData {
    name: string | undefined
    species: string | undefined
    lightRequirements: string | undefined
    wateringFrequency: string | undefined
}

const plantNetAPIKey = process.env.EXPO_PUBLIC_PLANTNET_API_KEY || ''
const { width } = Dimensions.get('window')

export default function AddPlant() {
    const { scheduleNotifications, cancelNotifications, notificationState } =
        useNotifications()
    const router = useRouter()
    const { session } = useAuth()
    const userID = session!.user.id

    const { image, updateImage, clearImage } = useImage()

    const [loading, setLoading] = useState(false)
    const [plantData, setPlantData] = useState<plantData>({
        name: undefined,
        species: undefined,
        lightRequirements: undefined,
        wateringFrequency: undefined,
    })

    useEffect(() => {
        clearImage() // when initializing component clear image
    }, [])

    useEffect(() => {
        if (image) {
            identifyPlant(image)
        }
    }, [image])

    const handleImageSelection = async (source: 'camera' | 'gallery') => {
        try {
            if (source === 'gallery') {
                const { status } =
                    await ImagePicker.requestMediaLibraryPermissionsAsync()
                if (status !== 'granted') {
                    Alert.alert(
                        'Permission needed',
                        'Sorry, we need media library permissions to make this work!',
                    )
                    return
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsMultipleSelection: false,
                    allowsEditing: true,
                    quality: 1,
                })

                if (!result.canceled) {
                    updateImage(result.assets[0].uri)
                }
            } else {
                router.navigate('/camera')
            }
        } catch (error) {
            handleError(error)
        }
    }

    const identifyPlant = async (imageUri: string) => {
        setLoading(true)
        try {
            const project = 'all'
            const endpoint = `https://my-api.plantnet.org/v2/identify/${project}?api-key=${plantNetAPIKey}`

            const filename = imageUri.split('/').pop() || 'photo.jpg'
            const match = /\.(\w+)$/.exec(filename)
            const type = match ? `image/${match[1]}` : 'image/jpeg'

            const formData = new FormData()
            formData.append('images', {
                uri: imageUri,
                name: filename,
                type,
            } as any)
            formData.append('organs', 'auto')

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(
                    `Failed to identify plant. Status: ${response.status}`,
                )
            }

            const data = await response.json()
            const family =
                data.results[0].species.family.scientificNameWithoutAuthor
            const genus =
                data.results[0].species.genus.scientificNameWithoutAuthor

            setPlantData((prev) => ({
                ...prev,
                species: `${family} - ${genus}`,
            }))
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false)
        }
    }

    const uploadImage = async (imageURI: string) => {
        const response = await fetch(imageURI)
        if (!response.ok) throw new Error('Failed to fetch image.')

        const blob = await response.blob()
        const arrayBuffer = await new Response(blob).arrayBuffer()
        const fileName = `${userID}/${plantData.name}.jpg`

        const { error } = await supabase.storage
            .from('user-plant-images')
            .upload(fileName, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
            })

        if (error) throw new Error(error.message)
    }

    const handleInputChange = (
        field: keyof typeof plantData,
        value: string,
    ) => {
        setPlantData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const validateForm = (): boolean => {
        const { name, species, lightRequirements, wateringFrequency } =
            plantData
        if (
            !name ||
            !species ||
            !lightRequirements ||
            !wateringFrequency ||
            !image
        ) {
            Alert.alert('Warning', 'Please fill all fields and add an image')
            return false
        }
        return true
    }

    const handleAddPlant = async () => {
        if (!validateForm()) return

        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('plants')
                .insert({
                    name: plantData.name!,
                    species: plantData.species!,
                    light_requirements: plantData.lightRequirements!,
                    watering_frequency: parseInt(
                        plantData.wateringFrequency!,
                        10,
                    ),
                    user_id: userID,
                    last_watered: new Date().toDateString(),
                })
                .select()
                .single()

            if (error) throw new Error(error.message)

            // Schedule notifications for the new plant
            if (data) {
                await scheduleNotifications(data)
            }

            await uploadImage(image!)
            Alert.alert('Success', 'Plant added successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ])
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleError = (error: unknown) => {
        const errorMessage =
            String(error)?.replace(/^Error:\s*/, '') ||
            'An unexpected error occurred. Please try again.'
        Alert.alert('Error', errorMessage)
    }

    const fields = [
        { label: 'Plant Name', key: 'name' },
        { label: 'Species', key: 'species' },
        { label: 'Light Requirements', key: 'lightRequirements' },
        { label: 'Watering Frequency (days)', key: 'wateringFrequency' },
    ] as const

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#34D399" />
                    <Text style={styles.loadingText}>
                        Processing your plant...
                    </Text>
                </View>
            ) : (
                <>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add New Plant</Text>
                        <Text style={styles.subtitle}>
                            Identify your plant or fill in the details
                        </Text>
                    </View>

                    <View style={styles.imageSection}>
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                style={styles.previewImage}
                                contentFit="contain"
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons
                                    name="leaf-outline"
                                    size={50}
                                    color="#9CA3AF"
                                />
                                <Text style={styles.placeholderText}>
                                    No image selected
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.cameraSection}>
                        <View style={styles.cameraButtons}>
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={() => handleImageSelection('camera')}
                            >
                                <Ionicons
                                    name="camera-outline"
                                    size={24}
                                    color="#ffffff"
                                />
                                <Text style={styles.buttonLabel}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={() => handleImageSelection('gallery')}
                            >
                                <Ionicons
                                    name="images-outline"
                                    size={24}
                                    color="#ffffff"
                                />
                                <Text style={styles.buttonLabel}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Plant Details</Text>
                        {fields.map(({ label, key }) => (
                            <View key={key} style={styles.inputContainer}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    placeholderTextColor="#9CA3AF"
                                    style={styles.input}
                                    value={plantData[key]}
                                    onChangeText={(value) =>
                                        handleInputChange(key, value)
                                    }
                                    keyboardType={
                                        key === 'wateringFrequency'
                                            ? 'numeric'
                                            : 'default'
                                    }
                                />
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleAddPlant}
                        >
                            <Text style={styles.submitButtonText}>
                                Add Plant
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </ScrollView>
    )
}

const buttonBaseStyle = {
    backgroundColor: COLOR_PRIMARY,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F9FAFB',
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 400,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '500',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
    },
    imageSection: {
        margin: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    previewImage: {
        width: '100%',
        height: width * 0.6,
        borderRadius: 16,
    },
    imagePlaceholder: {
        width: '100%',
        height: width * 0.6,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    placeholderText: {
        marginTop: 12,
        fontSize: 16,
        color: '#9CA3AF',
    },
    cameraSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    cameraButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    cameraButton: {
        ...buttonBaseStyle,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        flex: 1,
        justifyContent: 'center',
        gap: 8,
    },
    buttonLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 20,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 6,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        color: '#111827',
    },
    submitButton: {
        ...buttonBaseStyle,
        paddingVertical: 16,
        marginTop: 24,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
})
