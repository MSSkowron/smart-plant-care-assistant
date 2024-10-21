import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CameraComponent() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  let camera: CameraView = useRef<CameraView>(null)

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    console.log(camera)
    const photo: any = await camera.current.takePictureAsync()
    console.log(photo)
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={camera}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>Take picture</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
}

const styles = StyleSheet.create({
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
});