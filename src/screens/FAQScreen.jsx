import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native'
import React, { useState, useRef } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import {
    Text,
    useTheme,
    Searchbar,
    Chip,
    Divider,
    Button,
    Surface,
    IconButton,
    Avatar
} from 'react-native-paper';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import HeaderComponent from '../components/HeaderComponent'

// FAQ data with categories
const faqData = [
    {
        category: 'Getting Started',
        items: [
            {
                question: 'How does SliceShare work?',
                answer: 'SliceShare allows you to split expenses with friends, track balances, and settle payments easily using UPI or Razorpay.'
            },
            {
                question: 'How do I add a new group?',
                answer: 'Go to the Groups section, tap on "Create Group", enter a name, add members, and start splitting expenses!'
            },
            {
                question: 'How do I add an expense?',
                answer: 'Open a group, tap on "Add Expense", enter the amount, select payers, and save the bill.'
            }
        ]
    },
    {
        category: 'Payments',
        items: [
            {
                question: 'How does Razorpay payment integration work?',
                answer: 'You can settle balances directly by clicking on the "pay" button and choosing a payment option like card ,Net Banking PhonePe.'
            },
            {
                question: 'What is Razorpay integration used for?',
                answer: 'Razorpay is used for tracking and processing payments automatically within SliceShare, ensuring secure and seamless transactions.'
            },
            {
                question: 'What happens when I mark a payment as settled?',
                answer: 'When you settle an amount via razorpay or manually settle up, SliceShare updates balances and notifies all involved users in real-time.'
            }
        ]
    },
    {
        category: 'Features',
        items: [
            {
                question: 'How does debt simplification work?',
                answer: 'Debt Simplification reduces the number of transactions by optimizing payments, so fewer people need to transfer money to settle debts efficiently.'
            },
            {
                question: 'How do notifications work?',
                answer: 'You receive notifications for new expenses, payments, and balance updates. You can also mark all notifications as read in the Notifications screen.'
            },
            {
                question: 'Can I export my expense data?',
                answer: 'Yes! You can export your expense data as a CSV file by going to Group Settings and selecting "Export Data".'
            }
        ]
    }
];

// Popular questions for quick access
const popularQuestions = [
    'How does SliceShare work?',
    'How do I add an expense?',
    'How does Razorpay payment integration work?'
];

