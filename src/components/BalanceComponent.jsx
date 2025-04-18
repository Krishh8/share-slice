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
import { showToast } from '../services/toastService';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BalanceComponent = ({ balance }) => {
    const theme = useTheme()
    const { user } = useSelector(state => state.userAuth);
    const dispatch = useDispatch()
    const uid = user?.uid
    const [visible, setVisible] = useState(false)
    const [reminderDisabled, setReminderDisabled] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);

    if (!user) {
        return null;
    }

    const pay = () => {
        payGroupViaRazorpay(balance.creditor, balance.amountOwed, balance.debtor, balance.groupId)
    }

    useEffect(() => {
        const checkReminderStatus = async () => {
            const lastReminderTime = await AsyncStorage.getItem(`lastReminder_${balance.debtor.uid}`);
            if (lastReminderTime) {
                const elapsedTime = Date.now() - parseInt(lastReminderTime, 10);
                const remaining = 43200000 - elapsedTime; // 12 hours = 43200000 ms

                if (remaining > 0) {
                    setReminderDisabled(true);
                    setRemainingTime(Math.ceil(remaining / 60000)); // Convert to minutes
                    setTimeout(() => setReminderDisabled(false), remaining);
                } else {
                    setReminderDisabled(false);
                }
            }
        };

        checkReminderStatus();
    }, []);

    const handleSendReminder = async () => {
        try {
            await dispatch(sendReminder({
                creditor: balance.creditor,
                amountOwed: balance.amountOwed,
                debtor: balance.debtor
            })).unwrap();

            showToast('success', 'Reminder sent successfully.');

            const currentTime = Date.now();
            await AsyncStorage.setItem(`lastReminder_${balance.debtor.uid}`, currentTime.toString());

            setReminderDisabled(true);
            setRemainingTime(720); // 12 hours in minutes

            setTimeout(() => setReminderDisabled(false), 43200000); // 12 hours = 43200000 ms
        } catch (error) {
            showToast('error', 'Failed to send reminder.');
        }
    };

    return (
        <View style={[styles.balanceItem, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.user]}>
                <Avatar.Image source={avatars.find(a => a.id === (balance.debtor.avatar))?.uri} size={rfs(6)} />
                <Text numberOfLines={1}
                    ellipsizeMode="tail" style={[styles.name]}>{uid == balance.debtor.uid ? "You" : balance.debtor.fullName}</Text>
                <Text style={[styles.phoneNumber]}>{balance.debtor.phoneNumber.slice(3)}</Text>
            </View>

            <View style={styles.amount}>
                <Text style={[styles.amountText, { color: uid == balance.debtor.uid ? theme.colors.red : theme.colors.green }]}>₹{balance.amountOwed}</Text>
                <Icon source="arrow-right-thin" color={uid == balance.debtor.uid ? theme.colors.red : theme.colors.green} size={rfs(5)} />
                <Text style={[{ color: uid == balance.debtor.uid ? theme.colors.red : theme.colors.green }]}>will pay </Text>
            </View>

            <View style={[styles.user]}>
                <Avatar.Image source={avatars.find(a => a.id === (balance.creditor.avatar))?.uri} size={rfs(6)} />
                <Text numberOfLines={1}
                    ellipsizeMode="tail" style={[styles.name]}>{uid == balance.creditor.uid ? "You" : balance.creditor.fullName}</Text>
                <Text style={[styles.phoneNumber]}>{balance.creditor.phoneNumber.slice(3)}</Text>
            </View>

            <View style={[styles.btns]}>
                {uid == balance.debtor.uid && <Chip onPress={pay} style={{ backgroundColor: theme.colors.secondaryContainer }}>Pay</Chip>}
                {uid == balance.creditor.uid && (
                    <Chip
                        onPress={handleSendReminder}
                        style={{ backgroundColor: theme.colors.secondaryContainer }}
                        disabled={reminderDisabled}
                    >
                        {reminderDisabled
                            ? `Wait ${Math.floor(remainingTime / 60)}h ${remainingTime % 60}m`
                            : "Remind"}

                    </Chip>
                )}
                {uid == balance.creditor.uid && <Chip style={{ backgroundColor: theme.colors.secondaryContainer }} onPress={() => setVisible(true)}>Settle Up</Chip>}
            </View>

            <MarkAsPaidModal visible={visible} onDismiss={() => setVisible(false)} balance={balance} />
        </View>
    );
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
        // flexShrink: 1,
        width: '25%'
    },
    name: {
        fontSize: rfs(1.8),
        marginTop: rh(1),
        fontWeight: 'bold',
        flexShrink: 1
    },
    phoneNumber: {
        fontSize: rfs(1.5)
    },
    amount: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '25%',
        flexShrink: 1
    },
    amountText: {
        fontSize: rfs(2),
        fontWeight: 'bold'
    },
    btns: {
        gap: rh(1),
        // flexShrink: 1
    }
})