import { signUp } from '@/utils/supabase'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Button, TextInput, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SignUpScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        try {
            await signUp(email, password)
            router.replace('/')
        } catch (e) {
            setError(String(e))
        }
    }

    return (
        <SafeAreaView style={styles.container}>
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
                autoComplete="new-password"
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoComplete="new-password"
                secureTextEntry
                style={styles.input}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button title="Sign Up" onPress={handleSignUp} />
            <Link href="/signin" style={styles.link}>
                <Text style={styles.linkText}>
                    Already have an account? Sign In
                </Text>
            </Link>
        </SafeAreaView>
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

export default SignUpScreen
