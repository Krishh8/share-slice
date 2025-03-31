import { Linking, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, useTheme, Text, Icon, Card, Surface, Button, Chip, Divider } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import avatars from '../data/Avatar';
import MarkAsPaidModal from './MarkAsPaidModal';
import { openUPIAppForGroupSettlement, payGroupViaRazorpay } from '../services/razorpayService';
import { getFCMToken, requestPermission, sendDebtReminder, setupNotificationListeners } from '../services/notificationService';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native'
import firestore from '@react-native-firebase/firestore';
import { sendReminder } from '../redux/slices/reminderSlice';


const BalanceComponent = ({ balance }) => {
    const theme = useTheme()
    const { user } = useSelector(state => state.userAuth);
    const dispatch = useDispatch()
    const uid = user?.uid
    const [visible, setVisible] = useState(false)

    if (!user) {
        return null;
    }

    const pay = () => {
        payGroupViaRazorpay(balance.creditor, balance.amountOwed, balance.debtor, balance.groupId)
    }

    // useEffect(() => {
    //     // Request permissions on component mount
    //     requestPermission();

    //     // Setup listeners
    //     const unsubscribe = setupNotificationListeners();

    //     return () => {
    //         // Cleanup listeners
    //         unsubscribe();
    //     };
    // }, []);

    // const triggerReminder = async () => {
    //     await sendDebtReminder({
    //         amount: balance.amountOwed,
    //         creditorName: balance.creditor.fullName,
    //         dueDate: new Date('2025-04-15')
    //     });
    // };

    const handleSendReminder = async () => {
        dispatch(sendReminder({
            creditor: balance.creditor,
            amountOwed: balance.amountOwed,
            debtor: balance.debtor
        }));
        alert("Reminder sent successfully!");
    };

    return (
        <View style={[styles.balanceItem, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.user]}>
                <Avatar.Image source={avatars.find(a => a.id === (balance.debtor.avatar))?.uri} size={rfs(6)} />
                <Text style={[styles.name]}>{uid == balance.debtor.uid ? "You" : balance.debtor.fullName}</Text>
                <Text style={[styles.phoneNumber]}>{balance.debtor.phoneNumber.slice(3)}</Text>
            </View>

            <View style={styles.amount}>
                <Text style={[styles.amountText, { color: uid == balance.debtor.uid ? theme.colors.red : theme.colors.green }]}>₹{balance.amountOwed}</Text>
                <Icon source="arrow-right-thin" color={theme.colors.inversePrimary} size={rfs(5)} />
                <Text>will pay </Text>
            </View>

            <View style={[styles.user]}>
                <Avatar.Image source={avatars.find(a => a.id === (balance.creditor.avatar))?.uri} size={rfs(6)} />
                <Text style={[styles.name]}>{uid == balance.creditor.uid ? "You" : balance.creditor.fullName}</Text>
                <Text style={[styles.phoneNumber]}>{balance.creditor.phoneNumber.slice(3)}</Text>
            </View>

            <View style={[styles.btns]}>
                {uid == balance.debtor.uid && <Chip mode='flat' onPress={pay} style={{ backgroundColor: theme.colors.secondaryContainer }}>Pay</Chip>}
                {uid == balance.creditor.uid && <Chip mode='outlined' onPress={handleSendReminder} style={{ backgroundColor: theme.colors.secondaryContainer }}>Remind</Chip>}
                {uid == balance.creditor.uid && <Chip mode='outlined' style={{ backgroundColor: theme.colors.secondaryContainer }} onPress={() => setVisible(true)}>Settle Up</Chip>}
            </View>

            <MarkAsPaidModal visible={visible} onDismiss={() => setVisible(false)} balance={balance} />
        </View>
    )
}

export default BalanceComponent

const styles = StyleSheet.create({
    balanceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: rw(2),
        margin: rw(2),
        alignItems: 'center',
    },
    user: {
        justifyContent: "center",
        alignItems: 'center',
    },
    name: {
        fontSize: rfs(1.8),
        marginTop: rh(1),
        fontWeight: 'bold'
    },
    phoneNumber: {
        fontSize: rfs(1.5)
    },
    amount: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    amountText: {
        fontSize: rfs(2),
        fontWeight: 'bold'
    },
    btns: {
        gap: rh(1)
    }
})