import { Redirect, Stack, useNavigation } from 'expo-router'
import React from 'react'

import { useAuth } from '@/contextes/AuthContext'
import { HeaderBackButton } from '@react-navigation/elements'

export default function AppLayout() {
    const navigation = useNavigation()

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
                    headerTitle: '',
                    headerTransparent: true,
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => navigation.goBack()}
                            label="Back"
                            labelVisible={true}
                            tintColor="white"
                            pressColor="transparent"
                            labelStyle={{
                                fontWeight: 'bold',
                                color: 'white',
                            }}
                        />
                    ),
                }}
            />
        </Stack>
    )
}
