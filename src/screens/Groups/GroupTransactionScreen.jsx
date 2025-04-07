import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, Chip, Divider, Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import LoadingScreen from '../LoadingScreen';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import { deleteTransaction, fetchTransactions } from '../../redux/slices/transactionsSlice';
import CustomAlert from '../../components/CustomAlert';
import { listenToTransactions } from '../../redux/listeners/transactionListener';

const GroupTransactionScreen = () => {
    const theme = useTheme()
    const route = useRoute();
    const { groupId } = route.params;
    const dispatch = useDispatch();
    const { transactions, loading, error } = useSelector(state => state.transaction);
    const { user } = useSelector(state => state.userAuth)
    const uid = user.uid
    const [alertVisible, setAlertVisible] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [isShrink, setIsShrink] = useState(false)
    const [paymentFilter, setPaymentFilter] = useState('All'); // 'All', 'Cash', 'Online'
    const [refreshing, setRefreshing] = useState(false)


    useEffect(() => {
        // Only start listener once if not already active
        if (!transactions || Object.keys(transactions).length === 0) {
            dispatch(fetchTransactions());
            const unsubscribe = dispatch(listenToTransactions());
            return () => unsubscribe();
        }
    }, [dispatch]);


    if (loading) return <LoadingScreen />;
    if (error) return <Text style={{ color: 'red' }}>Error: {error}</Text>;

    let groupTransactions = transactions[groupId] || [];

    if (paymentFilter !== 'All') {
        groupTransactions = groupTransactions.filter(txn => txn.paymentMethod === paymentFilter);
    }


    const handleDeleteTransaction = (transactionId) => {
        setSelectedTransactionId(transactionId);
        setAlertVisible(true);
    };

    const confirmDelete = () => {
        if (selectedTransactionId) {
            dispatch(deleteTransaction(selectedTransactionId));
        }
        setAlertVisible(false);
        setSelectedTransactionId(null);
    };

    const formatDateTime = (timestamp) => {
        const date = timestamp.toDate(); // 🔁 Convert Firestore Timestamp to JS Date
        const datePart = date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

        const timePart = date.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        return isShrink ? `${datePart}` : `${datePart}  :  ${timePart}`;
    };

    // const onRefresh = useCallback(() => {
    //     setRefreshing(true);
    //     dispatch(fetchTransactions()).finally(() => {
    //         setRefreshing(false);
    //     });
    // }, [dispatch]);

    const renderEmptyComponent = () => (
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.emptyContent}>
                <Icon source="cash" size={rfs(8)} color={theme.colors.primary} />
                <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>No expenses yet</Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.secondary }]}>
                    No Balances Remaining.
                </Text>
            </View>
        </View>
    );

    const renderItem = ({ item }) => {
        return !isShrink ? (
            <View style={[styles.settlement]}>
                <View style={styles.header}>
                    <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                        Paid On : <Text style={{ color: theme.colors.secondary }}>{formatDateTime(item?.timestamp)}</Text>
                    </Text>
                </View>

                <View style={[styles.header, { marginTop: rh(1.5) }]}>
                    <View style={styles.info}>
                        <Avatar.Icon
                            icon={item.paymentMethod === 'Cash' ? 'cash' : 'credit-card'}
                            size={rfs(6)}
                            color={theme.colors.onPrimary}
                            style={{ backgroundColor: theme.colors.primary }}
                        />
                    </View>

                    <View style={styles.details}>
                        <Text style={{ fontSize: rfs(2), marginBottom: rw(1) }}>
                            Settlement with {item.creditorId === uid ? item.debtorName : item.creditorName}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            {item.debtorId === uid ? "You" : item.debtorName} paid {item.creditorId === uid ? "You" : item.creditorName}
                            <Text style={[{ color: item.creditorId === uid ? theme.colors.green : theme.colors.red }]}> ₹{item.paidAmount}</Text>
                        </Text>
                    </View>

                    <Chip
                        mode='contained'
                        textStyle={{ color: theme.colors.onError }}
                        style={{ backgroundColor: theme.colors.error }}
                        onPress={() => handleDeleteTransaction(item.id)}
                    >
                        Delete
                    </Chip>
                </View>

                <Divider style={[styles.divider]} bold />
            </View>
        ) : (
            <View style={[styles.settlement]}>
                <View style={[styles.header]}>
                    <Text variant="labelLarge" style={{ color: theme.colors.secondary }}>{formatDateTime(item?.timestamp)}</Text>

                    <View style={styles.details}>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            {item.debtorId === uid ? "You" : item.debtorName} paid {item.creditorId === uid ? "You" : item.creditorName}
                            <Text style={[{ color: item.creditorId === uid ? theme.colors.green : theme.colors.red }]}> ₹{item.paidAmount}</Text>
                        </Text>
                    </View>

                    <IconButton
                        icon='delete'
                        mode='outlined'
                        size={rfs(2.5)}
                        iconColor={theme.colors.onError}
                        containerColor={theme.colors.error}
                        onPress={() => handleDeleteTransaction(item.id)}
                    />
                </View>
                <Divider style={[styles.divider]} bold />
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity onPress={() => setIsShrink((prev) => !prev)} style={[styles.title, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Text style={[{ color: theme.colors.primary }]}>My Settlements </Text>
                <Icon source={isShrink ? "unfold-more-horizontal" : "unfold-less-horizontal"} size={rfs(3)} color={theme.colors.primary} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: rh(2) }}>
                {['All', 'Cash', 'Online'].map((type) => (
                    <Chip
                        key={type}
                        mode={paymentFilter === type ? 'flat' : 'outlined'}
                        style={{
                            marginHorizontal: rw(2),
                            backgroundColor: paymentFilter === type ? theme.colors.primary : theme.colors.surface,
                        }}
                        textStyle={{ color: paymentFilter === type ? theme.colors.onPrimary : theme.colors.onSurface }}
                        onPress={() => setPaymentFilter(type)}
                    >
                        {type}
                    </Chip>
                ))}
            </View>

            <FlatList
                data={groupTransactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderItem({ item })}
                ListEmptyComponent={renderEmptyComponent}
            // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />

            {/* Delete Confirmation Alert */}
            <CustomAlert
                visible={alertVisible}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction?"
                onClose={() => setAlertVisible(false)}
                onConfirm={confirmDelete}
                confirmText="Yes"
                cancelText="No"
                showCancel={true}
                icon="information-variant"
            />
        </View>
    );
};

export default GroupTransactionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: rh(1)
    },
    title: {
        flexDirection: 'row',
        marginHorizontal: rw(2),
        marginVertical: rh(1),
        // marginBottom: rh(2),
        borderRadius: rh(1),
        padding: rh(1),
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    settlement: {
        paddingHorizontal: rw(3)
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
    divider: {
        marginVertical: rh(2),
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: rh(2)
    },
    info: {
        // width: '18%',
        alignItems: 'flex-start'
    },
    details: {
        flex: 1,
    },
    splits: {
        // width: "30%",
        // borderRadius: rh(1)
    },
})