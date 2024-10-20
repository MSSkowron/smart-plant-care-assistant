import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import 'react-native-reanimated'

import { AuthProvider } from '@/contextes/AuthContext'
import { ActivityIndicator, View } from 'react-native'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    const [sessionInitialized, setSessionInitialized] = useState<boolean>(false)

    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    })

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync()
        }
    }, [loaded])

    if (!loaded) {
        return null
    }

    return (
        <AuthProvider
            onSessionInitialized={() => {
                setSessionInitialized(true)
            }}
        >
            <ThemeProvider value={DefaultTheme}>
                {sessionInitialized ? (
                    <Slot />
                ) : (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <ActivityIndicator size="large" color={'#228B22'} />
                    </View>
                )}
            </ThemeProvider>
        </AuthProvider>
    )
}
