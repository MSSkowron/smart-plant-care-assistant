import { signIn } from '@/utils/supabase'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Button, TextInput, View, Text, StyleSheet } from 'react-native'

const SignInScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSignIn = async () => {
        try {
            await signIn(email, password)
            router.replace('/')
        } catch (e) {
            setError(String(e))
        }
    }

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoComplete="email"
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                autoComplete="current-password"
                secureTextEntry
                style={styles.input}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button title="Sign In" onPress={handleSignIn} />
            <Link href="/signup" style={styles.link}>
                <Text style={styles.linkText}>
                    Don't have an account? Sign Up
                </Text>
            </Link>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    error: {
        color: 'red',
        marginBottom: 12,
    },
    link: {
        marginTop: 16,
        alignSelf: 'center',
    },
    linkText: {
        color: '#007bff',
        textDecorationLine: 'underline',
    },
})

export default SignInScreen
