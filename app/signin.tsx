import { signIn } from '@/utils/supabase'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types'

const imagePath = require('@/assets/images/icon.jpg')

type RootStackParamList = {
    SignIn: undefined
    Register: undefined
}

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>

const SignInScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleSignIn = async () => {
        setIsLoading(true)

        try {
            if (email === '' || password === '') {
                throw new Error('Email and password fields cannot be empty')
            }
            await signIn(email, password)
            router.replace('/')
        } catch (e) {
            const errorMessage =
                String(e)?.replace(/^Error:\s*/, '') ||
                'An unexpected error occurred. Please try again.'

            Alert.alert('Login failed', errorMessage, [{ text: 'OK' }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    style={styles.image}
                    source={imagePath}
                    transition={500}
                />
            </View>
            <View style={styles.formContainer}>
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '500',
                        marginBottom: 30,
                    }}
                >
                    Login
                </Text>

                <View style={styles.inputFieldContainer}>
                    <MaterialIcons
                        name="alternate-email"
                        size={20}
                        color="black"
                        style={{ marginRight: 5 }}
                    />
                    <TextInput
                        placeholder={'Email'}
                        keyboardType={'email-address'}
                        style={{ flex: 1, paddingVertical: 0 }}
                        value={email}
                        onChangeText={setEmail}
                        autoComplete="email"
                    />
                </View>

                <View style={styles.inputFieldContainer}>
                    <AntDesign
                        name="lock"
                        size={20}
                        color="black"
                        style={{ marginRight: 5 }}
                    />
                    <TextInput
                        placeholder={'Password'}
                        keyboardType={'default'}
                        style={{ flex: 1, paddingVertical: 0 }}
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                        autoComplete="current-password"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSignIn}
                    style={styles.loginButtonContainer}
                >
                    <Text style={styles.loginButtonButton}>{'Login'}</Text>
                </TouchableOpacity>

                <View style={styles.registerLinkContainer}>
                    <Text>Don't have an account?</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Link href="/signup">
                            <Text style={styles.registerLinkButton}>
                                {' '}
                                Register
                            </Text>
                        </Link>
                    </TouchableOpacity>
                </View>
            </View>
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={'#228B22'} />
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 25 },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    image: {
        width: 250,
        height: 250,
        borderRadius: 150,
        overflow: 'hidden',
    },
    formContainer: {
        flex: 2,
    },
    inputFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 25,
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
    },
    loginButtonContainer: {
        backgroundColor: '#228B22',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    loginButtonButton: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
        color: '#fff',
    },
    registerLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerLinkButton: { color: '#228B22', fontWeight: '700' },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default SignInScreen
