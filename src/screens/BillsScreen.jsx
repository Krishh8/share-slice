import {
    View,
    StyleSheet,
    FlatList,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    SectionList
} from 'react-native';
import {
    Text,
    Button,
    useTheme,
    FAB,
    Icon,
    Appbar,
    Searchbar,
    IconButton,
    Divider,
    Avatar,
} from 'react-native-paper';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchExpenses } from '../redux/slices/expensesSlice';
import { useNavigation } from '@react-navigation/native';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import BillComponent from '../components/BillComponent';
import LoadingScreen from './LoadingScreen';
import { QueryEndAtConstraint } from '@react-native-firebase/firestore';


const BillsScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { expenses, expensesLoading, expensesError } = useSelector((state) => state.expense);
    const { user } = useSelector(state => state.userAuth);
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const uid = user?.uid
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState("")
    const [displayBills, setDisplayBills] = useState([])
    const [isShrink, setIsShrink] = useState(false)

    useEffect(() => {
        if (uid) {
            dispatch(fetchExpenses(uid));
        }
    }, [dispatch, uid]);

    useEffect(() => {
        setDisplayBills(expenses)
    }, [expenses])

    const groupExpensesByMonth = (expenses) => {
        const grouped = expenses
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date (newest first)
            .reduce((acc, expense) => {
                const date = new Date(expense.createdAt); // Convert ISO string to Date
                const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' }); // "March 2024"

                if (!acc[monthYear]) {
                    acc[monthYear] = { title: monthYear, data: [] };
                }
                acc[monthYear].data.push(expense);
                return acc;
            }, {});

        return Object.values(grouped); // Convert object to array for SectionList
    };


    const sections = groupExpensesByMonth(displayBills);


    const handleSearch = (query) => {
        setSearchQuery(query)

        let filtered = expenses

        if (query.trim() !== "") {
            const lowerCaseQuery = query.toLowerCase()
            filtered = filtered.filter((bill) => bill.description.toLowerCase().includes(lowerCaseQuery))
        }

        setDisplayBills(filtered)
    }

    if (expensesLoading) return <LoadingScreen />;
    if (expensesError) return (
        <View style={styles.errorContainer}>
            <Icon source="alert-circle" size={rfs(10)} color={theme.colors.error} />
            <Text style={{ color: theme.colors.error, fontSize: rfs(2.5), marginTop: rh(2) }}>
                Error: {expensesError?.toString() || 'Something went wrong'}
            </Text>
        </View>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >
            <View style={[styles.billsContainer, { backgroundColor: theme.colors.background }]}>
                {/* Header Section */}
                <View style={[styles.headerSection, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <View style={styles.headerContainer}>
                        <Text style={[styles.title, { color: theme.colors.onSecondaryContainer }]}>Bills</Text>
                    </View>

                    {/* Search Bar */}
                    <Searchbar
                        style={[styles.searchbar,
                            // { backgroundColor: theme.colors.surfaceVariant }
                        ]}
                        placeholder="Search expenses..."
                        onChangeText={handleSearch}
                        value={searchQuery}
                        iconColor={theme.colors.primary}
                    // placeholderTextColor={theme.colors.onSurfaceVariant}
                    />
                </View>

                <View style={[styles.shrinkIcon]}>
                    <IconButton icon={isShrink ? "unfold-more-horizontal" : "unfold-less-horizontal"} size={rfs(4)} iconColor={theme.colors.primary} onPress={() => setIsShrink((prev) => !prev)} />
                </View>

                <SectionList
                    sections={sections} // ✅ Now correctly formatted as an array of { title, data }
                    keyExtractor={(item) => item.expenseId}
                    renderItem={({ item }) => <BillComponent expenseDetails={item} isShrink={isShrink} />}

                    // Render Month Headers
                    renderSectionHeader={({ section: { title, data } }) => (
                        <View style={[{ backgroundColor: theme.colors.secondaryContainer }, styles.sectionHeader]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{title}</Text>
                            <Avatar.Text style={{ fontWeight: 'bold' }} size={rfs(2.5)} label={data.length} />
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon source="receipt" size={rfs(10)} color={theme.colors.primary} />
                            <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>No expenses found</Text>
                        </View>
                    }
                    ItemSeparatorComponent={() => <Divider bold style={styles.divider} />}
                    contentContainerStyle={expenses.length === 0 ? { flex: 1, justifyContent: 'center' } : { padding: rw(2), paddingTop: rh(0) }}
                />

            </View>
        </TouchableWithoutFeedback>
    );
};


const styles = StyleSheet.create({
    billsContainer: {
        flex: 1,
    },
    headerSection: {
        paddingTop: rh(2),
        paddingBottom: rh(1),
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: rw(4),
        marginBottom: rh(2),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: rw(4),
    },
    emptyText: {
        fontSize: rfs(2.5),
        marginTop: rh(2),
        opacity: 0.6,
    },
    title: {
        fontSize: rfs(4),
        fontWeight: "bold",
    },
    createButton: {
        borderRadius: rh(1),
    },
    searchbar: {
        marginHorizontal: rw(4),
        marginBottom: rh(2),
        borderRadius: rh(1),
        elevation: 0,
    },
    shrinkIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: rh(1),
    },
    sectionTitle: {
        fontWeight: 'bold'
    },
    divider: {
        marginVertical: rh(0.5),
    }
})

export default BillsScreen
