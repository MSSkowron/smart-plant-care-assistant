import React from 'react'
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_PRIMARY } from '@/assets/colors'

interface PlantHealthModalProps {
    visible: boolean
    onClose: () => void
    onGalleryPress: () => void
    onCameraPress: () => void
}

export const PlantHealthModal: React.FC<PlantHealthModalProps> = ({
    visible,
    onClose,
    onGalleryPress,
    onCameraPress,
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalContainer}>
                    <Pressable
                        style={styles.contentContainer}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                Identify Plant Health
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
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#4C566A"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.subtitle}>
                            Take a photo or choose from your gallery to check
                            your plant's health
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={onGalleryPress}
                            >
                                <Ionicons
                                    name="images-outline"
                                    size={24}
                                    color="#FFF"
                                />
                                <Text style={styles.buttonText}>
                                    Choose from Gallery
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.cameraButton]}
                                onPress={onCameraPress}
                            >
                                <Ionicons
                                    name="camera-outline"
                                    size={24}
                                    color="#FFF"
                                />
                                <Text style={styles.buttonText}>
                                    Take a Picture
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: 'transparent',
    },
    contentContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
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
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2E3440',
    },
    subtitle: {
        fontSize: 16,
        color: '#4C566A',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        gap: 12,
        marginBottom: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLOR_PRIMARY,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: COLOR_PRIMARY,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cameraButton: {
        backgroundColor: '#3B82F6',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 12,
    },
    cancelButtonText: {
        color: '#4C566A',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
})

export default PlantHealthModal
