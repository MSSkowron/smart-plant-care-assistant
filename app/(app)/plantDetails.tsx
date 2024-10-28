import React from 'react'
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { COLOR_PRIMARY, COLOR_SECONDARY } from '@/assets/colors'

export default function PlantDetails() {
    const {
        name,
        species,
        lightRequirements,
        wateringFrequency,
        createdAt,
        image,
    } = useLocalSearchParams()

    const imageString = image as string

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.subTitle}>{species}</Text>
            <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Watering Frequency: </Text>
                    {wateringFrequency}
                </Text>
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Light Requirements: </Text>
                    {lightRequirements}
                </Text>
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Added on: </Text>
                    {formatDate(createdAt as string)}
                </Text>
            </View>
            <View style={styles.imageContainer}>
                <Text style={styles.photoTitle}>Photo</Text>
                {imageString.length > 0 ? (
                    <Image source={{ uri: imageString }} style={styles.image} />
                ) : (
                    <Text style={styles.noImageText}>No photo available</Text>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#FAFAFA',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: COLOR_PRIMARY,
    },
    subTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: COLOR_SECONDARY,
        marginBottom: 10,
    },
    detailsContainer: {
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        color: '#555',
    },
    detailLabel: {
        fontWeight: 'bold',
        color: '#333',
    },
    photoTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLOR_PRIMARY,
    },
    imageContainer: {
        gap: 5,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    noImageText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
})
