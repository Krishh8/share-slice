import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { Surface, useTheme, Button, Card, Divider, Icon } from 'react-native-paper';
import BillComponent from './BillComponent';
import { fetchExpenses } from '../redux/slices/expensesSlice';
import LoadingScreen from '../screens/LoadingScreen';
import Animated, { FadeInRight } from 'react-native-reanimated';

const RecentBillComponent = () => {
    const dispatch = useDispatch();
    const { expenses, expensesLoading, expensesError } = useSelector((state) => state.expense);
    const { user } = useSelector(state => state.userAuth);
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const uid = user?.uid
    const theme = useTheme();

    useEffect(() => {
        if (uid) {
            dispatch(fetchExpenses(uid));
        }
    }, [dispatch, uid]);

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
        <View style={{ flex: 1 }}>
            <FlatList
                data={expenses.slice(0, 10)}
                keyExtractor={(item) => item.expenseId}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInRight.delay(index * 50)}>
                        <BillComponent expenseDetails={item} isShrink={false} />
                    </Animated.View>
                )}
                ListEmptyComponent={
                    <Card style={styles.comingSoonCard}>
                        <Card.Content style={styles.comingSoonContent}>
                            <Icon source="receipt" size={rfs(6)} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={[styles.comingSoonText, { color: theme.colors.secondary }]}>
                                Your recent bills will appear here
                            </Text>
                        </Card.Content>
                    </Card>
                }
                ItemSeparatorComponent={() => <Divider bold style={styles.divider} />}
                contentContainerStyle={expenses.length === 0 ? { flex: 1, justifyContent: 'center' } : { paddingHorizontal: rw(2) }}
            />
        </View>
    )
}

export default RecentBillComponent

const styles = StyleSheet.create({
    comingSoonCard: {
        marginHorizontal: rw(4),
        marginTop: rh(1),
        borderRadius: rh(2),
    },
    comingSoonContent: {
        alignItems: 'center',
        padding: rh(3),
    },
    comingSoonText: {
        marginTop: rh(1),
        opacity: 0.7,
    },
    divider: {
        marginVertical: rh(0.5)
    }
})