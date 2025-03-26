import { StyleSheet, Text, View, FlatList, Image, SectionList } from 'react-native';
import React, { useEffect, useState } from 'react';
import AddExpensesGroupButtonComponent from '../../components/AddExpensesGroupButtonComponent';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupExpenses } from '../../redux/slices/expensesSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import BillComponent from '../../components/BillComponent';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import LoadingScreen from '../LoadingScreen';
import { Surface, useTheme, Button, Card, Divider, Icon, IconButton, Avatar } from 'react-native-paper';
import Animated, { FadeInRight } from 'react-native-reanimated';

const GroupExpensesScreen = () => {
    const route = useRoute();
    const { groupId } = route.params;
    const [state, setState] = useState({ open: false });
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const theme = useTheme();
    const { groupExpenses, groupExpensesLoading, groupExpensesError } = useSelector(state => state.expense);
    const onStateChange = ({ open }) => setState({ open });
    const [isShrink, setIsShrink] = useState(false);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupExpenses(groupId));
        }
    }, [dispatch, groupId]);

    if (groupExpensesLoading) return <LoadingScreen />;
    if (groupExpensesError) return (
        <View style={styles.errorContainer}>
            <Text style={{ color: theme.colors.error }}>Error: {groupExpensesError}</Text>
        </View>
    );

    const groupExpensesByMonth = (expenses) => {
        console.log('reach 2')
        const grouped = expenses
            .slice() // ✅ Clone the array to avoid modifying Redux state
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date (newest first)
            .reduce((acc, expense) => {
                const date = new Date(expense.createdAt);
                const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

                if (!acc[monthYear]) {
                    acc[monthYear] = { title: monthYear, data: [] };
                }
                acc[monthYear] = { ...acc[monthYear], data: [...acc[monthYear].data, expense] }; // ✅ Immutability

                return acc;
            }, {});

        return Object.values(grouped);
    };

    // const expensesList = [...(groupExpenses[groupId] || [])]; // ✅ Clone to prevent mutation
    const expensesList = Array.isArray(groupExpenses[groupId]) ? [...groupExpenses[groupId]] : [];
    console.log('reach')


    const groupedExpenses = groupExpensesByMonth(expensesList); // ✅ Grouped expenses

    const renderEmptyComponent = () => (
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.emptyContent}>
                <Icon source="receipt" size={rfs(8)} color={theme.colors.primary} />
                <Text style={[styles.emptyText, { color: theme.colors.primary }]}>No expenses yet</Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.secondary }]}>
                    Add your first expense to start tracking group spending
                </Text>
                <Button
                    mode="contained"
                    icon="plus"
                    style={styles.addFirstButton}
                    onPress={() => {
                        onStateChange({ open: false });
                        navigation.navigate('AddExpense');
                    }}
                >
                    Add First Expense
                </Button>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.shrinkIcon]}>
                <IconButton icon={isShrink ? "unfold-more-horizontal" : "unfold-less-horizontal"} size={rfs(4)} iconColor={theme.colors.primary} onPress={() => setIsShrink((prev) => !prev)} />
            </View>

            {/* ✅ Use SectionList Instead of FlatList */}
            <SectionList
                sections={groupedExpenses} // ✅ Pass grouped data
                keyExtractor={(item) => item.expenseId}
                renderItem={({ item, index }) => <Animated.View entering={FadeInRight.delay(index * 50)}>
                    <BillComponent expenseDetails={item} isShrink={isShrink} />
                </Animated.View>
                }

                // ✅ Render Month Headers
                renderSectionHeader={({ section: { title, data } }) => (
                    <View style={[{ backgroundColor: theme.colors.secondaryContainer }, styles.sectionHeader]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{title}</Text>
                        <Avatar.Text style={{ fontWeight: 'bold' }} size={rfs(2.5)} label={data.length} />
                    </View>
                )}

                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={expensesList.length === 0 ? { flex: 1 } : { padding: rw(2), paddingTop: rh(0) }}
                ItemSeparatorComponent={() => <Divider bold style={styles.divider} />}
            />

            <AddExpensesGroupButtonComponent open={state.open} onStateChange={onStateChange} />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: rh(2),
    },
    emptyContainer: {
        margin: rh(2),
        flex: 1,
        justifyContent: 'center',
    },
    emptyContent: {
        alignItems: 'center',
        padding: rh(3),
    },
    emptyImage: {
        width: rw(50),
        height: rh(20),
        marginBottom: rh(2),
    },
    emptyText: {
        fontSize: rfs(3),
        fontWeight: 'bold',
        marginBottom: rh(1),
    },
    emptySubtext: {
        fontSize: rfs(2),
        textAlign: 'center',
        opacity: 0.7,
        marginBottom: rh(3),
    },
    addFirstButton: {
        borderRadius: rh(1),
        paddingHorizontal: rw(4),
    },
    divider: {
        marginVertical: rh(0.5),
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
        borderRadius: rh(1)
    },
    sectionTitle: {
        fontWeight: 'bold'
    }
});

export default GroupExpensesScreen