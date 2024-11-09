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
            <Stack.Screen
                name="addPlant"
                options={{
                    headerTitle: '',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => navigation.goBack()}
                            label="Back"
                            labelVisible={true}
                            pressColor="transparent"
                            tintColor="black"
                            labelStyle={{
                                fontWeight: 'bold',
                                color: 'black',
                            }}
                        />
                    ),
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
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => navigation.goBack()}
                            label="Back"
                            labelVisible={true}
                            pressColor="transparent"
                            tintColor="black"
                            labelStyle={{
                                fontWeight: 'bold',
                                color: 'black',
                            }}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="schedule"
                options={{
                    headerTitle: 'Watering Schedule',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => navigation.goBack()}
                            label="Back"
                            labelVisible={true}
                            pressColor="transparent"
                            tintColor="black"
                            labelStyle={{
                                fontWeight: 'bold',
                                color: 'black',
                            }}
                        />
                    ),
                }}
            />
        </Stack>
    )
}
