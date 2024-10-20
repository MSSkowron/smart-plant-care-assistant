import { Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ExploreScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text>
                A view showing guides, tips, and interesting facts for plant
                care. This could serve as the "News Feed".
            </Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
