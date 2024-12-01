import React from 'react'
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_PRIMARY } from '@/assets/colors'

interface Disease {
    name: string
    probability: number
    details: {
        language: string
        entity_id: string
    }
}

interface HealthResult {
    is_healthy: {
        binary: boolean
        probability: number
    }
    disease: {
        suggestions: Disease[]
    }
}

interface PlantHealthResultModalProps {
    visible: boolean
    onClose: () => void
    result: HealthResult
}

export const PlantHealthResultModal: React.FC<PlantHealthResultModalProps> = ({
    visible,
    onClose,
    result,
}) => {
    const formatProbability = (prob: number) => {
        return `${(prob * 100).toFixed(1)}%`
    }

    const getHealthStatusColor = (isHealthy: boolean, probability: number) => {
        if (isHealthy) return '#22C55E'
        if (probability < 0.3) return '#EF4444'
        if (probability < 0.6) return '#F59E0B'
        return '#22C55E'
    }

    const getHealthStatusIcon = (isHealthy: boolean) => {
        return isHealthy ? 'checkmark-circle' : 'warning'
    }

    const healthColor = getHealthStatusColor(
        result.is_healthy.binary,
        result.is_healthy.probability,
    )

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            Plant Health Assessment
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                            }}
                        >
                            <Ionicons name="close" size={24} color="#4C566A" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Overall Health Status */}
                        <View style={styles.healthStatus}>
                            <Ionicons
                                name={getHealthStatusIcon(
                                    result.is_healthy.binary,
                                )}
                                size={32}
                                color={healthColor}
                            />
                            <View style={styles.healthTextContainer}>
                                <Text
                                    style={[
                                        styles.healthText,
                                        { color: healthColor },
                                    ]}
                                >
                                    {result.is_healthy.binary
                                        ? 'Healthy'
                                        : 'Needs Attention'}
                                </Text>
                                <Text style={styles.probabilityText}>
                                    Health Score:{' '}
                                    {formatProbability(
                                        result.is_healthy.probability,
                                    )}
                                </Text>
                            </View>
                        </View>

                        {/* Disease Information */}
                        {!result.is_healthy.binary &&
                            result.disease.suggestions.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>
                                        Potential Issues Detected
                                    </Text>
                                    {result.disease.suggestions.map(
                                        (disease, index) => (
                                            <View
                                                key={index}
                                                style={styles.diseaseItem}
                                            >
                                                <View
                                                    style={styles.diseaseHeader}
                                                >
                                                    <Text
                                                        style={
                                                            styles.diseaseName
                                                        }
                                                    >
                                                        {disease.name}
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.probability
                                                        }
                                                    >
                                                        {formatProbability(
                                                            disease.probability,
                                                        )}
                                                    </Text>
                                                </View>
                                                <View
                                                    style={
                                                        styles.probabilityBar
                                                    }
                                                >
                                                    <View
                                                        style={[
                                                            styles.probabilityFill,
                                                            {
                                                                width: `${disease.probability * 100}%`,
                                                            },
                                                        ]}
                                                    />
                                                </View>
                                            </View>
                                        ),
                                    )}
                                </View>
                            )}

                        {/* Recommendations */}
                        {!result.is_healthy.binary && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Recommendations
                                </Text>
                                <View style={styles.recommendationsList}>
                                    <View style={styles.recommendationItem}>
                                        <Ionicons
                                            name="leaf"
                                            size={20}
                                            color={COLOR_PRIMARY}
                                        />
                                        <Text style={styles.recommendationText}>
                                            Monitor the affected areas closely
                                        </Text>
                                    </View>
                                    <View style={styles.recommendationItem}>
                                        <Ionicons
                                            name="water"
                                            size={20}
                                            color={COLOR_PRIMARY}
                                        />
                                        <Text style={styles.recommendationText}>
                                            Adjust watering schedule if needed
                                        </Text>
                                    </View>
                                    <View style={styles.recommendationItem}>
                                        <Ionicons
                                            name="sunny"
                                            size={20}
                                            color={COLOR_PRIMARY}
                                        />
                                        <Text style={styles.recommendationText}>
                                            Ensure proper light conditions
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E9F0',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2E3440',
    },
    content: {
        padding: 20,
    },
    healthStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    healthTextContainer: {
        marginLeft: 12,
    },
    healthText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    probabilityText: {
        fontSize: 14,
        color: '#4C566A',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E3440',
        marginBottom: 12,
    },
    diseaseItem: {
        marginBottom: 16,
    },
    diseaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    diseaseName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2E3440',
    },
    probability: {
        fontSize: 14,
        color: '#4C566A',
    },
    probabilityBar: {
        height: 4,
        backgroundColor: '#E5E9F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    probabilityFill: {
        height: '100%',
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 2,
    },
    recommendationsList: {
        gap: 12,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
    },
    recommendationText: {
        fontSize: 14,
        color: '#4C566A',
        flex: 1,
    },
})

export default PlantHealthResultModal
