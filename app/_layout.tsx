import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import 'react-native-reanimated'

import { AuthProvider } from '@/contextes/AuthContext'
import { ActivityIndicator, View } from 'react-native'
import { store } from '@/store/store'
import { Provider } from 'react-redux'
import { NotificationsProvider } from '@/contextes/useNotification'

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
        <Provider store={store}>
            <AuthProvider
                onSessionInitialized={() => {
                    setSessionInitialized(true)
                }}
            >
                <NotificationsProvider>
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
                                <ActivityIndicator
                                    size="large"
                                    color={'#228B22'}
                                />
                            </View>
                        )}
                    </ThemeProvider>
                </NotificationsProvider>
            </AuthProvider>
        </Provider>
    )
}
