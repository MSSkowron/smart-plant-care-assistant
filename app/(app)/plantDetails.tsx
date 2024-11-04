import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import {
    COLOR_PRIMARY,
    COLOR_SECONDARY,
    COLOR_TEXT_PRIMARY,
    COLOR_TEXT_SECONDARY,
} from '@/assets/colors'
import { Ionicons } from '@expo/vector-icons'

const SCREEN_WIDTH = Dimensions.get('window').width

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

    const renderDetailCard = (
        icon: string,
        title: string,
        value: string,
        color: string = COLOR_PRIMARY,
    ) => (
        <View style={styles.detailCard}>
            <Ionicons
                name={icon as any}
                size={24}
                color={color}
                style={styles.cardIcon}
            />
            <View>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardValue}>{value}</Text>
            </View>
        </View>
    )

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.imageSection}>
                    {imageString ? (
                        <Image
                            source={{
                                uri:
                                    imageString ||
                                    'https://via.placeholder.com/90',
                            }}
                            style={styles.image}
                            contentFit="contain"
                            transition={300}
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Ionicons
                                name="image-outline"
                                size={48}
                                color="#CCD1D9"
                            />
                            <Text style={styles.noImageText}>
                                No photo available
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.species}>{species}</Text>

                    <View style={styles.detailsGrid}>
                        {renderDetailCard(
                            'water-outline',
                            'Watering',
                            wateringFrequency as string,
                            '#0EA5E9',
                        )}
                        {renderDetailCard(
                            'sunny-outline',
                            'Light',
                            lightRequirements as string,
                            '#EAB308',
                        )}
                    </View>

                    <View style={styles.dateContainer}>
                        <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={COLOR_SECONDARY}
                        />
                        <Text style={styles.dateText}>
                            Added: {formatDate(createdAt as string)}
                        </Text>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                        >
                            <Ionicons
                                name="create-outline"
                                size={20}
                                color="#FFF"
                            />
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={20}
                                color="#FFF"
                            />
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    imageSection: {
        justifyContent: 'center',
        alignItems: 'center',
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.8,
        backgroundColor: '#FFF',
        marginBottom: 24,
    },
    image: {
        flex: 1,
        width: '100%',
        height: 'auto',
        backgroundColor: '#f0f0f0',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    noImageText: {
        marginTop: 12,
        fontSize: 16,
        color: '#94A3B8',
    },
    infoContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    name: {
        fontSize: 32,
        fontWeight: '700',
        color: COLOR_TEXT_PRIMARY,
        marginBottom: 4,
    },
    species: {
        fontSize: 18,
        color: COLOR_TEXT_SECONDARY,
        marginBottom: 24,
    },
    detailsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    detailCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardIcon: {
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 12,
        color: COLOR_TEXT_SECONDARY,
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOR_TEXT_PRIMARY,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 32,
    },
    dateText: {
        fontSize: 14,
        color: COLOR_TEXT_SECONDARY,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    editButton: {
        backgroundColor: COLOR_PRIMARY,
    },
    deleteButton: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
})
