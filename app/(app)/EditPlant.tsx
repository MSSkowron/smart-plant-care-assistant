import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import { plantData } from '@/app/(app)/addPlant'
import { COLOR_PRIMARY } from '@/assets/colors'
import { supabase } from '@/utils/supabase'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function EditPlant() {
    const { id, name, species, lightRequirements, wateringFrequency, image } =
        useLocalSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [plantData, setPlantData] = useState<plantData>({
        name: name as string,
        species: species as string,
        lightRequirements: 'Low',
        wateringFrequency: wateringFrequency as string,
    })

    const fields = [
        { label: 'Plant Name', key: 'name', iniVal: name },
        { label: 'Species', key: 'species', iniVal: species },
        {
            label: 'Watering Frequency (days)',
            key: 'wateringFrequency',
            iniVal: wateringFrequency,
        },
    ] as const

    const handleInputChange = (
        field: keyof typeof plantData,
        value: string,
    ) => {
        setPlantData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleEditPlant = async () => {
        setLoading(true)
        try {
            await supabase
                .from('plants')
                .update({
                    name: plantData.name ?? (name as string),
                    species: plantData.species ?? (species as string),
                    light_requirements:
                        plantData.lightRequirements ??
                        (lightRequirements as string),
                    watering_frequency: parseInt(
                        plantData.wateringFrequency ??
                            (wateringFrequency as string),
                        10,
                    ),
                })
                .eq('id', parseInt(id as string, 10))
            Alert.alert('Success', 'Plant editted successfully!', [
                { text: 'OK', onPress: () => router.navigate('/plants') },
            ])
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            <View style={styles.imageSection}>
                <Image
                    source={{ uri: image as string }}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                />
            </View>
            <View style={styles.formContainer}>
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
                <View>
                    <Text style={styles.label}>Light Requirements</Text>
                    <View
                        style={
                            (styles.inputContainer, styles.light_requirements)
                        }
                    >
                        <Picker
                            itemStyle={styles.input}
                            selectedValue={lightRequirements as string}
                            onValueChange={(itemValue, itemIndex) =>
                                handleInputChange(
                                    'lightRequirements',
                                    itemValue,
                                )
                            }
                        >
                            <Picker.Item label="Low" value="Low" />
                            <Picker.Item label="Moderate" value="Moderate" />
                            <Picker.Item label="High" value="High" />
                        </Picker>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleEditPlant}
                >
                    <Text style={styles.submitButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
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
    imageSection: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.8,
        backgroundColor: '#FFF',
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    image: {
        flex: 1,
        width: '100%',
        backgroundColor: '#F8FAFC',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 6,
    },
    inputContainer: {
        marginBottom: 16,
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
    light_requirements: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
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
})
