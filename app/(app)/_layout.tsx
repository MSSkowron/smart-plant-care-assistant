import { Redirect, Tabs, Stack } from 'expo-router'
import React from 'react'

import { useAuth } from '@/contextes/AuthContext'
import TabBar from '@/components/TabBar'

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
