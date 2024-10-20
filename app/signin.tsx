import { signIn } from '@/utils/supabase'
import { Link, router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
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
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const mode = process.env.EXPO_PUBLIC_MODE
        const signInAndRedirect = async () => {
            if (mode === 'dev') {
                try {
                    await signIn(
                        process.env.EXPO_PUBLIC_MODE_DEV_EMAIL || '',
                        process.env.EXPO_PUBLIC_MODE_DEV_PASSWORD || '',
                    )
                    router.replace('/')
                } catch (error) {
                    console.error('Error during sign-in:', error)
                }
            }
        }

        signInAndRedirect()
    }, [])

    const handleSignIn = async () => {
        setError(null)

        try {
            await signIn(email, password)
            router.replace('/')
        } catch (e) {
            setError(String(e))
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
                        secureTextEntry={true}
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

                {error && <Text style={styles.errorText}>{error}</Text>}

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
})

export default SignInScreen
