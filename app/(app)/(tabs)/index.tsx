import React from 'react'
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contextes/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TERTIARY } from '@/assets/colors'

export default function HomeScreen() {
    const { user } = useAuth()

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text
                        style={styles.headerText}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        Welcome, {user?.email}!
                    </Text>
                </View>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="leaf-outline" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={styles.contentContainer}>
                <View style={[styles.card, styles.statisticsCard]}>
                    <Text style={styles.cardTitle}>Plant Statistics</Text>
                    <View style={styles.statisticsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons
                                name="water-outline"
                                size={24}
                                color={COLOR_PRIMARY}
                            />
                            <Text style={styles.statText}>Next Watering</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons
                                name="sunny-outline"
                                size={24}
                                color={COLOR_PRIMARY}
                            />
                            <Text style={styles.statText}>
                                Light Requirements
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.card, styles.tasksCard]}>
                    <Text style={styles.cardTitle}>Upcoming Tasks</Text>
                    <View style={styles.taskContainer}>
                        <View style={styles.taskItem}>
                            <Ionicons
                                name="water-outline"
                                size={24}
                                color={COLOR_PRIMARY}
                            />
                            <Text style={styles.taskText}>Water plants</Text>
                        </View>
                        <View style={styles.taskItem}>
                            <Ionicons
                                name="sunny-outline"
                                size={24}
                                color={COLOR_PRIMARY}
                            />
                            <Text style={styles.taskText}>Adjust lighting</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.card, styles.actionsCard]}>
                    <Text style={styles.cardTitle}>Quick Actions</Text>
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={[
                                styles.actionItem,
                                { borderColor: COLOR_PRIMARY },
                            ]}
                        >
                            <Ionicons
                                name="add-circle-outline"
                                size={30}
                                color={COLOR_PRIMARY}
                            />
                            <Text
                                style={[
                                    styles.actionText,
                                    { color: COLOR_PRIMARY },
                                ]}
                            >
                                Add Plant
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.actionItem,
                                { borderColor: COLOR_PRIMARY },
                            ]}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={30}
                                color={COLOR_PRIMARY}
                            />
                            <Text
                                style={[
                                    styles.actionText,
                                    { color: COLOR_PRIMARY },
                                ]}
                            >
                                View Schedule
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E9F0',
    },
    headerTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    headerText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2E3440',
    },
    headerButton: {
        width: 48,
        height: 48,
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLOR_PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statisticsCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLOR_PRIMARY,
    },
    tasksCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLOR_SECONDARY,
    },
    actionsCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLOR_TERTIARY,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E3440',
        marginBottom: 12,
    },
    statisticsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statText: {
        fontSize: 14,
        color: '#4C566A',
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    taskText: {
        fontSize: 14,
        color: '#4C566A',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionItem: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#E5E9F0',
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E3440',
    },
})
