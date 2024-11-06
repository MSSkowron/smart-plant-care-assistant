import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    Modal,
    Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contextes/AuthContext'
import { signOut } from '@/utils/supabase'
import { router } from 'expo-router'
import Icon from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'

const NOTIFICATION_SETTINGS_KEY = '@notification_settings'

interface NotificationsSettings {
    enabled: boolean | undefined
    pushNotifications: boolean | undefined
    emailNotifications: boolean | undefined
    newMessages: boolean | undefined
    updates: boolean | undefined
    marketing: boolean | undefined
}

type SettingItemType = 'arrow' | 'switch' | 'value'

interface SettingItemProps {
    icon: string
    title: string
    value?: boolean | string
    onPress: ((value?: boolean) => void) | (() => void)
    type?: SettingItemType
    subtitle?: string | null
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    value,
    onPress,
    type = 'arrow',
    subtitle = null,
}) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={() =>
            type === 'switch' ? onPress(!(value as boolean)) : onPress()
        }
        activeOpacity={0.7}
    >
        <View style={styles.settingItemLeft}>
            <Icon
                name={icon}
                size={24}
                color="#333"
                style={styles.settingIcon}
            />
            <View>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && (
                    <Text style={styles.settingSubtitle}>{subtitle}</Text>
                )}
            </View>
        </View>
        {type === 'arrow' && (
            <Icon name="chevron-forward" size={24} color="#999" />
        )}
        {type === 'switch' && (
            <Switch
                value={value as boolean}
                onValueChange={(newValue) => onPress(newValue)}
            />
        )}
        {type === 'value' && (
            <Text style={styles.settingValue}>{value as string}</Text>
        )}
    </TouchableOpacity>
)

