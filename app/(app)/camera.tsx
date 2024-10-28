import {
    CameraView,
    CameraType,
    useCameraPermissions,
    CameraCapturedPicture,
} from 'expo-camera'
import React, { useState, useRef, useCallback } from 'react'
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native'
import { icons } from '@/assets/icons'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { useImage } from '@/store/hooks'

const SCREEN_ROUTES = {
    plants: '/(app)/(tabs)/plants',
    addPlant: '/(app)/addPlant',
    default: '/',
} as const

export default function CameraComponent() {
    const [facing, setFacing] = useState<CameraType>('back')
    const [permissionCamera, requestCameraPermission] = useCameraPermissions()
    const [picture, setPicture] = useState<CameraCapturedPicture | undefined>()
    const [isCapturing, setIsCapturing] = useState(false)
    const { height, width } = useWindowDimensions()

    const { updateImage } = useImage()
    const camera = useRef<CameraView | null>(null)
    const { previousScreen } = useLocalSearchParams()

    const previousScreenPath =
        SCREEN_ROUTES[previousScreen as keyof typeof SCREEN_ROUTES] ||
        SCREEN_ROUTES.default

    const handleTakePicture = useCallback(async () => {
        if (!camera.current || isCapturing) return

        setIsCapturing(true)
        try {
            const photo = await camera.current.takePictureAsync({
                quality: 1,
                base64: true,
                exif: true,
            })

            if (!photo?.uri) {
                throw new Error('Failed to capture image: URI is undefined')
            }

            setPicture(photo)
        } catch (error) {
            console.error('Error taking picture:', error)
            // TODO: Add error handling UI
        } finally {
            setIsCapturing(false)
        }
    }, [isCapturing])

    const handleToggleCameraFacing = useCallback(() => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'))
    }, [])

    const handleSavePicture = useCallback(() => {
        if (picture?.uri) {
            updateImage(picture.uri)
            router.back()
        }
    }, [picture, updateImage])

    const handleRetake = useCallback(() => {
        setPicture(undefined)
    }, [])

    if (!permissionCamera) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Initializing camera...</Text>
            </View>
        )
    }

    if (!permissionCamera.granted) {
        return (
            <View style={styles.centered}>
                <Text style={styles.message}>
                    Camera access is required to take photos
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestCameraPermission}
                >
                    <Text style={styles.permissionButtonText}>
                        Grant Camera Permission
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (picture) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.previewContainer}>
                    <Image
                        source={{ uri: picture.uri }}
                        style={styles.previewImage}
                        contentFit="cover"
                        transition={200}
                    />
                    <View style={styles.previewButtons}>
                        <TouchableOpacity
                            style={[styles.previewButton, styles.retakeButton]}
                            onPress={handleRetake}
                        >
                            <Text style={styles.buttonText}>Retake</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.previewButton, styles.saveButton]}
                            onPress={handleSavePicture}
                        >
                            <Text style={styles.buttonText}>Use Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <CameraView
                style={[styles.camera, { height, width }]}
                facing={facing}
                ref={camera}
            >
                <View style={styles.overlay}>
                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handleToggleCameraFacing}
                            disabled={isCapturing}
                        >
                            {icons['flipCamera']()}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.captureButton,
                                isCapturing && styles.captureButtonDisabled,
                            ]}
                            onPress={handleTakePicture}
                            disabled={isCapturing}
                        >
                            {isCapturing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                icons['takePhoto']()
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 20,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    message: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        elevation: 3,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 20 : 40,
        paddingHorizontal: 20,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    captureButtonDisabled: {
        opacity: 0.7,
    },
    previewContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    previewImage: {
        flex: 1,
        width: '100%',
        backgroundColor: '#f0f0f0',
    },
    previewButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: '#000',
    },
    previewButton: {
        flex: 1,
        marginHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    retakeButton: {
        backgroundColor: '#ef4444',
    },
    saveButton: {
        backgroundColor: '#22c55e',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
})
