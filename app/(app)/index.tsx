import { Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contextes/AuthContext'

export default function HomeScreen() {
    const { user } = useAuth()

    return (
        <SafeAreaView style={styles.container}>
            <Text>Welcome {user?.email}!</Text>
            <Text>
                A main screen summarizing key details, including plant
                statistics, upcoming tasks (like watering), and quick actions.
            </Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
