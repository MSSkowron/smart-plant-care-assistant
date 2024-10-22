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

export default function CameraComponent() {
    const [facing, setFacing] = useState<CameraType>('back')
    const [permissionCamera, requestCameraPermission] = useCameraPermissions()
    const [picture, setPicture] = useState<CameraCapturedPicture | undefined>()

    const camera = useRef<CameraView | null>(null)

    if (!permissionCamera) {
        return <View />
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
                        style={[
                            styles.cameraButton,
                            { backgroundColor: '#f44336' },
                        ]}
                        onPress={() => setPicture(undefined)}
                    >
                        <Text style={styles.cameraButtonText}>Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.cameraButton,
                            { backgroundColor: '#4CAF50' },
                        ]}
                        onPress={() => {
                            console.log('TODO: save picture...')
                        }}
                    >
                        <Text style={styles.cameraButtonText}>Save</Text>
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
    image: {
        borderRadius: 10,
        overflow: 'hidden',
        flex: 1,
        width: '100%',
        backgroundColor: '#0553',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    imageContainer: {
        flex: 1,
        padding: 10,
    },
    cameraButtonsContainer: {
        backgroundColor: 'black',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 10,
    },
    cameraButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    cameraButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
})
