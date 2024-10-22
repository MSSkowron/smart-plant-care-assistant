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
            <Stack.Screen name="camera" options={{ headerShown: false }} />
        </Stack>
    )
}
