// import { StyleSheet, View } from 'react-native'
// import React from 'react'
// import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
// import { useTheme, Text } from 'react-native-paper';

// const BalanceComponent = () => {
//     const theme = useTheme()
//     return (
//         <View style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}>
//             <View style={[styles.total, { borderRightColor: theme.colors.onPrimaryContainer }]}>
//                 <Text style={[styles.label, { color: theme.colors.primary }]}>Total Balance:</Text>
//                 <Text style={[styles.amt, { color: theme.colors.primary }]}>$110 </Text>
//             </View>

//             <View >
//                 <Text style={[styles.amt, { color: theme.colors.green }]}>$100 </Text>
//                 <Text style={[styles.label, { color: theme.colors.green }]}>will get</Text>
//             </View>

//             <View >
//                 <Text style={[styles.amt, { color: theme.colors.red }]}>$10 </Text>
//                 <Text style={[styles.label, { color: theme.colors.red }]}>will pay</Text>
//             </View>
//         </View >
//     )
// }

// export default BalanceComponent

// const styles = StyleSheet.create({
//     container: {
//         marginHorizontal: rh(2),
//         marginVertical: rh(4),
//         padding: rh(4),
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         borderRadius: rh(2),
//     },
//     total: {
//         borderRightWidth: rw(0.4),
//         borderStyle: 'dashed',
//         paddingRight: rh(2)
//     },
//     label: {
//         fontSize: rfs(2),
//         textAlign: 'center',
//     },
//     amt: {
//         fontWeight: 500,
//         textAlign: 'center',
//         fontSize: rfs(2.3)
//     },

// })

import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useTheme, Text, Card, Divider, Icon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { listenToBalances, stopListeningToBalances } from '../redux/listeners/balanceListener';
import { clearBalances } from '../redux/slices/balancesSlice';
import LoadingScreen from '../screens/LoadingScreen';
import { useFocusEffect } from '@react-navigation/native';

const TotalBalanceComponent = () => {
    const theme = useTheme();
    const { user } = useSelector(state => state.userAuth)
    const uid = user?.uid;
    const { balances, loading } = useSelector((state) => state.balance);
    const dispatch = useDispatch()


    useFocusEffect(
        React.useCallback(() => {
            dispatch(listenToBalances({ uid }));

            return () => {
                dispatch(clearBalances()); // ✅ Stop Firestore listener when leaving screen
            };
        }, [dispatch, uid])
    );


    // Calculate total amount the user owes (debts)
    const totalOwed = balances
        .filter(balance => balance.debtorId === uid) // User is debtor
        .reduce((sum, balance) => sum + balance.amountOwed, 0);

    // Calculate total amount the user will receive (credits)
    const totalReceivable = balances
        .filter(balance => balance.creditorId === uid) // User is creditor
        .reduce((sum, balance) => sum + balance.amountOwed, 0);

    // Calculate total balance (Will Get - Will Pay)
    const totalBalance = totalReceivable - totalOwed;

    // if (loading) {
    //     return <LoadingScreen />
    // }

    return (
        <Card style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={styles.cardContent}>
                <View style={[styles.total, { borderRightColor: theme.colors.onPrimaryContainer }]}>
                    <Text style={[styles.label, { color: theme.colors.primary }]}>Total Balance</Text>
                    <Text style={[styles.amt, { color: theme.colors.primary }]}>₹{totalBalance.toFixed(2)}</Text>
                </View>

                <View style={styles.balanceItem}>
                    <Icon source="arrow-down-bold" size={rfs(2.5)} color={theme.colors.green} />
                    <Text style={[styles.amt, { color: theme.colors.green }]}>₹{totalReceivable.toFixed(2)}</Text>
                    <Text style={[styles.label, { color: theme.colors.green }]}>will get</Text>
                </View>

                <View style={styles.balanceItem}>
                    <Icon source="arrow-up-bold" size={rfs(2.5)} color={theme.colors.error} />
                    <Text style={[styles.amt, { color: theme.colors.error }]}>₹{totalOwed.toFixed(2)}</Text>
                    <Text style={[styles.label, { color: theme.colors.error }]}>will pay</Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: rw(4),
        marginTop: rh(3),
        elevation: 4,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: rh(2),
    },
    total: {
        borderRightWidth: rw(0.4),
        borderStyle: 'dashed',
        paddingRight: rh(2),
        alignItems: 'center',
        alignSelf: 'center'
    },
    balanceItem: {
        alignItems: 'center',
    },
    label: {
        fontSize: rfs(1.8),
        textAlign: 'center',
    },
    amt: {
        fontWeight: '700',
        textAlign: 'center',
        fontSize: rfs(2.5),
        marginVertical: rh(0.5),
    },
});

export default TotalBalanceComponent