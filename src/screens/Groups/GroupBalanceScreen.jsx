import { FlatList, StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import LoadingScreen from '../LoadingScreen';
import { useTheme, Text, Icon, Divider } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import BalanceComponent from '../../components/BalanceComponent';
import { listenToBalances, stopListeningToBalances } from '../../redux/listeners/balanceListener';
import { clearBalances, fetchBalances } from '../../redux/slices/balancesSlice';
import { useFocusEffect, useRoute } from '@react-navigation/native';

const GroupBalanceScreen = () => {
    const route = useRoute();
    const { groupId } = route.params;
    const theme = useTheme();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.userAuth);
    const uid = user?.uid;
    const { balances, loading, error } = useSelector((state) => state.balance);
    console.log('Balances ', balances)
    const groupBalances = balances?.filter(balance => balance.groupId === groupId && (balance.creditor.uid === uid || balance.debtor.uid === uid))
    // const groupBalances = useSelector(state =>
    //     state.balances.balance.filter(balance => balance.groupId === groupId)
    // );



    if (!user) {
        return null;
    }


    // useFocusEffect(
    //     React.useCallback(() => {
    //         dispatch(listenToBalances({ uid, groupId }));

    //         return () => {
    //             dispatch(clearBalances()); // ✅ Stop Firestore listener when leaving screen
    //         };
    //     }, [dispatch, uid, groupId])
    // );

    // useEffect(() => {
    //     fetchBalances({ uid })
    //     // dispatch(listenToBalances({ uid, groupId }));

    //     // return () => {
    //     //     dispatch(clearBalances()); // ✅ Stop Firestore listener when leaving screen
    //     // };
    // }, [dispatch, uid, groupId])

    if (loading) {
        return <LoadingScreen />
    }

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

    if (loading) <LoadingScreen />

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.title, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }, { padding: rh(1) }]}>My Balances</Text>
            </View>
            <FlatList
                data={groupBalances}
                keyExtractor={(item) => item.balanceId}
                renderItem={({ item }) => (
                    <BalanceComponent balance={item} />
                )}
                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={balances.length === 0 ? { flex: 1 } : null}
                ItemSeparatorComponent={() => <Divider bold style={styles.divider} />}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: rh(1)
    },
    title: {
        marginHorizontal: rw(2),
        marginVertical: rh(1),
        borderRadius: rh(1)
    },
    sectionTitle: {
        fontWeight: 'bold'
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
        marginVertical: rh(0.5),
    },
})

export default GroupBalanceScreen
