import { Redirect, Stack } from 'expo-router'
import React from 'react'

import { useAuth } from '@/contextes/AuthContext'

export default function AppLayout() {
    const { session } = useAuth()
    if (!session) {
        return <Redirect href={'/signin'} />
    }

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="camera"
                options={{
                    headerShown: true,
                    headerTitle: 'Camera',
                    headerTitleAlign: 'center',
                    headerTransparent: false,
                    headerBackVisible: true,
                    headerTintColor: 'black',
                    headerBackTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: 'black',
                    },
                }}
            />
            <Stack.Screen
                name="addPlant"
                options={{
                    headerTitle: '',
                    headerBackVisible: true,
                    headerTintColor: 'black',
                    headerBackTitleStyle: {
                        fontSize: 16,
                    },
                }}
            />
            <Stack.Screen
                name="plantDetails"
                options={{
                    headerTitle: 'Plant details',
                    headerTitleAlign: 'center',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: 'black',
                    },
                    headerBackVisible: true,
                    headerTintColor: 'black',
                    headerBackTitleStyle: {
                        fontSize: 16,
                    },
                }}
            />
            <Stack.Screen
                name="schedule"
                options={{
                    headerTitle: 'Watering Schedule',
                    headerBackVisible: true,
                    headerTintColor: 'black',
                    headerBackTitleStyle: {
                        fontSize: 16,
                    },
                }}
            />
        </Stack>
    )
}
