import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { Avatar, Button, Card, Chip, Divider, List, Text, useTheme } from 'react-native-paper';
import avatars from '../data/Avatar';
import { openUPIAppForFullSettlement, payGroupViaRazorpay } from '../services/razorpayService';
import MarkAsAllPaidModal from './MarkAsAllPaidModal';
import { useDispatch, useSelector } from 'react-redux';
import { sendReminder } from '../redux/slices/reminderSlice';
import Toast from 'react-native-toast-message';

const FriendComponent = ({ friend }) => {
    if (!friend || !friend.otherUser) return null; // Ensure otherUser data exists
    const [visible, setVisible] = useState(false)
    const dispatch = useDispatch()

    const { otherUser, totalAmount } = friend;
    const amountOwed = parseFloat(Math.abs(totalAmount).toFixed(2));
    const isOwed = totalAmount > 0;
    const theme = useTheme();
    const { user } = useSelector(state => state.userAuth)

    const pay = () => {
        payViaRazorpay(otherUser, amountOwed, user)
    }

    const showToast = (type, message) => {
        Toast.show({
            type,
            text1: message,
        });
    };

    const handleSendReminder = async () => {
        try {
            const result = await dispatch(sendReminder({
                creditor: user,
                amountOwed,
                debtor: otherUser
            })).unwrap(); // Unwrap returns only the payload

            console.log("Reminder sent successfully:", result);
            showToast('success', 'Reminder sent successfully! 🎉');
        }
        catch (error) {
            console.error("Reminder failed:", error);
            showToast('error', `Failed to send reminder. ${error.message || 'Please try again.'} ❌`);
        }
    };




    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }, { borderColor: theme.colors.outline }]}>
            <View style={[styles.details]}>
                <View style={[styles.details, { justifyContent: 'flex-start' }]}>
                    <Avatar.Image
                        source={otherUser.avatar ? avatars.find(a => a.id === otherUser.avatar)?.uri : null}
                        size={rfs(6)}
                    />
                    <View style={[styles.info]}>
                        <Text style={[styles.name, { color: theme.colors.primary }]}>{otherUser.fullName}</Text>
                        <Text style={[styles.phoneNumber, { color: theme.colors.secondary }]}>{otherUser.phoneNumber.slice(3)}</Text>
                    </View>
                </View>
                <View>
                    <Text style={[styles.amount, { color: isOwed ? theme.colors.green : theme.colors.red }]}>₹{amountOwed}</Text>
                </View>
            </View>
            <View style={[styles.btns]}>
                {!isOwed && <Chip onPress={pay} style={{ backgroundColor: theme.colors.secondaryContainer }}>Pay</Chip>}
                {isOwed && <Chip onPress={handleSendReminder} style={{ backgroundColor: theme.colors.secondaryContainer }}>Remind</Chip>}
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
        padding: rh(1),
        marginBottom: rh(1),
        marginHorizontal: rw(2),
        borderWidth: rw(0.2),
        borderRadius: rw(4),
        borderStyle: 'dashed'
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    name: {
        fontWeight: 'bold',
        fontSize: rfs(2)
    },
    phoneNumber: {
        fontSize: rfs(1.8)
    },
    amount: {
        fontWeight: 'bold',
        fontSize: rfs(2)
    },
    info: {
        marginLeft: rw(2)
    },
    btns: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: rh(1),
        gap: rh(1)
    },
})