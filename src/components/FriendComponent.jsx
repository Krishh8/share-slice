import { StyleSheet, View } from 'react-native'
import React from 'react'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { Avatar, Button, Card, Chip, Divider, List, Text, useTheme } from 'react-native-paper';
import avatars from '../data/Avatar';

const FriendComponent = ({ friend }) => {
    if (!friend || !friend.user) return null; // Ensure user data exists

    const { user, totalAmount } = friend;
    const isOwed = totalAmount > 0;
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }, { borderColor: theme.colors.outline }]}>
            <View style={[styles.details]}>
                <View style={[styles.details, { justifyContent: 'flex-start' }]}>
                    <Avatar.Image
                        source={user.avatar ? avatars.find(a => a.id === user.avatar)?.uri : null}
                        size={rfs(6)}
                    />
                    <View style={[styles.info]}>
                        <Text style={[styles.name, { color: theme.colors.primary }]}>{user.fullName}</Text>
                        <Text style={[styles.phoneNumber, { color: theme.colors.secondary }]}>{user.phoneNumber.slice(3)}</Text>
                    </View>
                </View>
                <View>
                    <Text style={[styles.amount, { color: isOwed ? theme.colors.green : theme.colors.red }]}>₹{Math.abs(totalAmount).toFixed(2)}</Text>
                </View>
            </View>
            <View style={[styles.btns]}>
                {isOwed && <Chip mode='flat' style={[styles.btn,]}>Remind</Chip>}
                {!isOwed && <Chip mode='flat'>Pay</Chip>}
            </View>
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
    },
    btn: {
        marginRight: rh(1),
    }

})