const FAQScreen = () => {
    const theme = useTheme();
    const [expandedItems, setExpandedItems] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [showFeedback, setShowFeedback] = useState(null);

    // Animation refs for smooth accordion
    const animationRefs = useRef({});

    // Initialize animation refs for each FAQ item
    faqData.forEach(category => {
        category.items.forEach((item, index) => {
            if (!animationRefs.current[`${category.category}-${index}`]) {
                animationRefs.current[`${category.category}-${index}`] = new Animated.Value(0);
            }
        });
    });

    const toggleExpand = (category, index) => {
        const key = `${category}-${index}`;
        const newExpandedItems = { ...expandedItems };

        // Toggle the expanded state
        newExpandedItems[key] = !expandedItems[key];
        setExpandedItems(newExpandedItems);

        // Animate the expansion/collapse
        Animated.timing(animationRefs.current[key], {
            toValue: newExpandedItems[key] ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();

        // Reset feedback when toggling
        setShowFeedback(null);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Reset category filter when searching
        if (query) {
            setActiveCategory('All');
        }
    };

    const filterFAQs = () => {
        if (!searchQuery && activeCategory === 'All') {
            return faqData;
        }

        return faqData.map(category => {
            // Filter by category if selected
            if (activeCategory !== 'All' && category.category !== activeCategory) {
                return { ...category, items: [] };
            }

            // Filter by search query
            const filteredItems = category.items.filter(item =>
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return { ...category, items: filteredItems };
        }).filter(category => category.items.length > 0);
    };

    const handleFeedback = (key, isHelpful) => {
        setShowFeedback({ key, isHelpful });
        // Here you could implement analytics or feedback submission
    };

    const filteredFAQs = filterFAQs();
    const allCategories = ['All', ...faqData.map(category => category.category)];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <HeaderComponent title="FAQ" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar */}
                <Surface style={styles.searchContainer} elevation={1}>
                    <Searchbar
                        placeholder="Search FAQs..."
                        onChangeText={handleSearch}
                        value={searchQuery}
                        style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
                        iconColor={theme.colors.primary}
                    />
                </Surface>

                {/* Popular Questions Section */}
                {!searchQuery && activeCategory === 'All' && (
                    <View style={styles.popularSection}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                            Popular Questions
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.popularQuestionsContainer}
                        >
                            {popularQuestions.map((question, index) => (
                                <Chip
                                    key={index}
                                    style={[styles.popularChip, { backgroundColor: theme.colors.primaryContainer }]}
                                    textStyle={{ color: theme.colors.onPrimaryContainer }}
                                    onPress={() => handleSearch(question)}
                                >
                                    {question}
                                </Chip>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {allCategories.map((category, index) => (
                        <Chip
                            key={index}
                            onPress={() => setActiveCategory(category)}
                            style={[
                                styles.categoryChip,
                                activeCategory === category ?
                                    { backgroundColor: theme.colors.primary } :
                                    { backgroundColor: theme.colors.surfaceVariant }
                            ]}
                            textStyle={{
                                color: activeCategory === category ?
                                    theme.colors.onPrimary :
                                    theme.colors.onSurfaceVariant
                            }}
                        >
                            {category}
                        </Chip>
                    ))}
                </ScrollView>

                {/* FAQ Accordion */}
                {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((category, categoryIndex) => (
                        <View key={categoryIndex} style={styles.categorySection}>
                            <Text style={[styles.categoryTitle, { color: theme.colors.primary }]}>
                                {category.category}
                            </Text>

                            {category.items.map((item, itemIndex) => {
                                const key = `${category.category}-${itemIndex}`;
                                const isExpanded = expandedItems[key] || false;

                                // Calculate dynamic height for animation
                                const maxHeight = animationRefs.current[key].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 500] // Max height for content
                                });

                                return (
                                    <Surface
                                        key={itemIndex}
                                        style={[
                                            styles.faqItem,
                                            { backgroundColor: theme.colors.surface }
                                        ]}
                                        elevation={1}
                                    >
                                        <TouchableOpacity
                                            style={styles.questionContainer}
                                            onPress={() => toggleExpand(category.category, itemIndex)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.questionContent}>
                                                <Text style={[
                                                    styles.questionText,
                                                    { color: isExpanded ? theme.colors.primary : theme.colors.onSurface }
                                                ]}>
                                                    {item.question}
                                                </Text>
                                                <IconButton
                                                    icon={isExpanded ? "chevron-up" : "chevron-down"}
                                                    size={rfs(2.2)}
                                                    iconColor={isExpanded ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                                />
                                            </View>
                                        </TouchableOpacity>

                                        <Animated.View style={[styles.answerContainer, { maxHeight }]}>
                                            <Text style={[styles.answerText, { color: theme.colors.onSurfaceVariant }]}>
                                                {item.answer}
                                            </Text>

                                            {isExpanded && (
                                                <View style={styles.feedbackContainer}>
                                                    {showFeedback && showFeedback.key === key ? (
                                                        <Text style={[styles.feedbackText, { color: theme.colors.primary }]}>
                                                            {showFeedback.isHelpful ?
                                                                "Thanks for your feedback!" :
                                                                "We'll improve this answer."}
                                                        </Text>
                                                    ) : (
                                                        <>
                                                            <Text style={styles.feedbackQuestion}>
                                                                Was this answer helpful?
                                                            </Text>
                                                            <View style={styles.feedbackButtons}>
                                                                <TouchableOpacity
                                                                    style={styles.feedbackButton}
                                                                    onPress={() => handleFeedback(key, true)}
                                                                >
                                                                    <Text style={{ color: theme.colors.primary }}>Yes</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={styles.feedbackButton}
                                                                    onPress={() => handleFeedback(key, false)}
                                                                >
                                                                    <Text style={{ color: theme.colors.error }}>No</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </>
                                                    )}
                                                </View>
                                            )}
                                        </Animated.View>
                                    </Surface>
                                );
                            })}
                        </View>
                    ))
                ) : (
                    <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>
                            No FAQs found matching "{searchQuery}"
                        </Text>
                        <Button
                            mode="contained"
                            onPress={() => {
                                setSearchQuery('');
                                setActiveCategory('All');
                            }}
                            style={{ marginTop: rh(2) }}
                        >
                            Clear Search
                        </Button>
                    </View>
                )}

                {/* Contact Support Section */}
                <Surface style={styles.supportSection} elevation={2}>
                    <Text style={[styles.supportTitle, { color: theme.colors.primary }]}>
                        Still have questions?
                    </Text>
                    <Text style={styles.supportText}>
                        Our support team is here to help you with any questions or issues.
                    </Text>
                    <View style={styles.supportOptions}>
                        <TouchableOpacity
                            style={[styles.supportOption, { backgroundColor: theme.colors.primaryContainer }]}
                        >
                            <Avatar.Icon
                                size={rfs(6)}
                                icon="email-outline"
                                color={theme.colors.primary}
                                style={{ backgroundColor: 'transparent' }}
                            />
                            <Text style={[styles.supportOptionText, { color: theme.colors.primary }]}>
                                Email Support
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.supportOption, { backgroundColor: theme.colors.primaryContainer }]}
                        >
                            <Avatar.Icon
                                size={rfs(6)}
                                icon="chat-outline"
                                color={theme.colors.primary}
                                style={{ backgroundColor: 'transparent' }}
                            />
                            <Text style={[styles.supportOptionText, { color: theme.colors.primary }]}>
                                Live Chat
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Surface>

                {/* Tips & Tricks Section */}
                <View style={styles.tipsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                        Tips & Tricks
                    </Text>
                    <Surface style={styles.tipCard} elevation={1}>
                        <View style={styles.tipHeader}>
                            <Avatar.Icon
                                size={rfs(5)}
                                icon="lightbulb-outline"
                                color={theme.colors.primary}
                                style={{ backgroundColor: theme.colors.primaryContainer }}
                            />
                            <Text style={[styles.tipTitle, { color: theme.colors.primary }]}>
                                Quick Split
                            </Text>
                        </View>
                        <Text style={styles.tipText}>
                            Use the "Split Equally" option to quickly divide expenses among all group members with just one tap!
                        </Text>
                    </Surface>

                    <Surface style={styles.tipCard} elevation={1}>
                        <View style={styles.tipHeader}>
                            <Avatar.Icon
                                size={rfs(5)}
                                icon="lightbulb-outline"
                                color={theme.colors.primary}
                                style={{ backgroundColor: theme.colors.primaryContainer }}
                            />
                            <Text style={[styles.tipTitle, { color: theme.colors.primary }]}>
                                Debt Simplification
                            </Text>
                        </View>
                        <Text style={styles.tipText}>
                            Enable "Debt Simplification" in group settings to minimize the number of transactions needed to settle all debts.
                        </Text>
                    </Surface>
                </View>
            </ScrollView>
        </View>
    )
}

export default FAQScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: rh(4),
    },
    searchContainer: {
        marginHorizontal: rw(4),
        marginTop: rh(2),
        borderRadius: rfs(1.5),
        overflow: 'hidden',
    },
    searchBar: {
        elevation: 0,
        borderRadius: rfs(1.5),
        height: rh(6),
    },
    popularSection: {
        marginTop: rh(2),
        marginHorizontal: rw(4),
    },
    sectionTitle: {
        fontSize: rfs(2.2),
        fontWeight: 'bold',
        marginBottom: rh(1.5),
    },
    popularQuestionsContainer: {
        paddingRight: rw(4),
    },
    popularChip: {
        marginRight: rw(2),
        height: rh(4),
    },
    categoriesContainer: {
        paddingHorizontal: rw(4),
        marginTop: rh(2.5),
        marginBottom: rh(1),
    },
    categoryChip: {
        marginRight: rw(2),
        height: rh(4),
    },
    categorySection: {
        marginTop: rh(2),
        marginHorizontal: rw(4),
    },
    categoryTitle: {
        fontSize: rfs(2),
        fontWeight: 'bold',
        marginBottom: rh(1.5),
        marginLeft: rw(1),
    },
    faqItem: {
        marginBottom: rh(1.5),
        borderRadius: rfs(1.5),
        overflow: 'hidden',
    },
    questionContainer: {
        padding: rw(4),
    },
    questionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    questionText: {
        fontSize: rfs(1.8),
        fontWeight: '600',
        flex: 1,
    },
    answerContainer: {
        overflow: 'hidden',
    },
    answerText: {
        fontSize: rfs(1.7),
        paddingHorizontal: rw(4),
        paddingBottom: rh(1.5),
        lineHeight: rfs(2.5),
    },
    feedbackContainer: {
        paddingHorizontal: rw(4),
        paddingBottom: rh(2),
        marginTop: rh(1),
    },
    feedbackQuestion: {
        fontSize: rfs(1.6),
        marginBottom: rh(0.8),
        fontStyle: 'italic',
    },
    feedbackButtons: {
        flexDirection: 'row',
    },
    feedbackButton: {
        marginRight: rw(4),
        paddingVertical: rh(0.5),
    },
    feedbackText: {
        fontSize: rfs(1.6),
        fontStyle: 'italic',
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: rh(5),
        paddingHorizontal: rw(4),
    },
    noResultsText: {
        fontSize: rfs(1.8),
        textAlign: 'center',
        marginBottom: rh(1),
    },
    supportSection: {
        marginHorizontal: rw(4),
        marginTop: rh(3),
        padding: rw(4),
        borderRadius: rfs(1.5),
    },
    supportTitle: {
        fontSize: rfs(2.2),
        fontWeight: 'bold',
        marginBottom: rh(1),
    },
    supportText: {
        fontSize: rfs(1.7),
        marginBottom: rh(2),
    },
    supportOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    supportOption: {
        width: '48%',
        padding: rw(3),
        borderRadius: rfs(1.5),
        alignItems: 'center',
    },
    supportOptionText: {
        marginTop: rh(1),
        fontSize: rfs(1.6),
        fontWeight: '500',
    },
    tipsSection: {
        marginHorizontal: rw(4),
        marginTop: rh(3),
    },
    tipCard: {
        padding: rw(4),
        borderRadius: rfs(1.5),
        marginBottom: rh(1.5),
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: rh(1),
    },
    tipTitle: {
        fontSize: rfs(1.8),
        fontWeight: '600',
        marginLeft: rw(2),
    },
    tipText: {
        fontSize: rfs(1.7),
        lineHeight: rfs(2.5),
    },
});