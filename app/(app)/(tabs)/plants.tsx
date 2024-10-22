import { Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router';

export default function PlantsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text>
                A comprehensive list of all plants added by the user. It could
                include a button to add new plants using the AI photo
                recognition feature.
            </Text>
            <Text>
                Adding new plants by taking a photo or selecting one from the
                gallery. This tab can leverage AI to identify plant species and
                gather relevant care data.
            </Text>
            <Text>
                Checking if the light conditions in a room are suitable for a
                selected plant, using the light sensor data.
            </Text>
            <Link href="/camera">Add new plant!</Link>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
