import React, { useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/utils/supabase'
import {
    COLOR_PRIMARY,
    COLOR_SECONDARY,
    COLOR_TEXT_PRIMARY,
    COLOR_TEXT_SECONDARY,
} from '@/assets/colors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function PlantDetails() {
    const router = useRouter()
    const {
        id,
        name,
        species,
        lightRequirements,
        wateringFrequency,
        lastWatered,
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

    const getDaysSinceLastWatered = () => {
        if (!lastWatered) return 'Never watered'

        const lastWateredDate = new Date(lastWatered as string)
        const now = new Date()

        const diffTime = now.getTime() - lastWateredDate.getTime()

        const diffHours = diffTime / (1000 * 60 * 60)

        if (diffHours < 24) {
            if (diffHours < 1) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60))
                if (diffMinutes < 1) {
                    return 'Just now'
                }
                return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`
            }
            const hours = Math.floor(diffHours)
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
        }

        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }

    const handleWaterPlant = useCallback(async () => {
        try {
            const now = new Date()
            const formattedDate = now.toISOString()

            const { error } = await supabase
                .from('plants')
                .update({ last_watered: formattedDate })
                .eq('id', id)

            if (error) throw error
            Alert.alert('Success', 'Plant watered successfully!')
            router.replace('/plants')
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to water plant')
        }
    }, [id])

    const handleDeletePlant = useCallback(() => {
        Alert.alert(
            'Delete Plant',
            'Are you sure you want to delete this plant?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('plants')
                                .delete()
                                .eq('id', id)

                            if (error) throw error
                            Alert.alert(
                                'Success',
                                'Plant deleted successfully!',
                            )
                            router.replace('/plants')
                        } catch (error: any) {
                            Alert.alert(
                                'Error',
                                error.message || 'Failed to delete plant',
                            )
                        }
                    },
                },
            ],
        )
    }, [id])

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
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.imageSection}>
                    {imageString ? (
                        <Image
                            source={{ uri: imageString }}
                            style={styles.image}
                            contentFit="cover"
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
                            'Watering Frequency',
                            `Every ${wateringFrequency} days`,
                            '#0EA5E9',
                        )}
                        {renderDetailCard(
                            'time-outline',
                            'Last Watered',
                            getDaysSinceLastWatered(),
                            '#0EA5E9',
                        )}
                    </View>

                    <View style={styles.detailsGrid}>
                        {renderDetailCard(
                            'sunny-outline',
                            'Light Requirements',
                            lightRequirements as string,
                            '#EAB308',
                        )}
                        {renderDetailCard(
                            'calendar-outline',
                            'Added',
                            formatDate(createdAt as string),
                            COLOR_SECONDARY,
                        )}
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.waterButton]}
                            onPress={handleWaterPlant}
                        >
                            <Ionicons name="water" size={20} color="#FFF" />
                            <Text style={styles.buttonText}>Water Now</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.secondaryButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() =>
                                router.push({
                                    pathname: '/', // TODO: Implement
                                    params: { id },
                                })
                            }
                        >
                            <Ionicons
                                name="create-outline"
                                size={20}
                                color="#FFF"
                            />
                            <Text style={styles.buttonText}>Edit Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={handleDeletePlant}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={20}
                                color="#FFF"
                            />
                            <Text style={styles.buttonText}>Delete Plant</Text>
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
    scrollContent: {
        flexGrow: 1,
        paddingTop: 0,
    },
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
        marginBottom: 16,
    },
    detailCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
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
    actionButtons: {
        marginTop: 24,
        marginBottom: 16,
    },
    secondaryButtons: {
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
        paddingVertical: 14,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    waterButton: {
        backgroundColor: '#0EA5E9',
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
