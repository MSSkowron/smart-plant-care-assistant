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

    let camera: CameraView = useRef<CameraView>(null)

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
                    title="grant permission"
                />
            </View>
        )
    }

    if (picture) {
        return (
            <View style={styles.container}>
                <Image
                    source={picture.uri}
                    style={styles.image}
                    contentFit="cover"
                ></Image>
            </View>
        )
    }

    const takePicture = async () => {
        const photo: any = await camera.current.takePictureAsync({ quality: 0 })
        setPicture(photo)
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
        flex: 1,
        width: '100%',
        backgroundColor: '#0553',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
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
})
