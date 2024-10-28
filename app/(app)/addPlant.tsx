import React, { useEffect, useState } from 'react'
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/contextes/AuthContext'
import { Ionicons } from '@expo/vector-icons'

export default function AddPlant() {
    const router = useRouter()
    const { session } = useAuth()
    const userID = session!.user.id

    const [loading, setLoading] = useState(false)

    const [plantName, setPlantName] = useState('')
    const [species, setSpecies] = useState('')
    const [lightRequirements, setLightRequirements] = useState('')
    const [wateringFrequency, setWateringFrequency] = useState('')

    const params = useLocalSearchParams()
    const { imageURI } = params

    const identifyImage = async (imageURI: string) => {
        setLoading(true)
        try {
            const apiKey = process.env.EXPO_PUBLIC_PLANTNET_API_KEY || ''
            const project = 'all'
            const endpoint = `https://my-api.plantnet.org/v2/identify/${project}?api-key=${apiKey}`

            const response = await fetch(imageURI)
            if (!response.ok) throw new Error('Failed to fetch image.')

            const blob = await response.blob()

            const formData = new FormData()
            formData.append('images', blob)

            const identifyResponse = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            })

            if (!identifyResponse.ok)
                throw new Error('Failed to identify plant.')
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

    useEffect(() => {
        if (imageURI && imageURI.length > 0) {
            identifyImage(imageURI as string)
        }
    }, [imageURI])

    useEffect(() => {
        return () => {
            router.setParams({})
        }
    }, [])

    const handleAddPlant = async () => {
        if (
            !plantName ||
            !species ||
            !lightRequirements ||
            !wateringFrequency
        ) {
            Alert.alert('Warning', 'Please fill all fields', [{ text: 'OK' }])
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.from('plants').insert({
                name: plantName,
                species,
                light_requirements: lightRequirements,
                watering_frequency: parseInt(wateringFrequency, 10),
                user_id: userID,
            })

            if (error) {
                const errorMessage =
                    String(error)?.replace(/^Error:\s*/, '') ||
                    'An unexpected error occurred. Please try again.'

                Alert.alert('Error', errorMessage, [{ text: 'OK' }])
            } else {
                Alert.alert('Success', 'Plant added successfully!', [
                    { text: 'OK' },
                ])
                router.back()
            }
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size="large" color="#228B22" />
                </View>
            ) : (
                <>
                    <Text style={styles.subtitle}>
                        Identify your plant or fill in the details
                    </Text>

                    <View style={styles.cameraSection}>
                        <TouchableOpacity style={styles.cameraButton}>
                            <Link
                                href={{
                                    pathname: '/camera',
                                    params: { previousScreen: '/addPlant' },
                                }}
                                style={styles.cameraLink}
                            >
                                <Ionicons
                                    name="camera-outline"
                                    size={50}
                                    color="#ffffff"
                                />
                            </Link>
                        </TouchableOpacity>
                        <Text style={styles.cameraText}>
                            Use AI to Identify Plant
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {[
                            'Plant Name',
                            'Species',
                            'Light Requirements',
                            'Watering Frequency (days)',
                        ].map((label, index) => (
                            <View key={index} style={styles.inputContainer}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    placeholderTextColor="#888"
                                    style={styles.input}
                                    value={
                                        [
                                            plantName,
                                            species,
                                            lightRequirements,
                                            wateringFrequency,
                                        ][index]
                                    }
                                    onChangeText={
                                        [
                                            setPlantName,
                                            setSpecies,
                                            setLightRequirements,
                                            setWateringFrequency,
                                        ][index]
                                    }
                                    keyboardType={
                                        label.includes('days')
                                            ? 'numeric'
                                            : 'default'
                                    }
                                />
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAddPlant}
                        >
                            <Text style={styles.buttonText}>Add Plant</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        color: '#444',
        marginBottom: 20,
    },
    cameraSection: {
        alignItems: 'center',
        marginBottom: 25,
    },
    cameraButton: {
        backgroundColor: '#2e8b57',
        borderRadius: 50,
        padding: 15,
        elevation: 3,
    },
    cameraLink: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    form: {
        marginTop: 15,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        color: '#666',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        elevation: 2,
    },
    button: {
        backgroundColor: '#2e8b57',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
})
