import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Card, Icon, useTheme } from 'react-native-paper';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import { useSelector } from 'react-redux';

const ReminderComponent = ({ reminder }) => {
    const theme = useTheme();
    const { user } = useSelector(state => state.userAuth);
    const uid = user.uid;
    const isYouSent = reminder.creditorId === uid; // Boolean value (true if sent, false if received)

    return (
        <View
            style={[
                styles.reminderItem,
                {
                    backgroundColor: isYouSent
                        ? theme.colors.tertiaryContainer  // Sent (Creditor) → Tertiary color
                        : theme.colors.blueContainer,     // Received (Debtor) → Blue color
                },
            ]}
        >
            <Icon
                source="bell-circle"
                size={rfs(4.5)}
                color={
                    isYouSent
                        ? theme.colors.onTertiaryContainer
                        : theme.colors.onBlueContainer
                }
            />
            <Text style={[styles.remindText, { color: theme.colors.onTertiaryContainer }]}>
                <Text style={styles.boldText}>{isYouSent ? "You" : `"${reminder.creditorName}"`}</Text>
                {" "}kindly reminded{" "}
                <Text style={styles.boldText}>{isYouSent ? `"${reminder.debtorName}"` : "You"}</Text>
                {" "}to settle an outstanding amount of{" "}
                <Text style={styles.boldText}>{reminder.amountOwed}</Text>.
            </Text>
        </View>
    );
};
export default ReminderComponent;

const styles = StyleSheet.create({
    reminderItem: {
        flexDirection: 'row',
        padding: rh(1.5),
        marginHorizontal: rh(1),
        marginBottom: rh(2),
        alignItems: 'center',
        gap: rh(1.5),
        borderRadius: rh(1), // Optional: Make it look cleaner
    },
    remindText: {
        flexShrink: 1,
    },
    boldText: {
        fontWeight: "bold",
    },
});
