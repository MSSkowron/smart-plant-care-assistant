import {
    CameraView,
    CameraType,
    useCameraPermissions,
    CameraCapturedPicture,
} from 'expo-camera'
import React, { useState, useRef } from 'react'
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { icons } from '@/assets/icons'
import { Image } from 'expo-image'
import { Link, useLocalSearchParams } from 'expo-router'

export default function CameraComponent() {
    const [facing, setFacing] = useState<CameraType>('back')
    const [permissionCamera, requestCameraPermission] = useCameraPermissions()
    const [picture, setPicture] = useState<CameraCapturedPicture | undefined>()

    const camera = useRef<CameraView | null>(null)

    const params = useLocalSearchParams()
    const { plantName, plantIndex, previousScreen } = params

    let previousScreenPath = previousScreen as string
    switch (previousScreenPath) {
        case '/plants':
            previousScreenPath = '/(app)/(tabs)/plants'
            break
        case '/addPlant':
            previousScreenPath = '/(app)/addPlant'
            break
        default:
            previousScreenPath = '/'
            break
    }

    if (!permissionCamera) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        )
    }

    if (!permissionCamera.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    We need your permission to show the camera
                </Text>
                <Button
                    onPress={requestCameraPermission}
                    title="Grant Permission"
                />
            </View>
        )
    }

    if (picture) {
        return (
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: picture.uri }}
                        style={styles.image}
                        contentFit="cover"
                    />
                </View>
                <View style={styles.cameraButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.cameraButton, styles.retakeButton]}
                        onPress={() => setPicture(undefined)}
                    >
                        <Text style={styles.cameraButtonText}>Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.cameraButton, styles.saveButton]}
                    >
                        <Link
                            href={{
                                pathname: previousScreenPath,
                                params: {
                                    imageURI: picture.uri,
                                    plantName: plantName,
                                    plantIndex: plantIndex,
                                },
                            }}
                        >
                            <Text style={styles.cameraButtonText}>Save</Text>
                        </Link>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const takePicture = async () => {
        if (camera.current) {
            try {
                const photo = await camera.current.takePictureAsync({
                    quality: 0,
                    base64: true,
                })
                setPicture(photo)
            } catch (error) {
                console.error('Error taking picture:', error)
            }
        }
    }

    const toggleCameraFacing = () => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'))
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={camera}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={toggleCameraFacing}
                    >
                        {icons['flipCamera']()}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={takePicture}
                    >
                        {icons['takePhoto']()}
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        borderRadius: 10,
        overflow: 'hidden',
        flex: 1,
        width: '100%',
        backgroundColor: '#f0f0f0',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: '#fff',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    imageContainer: {
        flex: 1,
        padding: 10,
        marginTop: 5,
        backgroundColor: 'black',
    },
    cameraButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#000',
        marginBottom: 20,
    },
    cameraButton: {
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    cameraButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    retakeButton: {
        backgroundColor: '#f44336',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
})
