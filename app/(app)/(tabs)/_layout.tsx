import { Redirect, Tabs } from 'expo-router'
import React from 'react'

import { useAuth } from '@/contextes/AuthContext'
import TabBar from '@/components/TabBar'

export default function TabLayout() {
    const { session } = useAuth()
    if (!session) {
        return <Redirect href={'/signin'} />
    }

    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="plants"
                options={{
                    title: 'My Plants',
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                }}
            />
        </Tabs>
    )
}
