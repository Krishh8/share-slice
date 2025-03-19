import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { Avatar, Button, Card, Chip, Divider, List, Text, useTheme } from 'react-native-paper';
import avatars from '../data/Avatar';
import { openUPIAppForFullSettlement } from '../services/upiHandler';
import MarkAsAllPaidModal from './MarkAsAllPaidModal';
import { useSelector } from 'react-redux';

const FriendComponent = ({ friend }) => {
    if (!friend || !friend.otherUser) return null; // Ensure otherUser data exists
    const [visible, setVisible] = useState(false)


    const { otherUser, totalAmount } = friend;
    const amountOwed = Math.abs(totalAmount).toFixed(2)
    const isOwed = totalAmount > 0;
    const theme = useTheme();
    const { user } = useSelector(state => state.userAuth)
    const uid = user.uid
    const payViaUPI = () => {
        openUPIAppForFullSettlement(otherUser, amountOwed, uid)
    }


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
                {!isOwed && <Chip mode='flat' onPress={payViaUPI} style={{ backgroundColor: theme.colors.secondaryContainer }}>Pay</Chip>}
                {isOwed && <Chip mode='outlined' style={{ backgroundColor: theme.colors.secondaryContainer }}>Remind</Chip>}
                {isOwed && <Chip mode='outlined' style={{ backgroundColor: theme.colors.secondaryContainer }} onPress={() => setVisible(true)}>Settle Up</Chip>}
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