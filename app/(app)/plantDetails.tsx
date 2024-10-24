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
        images,
    } = useLocalSearchParams()

    let imagesList: string[] = []
    if (!images || images.length === 0) {
        imagesList = []
    } else {
        imagesList = (images as string)
            .split(',')
            .filter((imageURI) => imageURI.length > 0)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.subTitle}>{species}</Text>
            <Text style={styles.detailText}>
                Watering Frequency: {wateringFrequency}
            </Text>
            <Text style={styles.detailText}>
                Light Requirements: {lightRequirements}
            </Text>
            <Text style={styles.detailText}>
                Added on: {formatDate(createdAt as string)}
            </Text>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.imageContainer}>
                {imagesList.length > 0 ? (
                    imagesList.map((imageUrl, index) => (
                        <Image
                            key={index}
                            source={{ uri: imageUrl }}
                            style={styles.image}
                        />
                    ))
                ) : (
                    <Text style={styles.noImageText}>No photos available</Text>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: COLOR_PRIMARY,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLOR_PRIMARY,
        marginBottom: 8,
    },
    subTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: COLOR_SECONDARY,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLOR_PRIMARY,
        marginTop: 16,
        marginBottom: 8,
    },
    detailText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 4,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    image: {
        width: 170,
        height: 170,
        borderRadius: 10,
        marginBottom: 10,
    },
    noImageText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        width: '100%',
        marginTop: 10,
    },
})
