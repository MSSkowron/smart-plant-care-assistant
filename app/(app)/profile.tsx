import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contextes/AuthContext'
import { signOut } from '@/utils/supabase'
import { router } from 'expo-router'
import Icon from 'react-native-vector-icons/Ionicons'

export default function ProfileScreen() {
    const { user } = useAuth()

    const handleSignOut = async () => {
        try {
            await signOut()
            router.replace('/')
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Icon added above the title */}
            <Icon name="person-circle-outline" size={80} color="#4CAF50" />
            <Text style={styles.title}>{user?.email}</Text>

            {/* Updated button with custom style */}
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        backgroundColor: '#FF3B30',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
})