export default function ProfileScreen() {
    const { user } = useAuth()

    const [showNotificationsSettingsModal, setShowNotificationsSettingsModal] =
        useState<boolean>(false)
    const [notificationSettings, setNotificationSettings] =
        useState<NotificationsSettings>({
            enabled: false,
            pushNotifications: false,
            emailNotifications: false,
            newMessages: false,
            updates: false,
            marketing: false,
        })
    const [darkMode, setDarkMode] = useState<boolean>(false)

    useEffect(() => {
        loadNotificationSettings()
    }, [])

    const loadNotificationSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem(
                NOTIFICATION_SETTINGS_KEY,
            )
            if (savedSettings) {
                setNotificationSettings(JSON.parse(savedSettings))
            }
        } catch (error) {
            console.error('Error loading notification settings:', error)
        }
    }

    const saveNotificationSettings = async (
        newSettings: NotificationsSettings,
    ) => {
        try {
            await AsyncStorage.setItem(
                NOTIFICATION_SETTINGS_KEY,
                JSON.stringify(newSettings),
            )
            setNotificationSettings(newSettings)
        } catch (error) {
            console.error('Error saving notification settings:', error)
            Alert.alert('Error', 'Failed to save notification settings')
        }
    }

    const handleNotificationPermission = async (
        newValue: boolean | undefined,
    ) => {
        if (newValue) {
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync()
            let finalStatus = existingStatus

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync()
                finalStatus = status
            }

            if (finalStatus !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please enable notifications in your device settings to receive updates.',
                    [{ text: 'OK' }],
                )
                return false
            }
        }

        const newSettings = {
            ...notificationSettings,
            enabled: newValue,
            pushNotifications: newValue
                ? notificationSettings.pushNotifications
                : false,
        }

        await saveNotificationSettings(newSettings)
        return true
    }

    const handleSignOut = async () => {
        try {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign Out',
                    onPress: async () => {
                        await signOut()
                        router.replace('/')
                    },
                    style: 'destructive',
                },
            ])
        } catch (e) {
            console.error(e)
            Alert.alert('Error', 'Failed to sign out. Please try again.')
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 90 }}
            >
                {/* User Profile */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <View style={styles.sectionContent}>
                        <SettingItem
                            icon="person-circle"
                            title="Account"
                            value={user?.email}
                            type="value"
                            onPress={() => {}}
                        />
                        <SettingItem
                            icon="key"
                            title="Change Password"
                            onPress={() => {}}
                        />
                    </View>
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.sectionContent}>
                        <SettingItem
                            icon="notifications"
                            title="Notifications"
                            subtitle={
                                notificationSettings.enabled ? 'On' : 'Off'
                            }
                            type="switch"
                            value={notificationSettings.enabled}
                            onPress={async (value) => {
                                const success =
                                    await handleNotificationPermission(value)
                                if (success && value) {
                                    setShowNotificationsSettingsModal(true)
                                }
                            }}
                        />
                        <SettingItem
                            icon="settings-sharp"
                            title="Notification Settings"
                            subtitle="Configure notification preferences"
                            onPress={() =>
                                setShowNotificationsSettingsModal(true)
                            }
                        />
                        <SettingItem
                            icon="moon"
                            title="Dark Mode"
                            type="switch"
                            value={darkMode}
                            onPress={() => setDarkMode(!darkMode)}
                        />
                    </View>
                </View>

                {/* Other */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Other</Text>
                    <View style={styles.sectionContent}>
                        <SettingItem
                            icon="information-circle"
                            title="About App"
                            onPress={() => {}}
                        />
                        <SettingItem
                            icon="document-text"
                            title="Terms of Service"
                            onPress={() => {}}
                        />
                        <SettingItem
                            icon="shield-checkmark"
                            title="Privacy Policy"
                            onPress={() => {}}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleSignOut}
                >
                    <Icon name="log-out" size={24} color="#FF3B30" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showNotificationsSettingsModal}
                onRequestClose={() => setShowNotificationsSettingsModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Notification Settings
                            </Text>
                            <TouchableOpacity
                                onPress={() =>
                                    setShowNotificationsSettingsModal(false)
                                }
                                style={styles.closeButton}
                            >
                                <Icon name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <SettingItem
                                icon="notifications"
                                title="Push Notifications"
                                subtitle="Receive notifications on your device"
                                type="switch"
                                value={notificationSettings.pushNotifications}
                                onPress={async (value) => {
                                    if (
                                        !notificationSettings.enabled &&
                                        value
                                    ) {
                                        const permitted =
                                            await handleNotificationPermission(
                                                true,
                                            )
                                        if (!permitted) return
                                    }
                                    saveNotificationSettings({
                                        ...notificationSettings,
                                        pushNotifications: value,
                                    })
                                }}
                            />

                            <SettingItem
                                icon="mail"
                                title="Email Notifications"
                                subtitle="Receive updates via email"
                                type="switch"
                                value={notificationSettings.emailNotifications}
                                onPress={(value) => {
                                    saveNotificationSettings({
                                        ...notificationSettings,
                                        emailNotifications: value,
                                    })
                                }}
                            />

                            <Text style={styles.modalSectionTitle}>
                                Notification Types
                            </Text>

                            <SettingItem
                                icon="chatbubble"
                                title="New Messages"
                                subtitle="Get notified about new messages"
                                type="switch"
                                value={notificationSettings.newMessages}
                                onPress={(value) => {
                                    saveNotificationSettings({
                                        ...notificationSettings,
                                        newMessages: value,
                                    })
                                }}
                            />

                            <SettingItem
                                icon="refresh"
                                title="App Updates"
                                subtitle="Get notified about app updates"
                                type="switch"
                                value={notificationSettings.updates}
                                onPress={(value) => {
                                    saveNotificationSettings({
                                        ...notificationSettings,
                                        updates: value,
                                    })
                                }}
                            />

                            <SettingItem
                                icon="megaphone"
                                title="Marketing"
                                subtitle="Receive promotional content"
                                type="switch"
                                value={notificationSettings.marketing}
                                onPress={(value) => {
                                    saveNotificationSettings({
                                        ...notificationSettings,
                                        marketing: value,
                                    })
                                }}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginLeft: 16,
        marginBottom: 8,
    },
    sectionContent: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e1e1e1',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        marginRight: 12,
    },
    settingTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    settingValue: {
        fontSize: 16,
        color: '#999',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 32,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#FF3B30',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginLeft: 16,
        marginTop: 16,
        marginBottom: 8,
    },
})
