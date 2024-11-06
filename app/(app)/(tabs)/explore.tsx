import React from 'react'
import {
    Text,
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform,
    RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TERTIARY } from '@/assets/colors'
import { StatusBar } from 'expo-status-bar'

interface DataItem {
    id: string
    title: string
    description: string
    icon: string
    color: string
    category: string
}

const { width } = Dimensions.get('window')
const CARD_MARGIN = 16
const CARD_WIDTH = width - CARD_MARGIN * 2

const exploreData: DataItem[] = [
    {
        id: '1',
        title: 'Watering Tips',
        description: 'Learn the best practices for watering your plants.',
        icon: 'water-outline',
        color: COLOR_PRIMARY,
        category: 'Care Basics',
    },
    {
        id: '2',
        title: 'Lighting Guide',
        description:
            'Understand the lighting needs of different plant species.',
        icon: 'sunny-outline',
        color: COLOR_SECONDARY,
        category: 'Care Basics',
    },
    {
        id: '3',
        title: 'Repotting 101',
        description: 'Tips for successfully repotting your houseplants.',
        icon: 'flower-outline',
        color: COLOR_TERTIARY,
        category: 'Advanced Care',
    },
    {
        id: '4',
        title: 'Pest Control',
        description: 'Identify and manage common plant pests.',
        icon: 'bug-outline',
        color: COLOR_PRIMARY,
        category: 'Troubleshooting',
    },
    {
        id: '5',
        title: 'Fertilizing Basics',
        description:
            'Understand the importance of fertilizing and how to do it.',
        icon: 'leaf-outline',
        color: COLOR_SECONDARY,
        category: 'Care Basics',
    },
]

const categories = ['All', 'Care Basics', 'Advanced Care', 'Troubleshooting']

export default function ExploreScreen() {
    const [selectedCategory, setSelectedCategory] = React.useState('All')
    const [searchQuery, setSearchQuery] = React.useState('')
    const [isRefreshing, setIsRefreshing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    const filteredData = React.useMemo(() => {
        return exploreData.filter((item) => {
            const matchesCategory =
                selectedCategory === 'All' || item.category === selectedCategory
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            return matchesCategory && matchesSearch
        })
    }, [selectedCategory, searchQuery])

    const handleRefresh = React.useCallback(async () => {
        setIsRefreshing(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setIsRefreshing(false)
    }, [])

    const renderExploreItem = React.useCallback(
        ({ item }: { item: DataItem }) => (
            <TouchableOpacity
                style={styles.exploreItem}
                activeOpacity={0.7}
                onPress={() => {
                    // Handle navigation here
                    console.log(`Pressed ${item.title}`)
                }}
            >
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: item.color },
                    ]}
                >
                    <Ionicons name={item.icon as any} size={24} color="#fff" />
                </View>
                <View style={styles.exploreContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.exploreTitle}>{item.title}</Text>
                        <Text style={styles.categoryLabel}>
                            {item.category}
                        </Text>
                    </View>
                    <Text style={styles.exploreDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>
                <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="#4C566A"
                    style={styles.chevronIcon}
                />
            </TouchableOpacity>
        ),
        [],
    )

    const renderCategoryItem = React.useCallback(
        ({ item }: { item: string }) => (
            <TouchableOpacity
                style={[
                    styles.categoryItem,
                    selectedCategory === item && styles.categoryItemSelected,
                ]}
                onPress={() => setSelectedCategory(item)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.categoryText,
                        selectedCategory === item &&
                            styles.categoryTextSelected,
                    ]}
                >
                    {item}
                </Text>
            </TouchableOpacity>
        ),
        [selectedCategory],
    )

    const ListHeaderComponent = React.useCallback(
        () => (
            <View style={styles.headerComponentContainer}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#4C566A" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search guides and tips..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                            }}
                        >
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#4C566A"
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <FlatList
                    horizontal
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                />
            </View>
        ),
        [searchQuery, renderCategoryItem],
    )

    const ListEmptyComponent = React.useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>
                    Try adjusting your search or category filters
                </Text>
            </View>
        ),
        [],
    )

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerText}>Explore</Text>
            </View>
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={renderExploreItem}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={[
                    styles.listContainer,
                    filteredData.length === 0 && styles.emptyListContainer,
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLOR_PRIMARY}
                        colors={[COLOR_PRIMARY]}
                    />
                }
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E9F0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    headerText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2E3440',
    },
    headerComponentContainer: {
        paddingHorizontal: CARD_MARGIN,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E9F0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        marginRight: 8,
        fontSize: 16,
        color: '#2E3440',
    },
    categoriesContainer: {
        paddingVertical: 4,
        marginBottom: 12,
    },
    categoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E9F0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    categoryItemSelected: {
        backgroundColor: COLOR_PRIMARY,
        borderColor: COLOR_PRIMARY,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4C566A',
    },
    categoryTextSelected: {
        color: '#FFF',
    },
    listContainer: {
        paddingVertical: 16,
    },
    emptyListContainer: {
        flexGrow: 1,
    },
    exploreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: CARD_MARGIN,
        marginBottom: 16,
        width: CARD_WIDTH,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    exploreContent: {
        flex: 1,
        marginRight: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    exploreTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E3440',
        flex: 1,
    },
    categoryLabel: {
        fontSize: 12,
        color: '#4C566A',
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    exploreDescription: {
        fontSize: 14,
        color: '#4C566A',
        lineHeight: 20,
    },
    chevronIcon: {
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4C566A',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
    },
})
