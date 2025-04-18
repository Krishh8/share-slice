import { StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { Avatar, Button, Card, Chip, Divider, List, Text, useTheme } from 'react-native-paper';
import avatars from '../data/Avatar';
import { openUPIAppForFullSettlement, payGroupViaRazorpay, payViaRazorpay } from '../services/razorpayService';
import MarkAsAllPaidModal from './MarkAsAllPaidModal';
import { useDispatch, useSelector } from 'react-redux';
import { sendReminder } from '../redux/slices/reminderSlice';
import Toast from 'react-native-toast-message';
import { showToast } from '../services/toastService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FriendComponent = ({ friend }) => {
    if (!friend || !friend.otherUser) return null; // Ensure otherUser data exists
    const [visible, setVisible] = useState(false)
    const dispatch = useDispatch()

    const { otherUser, totalAmount } = friend;
    const amountOwed = parseFloat(Math.abs(totalAmount).toFixed(2));
    const isOwed = totalAmount > 0;
    const theme = useTheme();
    const { user } = useSelector(state => state.userAuth)
    const [reminderDisabled, setReminderDisabled] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);

    const pay = () => {
        payViaRazorpay(otherUser, amountOwed, user)
    }

    useEffect(() => {
        const checkReminderStatus = async () => {
            const lastReminderTime = await AsyncStorage.getItem(`lastReminder_${otherUser.uid}`);
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
                creditor: user,
                amountOwed,
                debtor: otherUser
            })).unwrap();

            showToast('success', 'Reminder sent successfully.');

            const currentTime = Date.now();
            await AsyncStorage.setItem(`lastReminder_${otherUser.uid}`, currentTime.toString());

            setReminderDisabled(true);
            setRemainingTime(720); // 12 hours in minutes

            setTimeout(() => setReminderDisabled(false), 43200000); // 12 hours = 43200000 ms
        } catch (error) {
            showToast('error', 'Failed to send reminder.');
        }
    };




    return (
        <View style={[styles.container, { backgroundColor: theme.colors.shadow }, { borderColor: theme.colors.outline }]}>
            <View style={[styles.details]}>
                <View style={[styles.details, { justifyContent: 'flex-start', width: '60%' }]}>
                    <Avatar.Image
                        source={otherUser.avatar ? avatars.find(a => a.id === otherUser.avatar)?.uri : null}
                        size={rfs(6)}
                    />
                    <View style={[styles.info]}>
                        <Text numberOfLines={1}
                            ellipsizeMode="tail" style={[styles.name, { color: theme.colors.primary }]}>{otherUser.fullName}</Text>
                        <Text style={[styles.phoneNumber, { color: theme.colors.secondary }]}>{otherUser.phoneNumber.slice(3)}</Text>
                    </View>
                </View>
                <View>
                    <Text style={[styles.amount, { color: isOwed ? theme.colors.green : theme.colors.red }]}>₹{amountOwed}</Text>
                </View>
            </View>
            <View style={[styles.btns]}>
                {!isOwed && <Chip onPress={pay} style={{ backgroundColor: theme.colors.secondaryContainer }}>Pay</Chip>}
                {isOwed && <Chip
                    onPress={handleSendReminder}
                    style={{ backgroundColor: theme.colors.secondaryContainer }}
                    disabled={reminderDisabled}
                >
                    {reminderDisabled
                        ? `Wait ${Math.floor(remainingTime / 60)}h ${remainingTime % 60}m`
                        : "Remind"}

                </Chip>}
                {isOwed && <Chip onPress={() => setVisible(true)} style={{ backgroundColor: theme.colors.secondaryContainer }} >Settle Up</Chip>}
            </View>

            <MarkAsAllPaidModal visible={visible} onDismiss={() => setVisible(false)} amountOwed={amountOwed} debtor={otherUser} />
        </View>
    );
};

export default FriendComponent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: rh(1.5),
        marginBottom: rh(1),
        marginHorizontal: rw(2),
        // borderWidth: rw(0.2),
        borderRadius: rw(3),
        borderStyle: 'dashed'
    },
    details: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: rh(1),
        justifyContent: 'space-between',
        flexShrink: 1
    },
    name: {
        fontWeight: 'bold',
        fontSize: rfs(2),
        flexShrink: 1
    },
    phoneNumber: {
        fontSize: rfs(1.8)
    },
    amount: {
        fontWeight: 'bold',
        fontSize: rfs(2),
        marginRight: rh(1)
    },
    info: {
        // marginLeft: rw(2)
        flex: 1,
    },
    btns: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: rh(1),
        gap: rh(1)
    },
})