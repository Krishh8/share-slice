
import React, { useEffect, useState } from 'react';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Text, Avatar, Chip, Divider, useTheme, Surface } from "react-native-paper"
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getGroupByGroupId } from '../services/groupService';
import { getUserByUserId } from '../services/userService';
import { fetchExpenseDetails } from '../redux/slices/expensesSlice';
import LoadingScreen from '../screens/LoadingScreen';
import { fetchGroupDetails } from '../redux/slices/groupSlice';

const BillComponent = ({ expenseDetails, isShrink }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { groupDetails } = useSelector(state => state.group)
    const { user } = useSelector(state => state.userAuth);
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const uid = user?.uid
    const groupId = expenseDetails.groupId
    const theme = useTheme();

    const formatDate = isoString => {
        return new Date(isoString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short', // Full month name (e.g., "March")
            // year: "numeric" // Day of the month (e.g., "3")
        });
    };

    const [payerName, setPayerName] = useState(null);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupDetails(groupId))
        }
    }, [groupId])

    let userOwes = 0;

    // 1️⃣ Check how much the user **owes**
    expenseDetails.splitDetails.forEach(({ uid: userId, share }) => {
        if (userId === uid) {  // Compare with Redux user's uid
            userOwes = share; // Amount user needs to pay
        }
    });

    // 2️⃣ Check how much the user **paid**
    let userPaid = 0;
    expenseDetails.paidBy.forEach(({ uid: payerId, amount }) => {
        if (payerId === uid) {  // Compare with Redux user's uid
            userPaid = amount; // Amount user already paid
        }
    });

    // 3️⃣ Calculate Net Amount (Get or Pay)
    let netAmount = userPaid - userOwes;
    let userAction = netAmount > 0 ? "You get" : "You pay";
    let displayAmount = Math.abs(netAmount);

    useEffect(() => {
        const fetchPayerName = async () => {
            if (expenseDetails.paidBy.length === 1) {
                if (expenseDetails.paidBy[0].uid === uid) {
                    setPayerName('You');
                } else {
                    const name = await getUserByUserId(expenseDetails.paidBy[0].uid);
                    setPayerName(name || 'Unknown User'); // Fallback in case name is null
                }
            }
        };

        fetchPayerName();
    }, [expenseDetails.paidBy, uid, getUserByUserId]);

    return (

        <View style={{ backgroundColor: theme.colors.background }}>
            {/* <Divider bold /> */}
            {!isShrink ?
                <View style={[styles.surface,]}>
                    <TouchableOpacity
                        style={styles.container}
                        onPress={() =>
                            navigation.navigate("MainStack", {
                                screen: "ExpenseDetails",
                                params: { expenseId: expenseDetails.expenseId },
                            })
                        }
                    >
                        <View style={styles.header}>
                            <View style={styles.info}>
                                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {formatDate(expenseDetails?.createdAt)}
                                </Text>
                            </View>
                            <View style={styles.details}>
                                <Chip mode="outlined" style={{ alignSelf: "flex-start" }} textStyle={{ color: theme.colors.primary }}>
                                    {groupDetails?.groupName}
                                </Chip>
                            </View>
                        </View>

                        <View style={[styles.header, { marginTop: rh(1.5) }]}>
                            <View style={styles.info}>
                                <Avatar.Icon
                                    icon={expenseDetails.category.icon}
                                    size={rfs(5.5)}
                                    color={theme.colors.onPrimary}
                                    style={{ backgroundColor: theme.colors.primary }}
                                />
                            </View>
                            <View style={styles.details}>
                                <Text style={{ fontSize: rfs(2.5) }}>
                                    {expenseDetails.description}
                                </Text>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {expenseDetails.paidBy.length === 1
                                        ? `${payerName} paid`
                                        : `${expenseDetails.paidBy.length} people paid`}{" "}
                                    {expenseDetails.amount}
                                </Text>
                            </View>
                            <View style={styles.splits}>
                                <Text variant="titleMedium" style={{ color: netAmount > 0 ? theme.colors.green : theme.colors.red }}>
                                    {userAction}
                                </Text>
                                <Text variant="titleMedium" style={{ color: netAmount > 0 ? theme.colors.green : theme.colors.red }}>
                                    ₹{displayAmount}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                : <View style={[styles.surface]}>
                    <TouchableOpacity
                        style={styles.container}
                        onPress={() =>
                            navigation.navigate("MainStack", {
                                screen: "ExpenseDetails",
                                params: { expenseId: expenseDetails.expenseId },
                            })
                        }
                    >
                        <View style={styles.header}>
                            <View style={styles.info}>
                                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {formatDate(expenseDetails?.createdAt)}
                                </Text>
                            </View>
                            <View style={styles.details}>
                                <Text variant="titleMedium" style={{ fontWeight: "500" }}>
                                    {expenseDetails.description}
                                </Text>
                            </View>
                            <View style={styles.splits}>
                                <Text variant="titleMedium" style={{ color: netAmount > 0 ? theme.colors.green : theme.colors.red }}>
                                    ₹{displayAmount}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>}
            {/* <Divider bold /> */}
        </View>

    );
};


export default BillComponent;

const styles = StyleSheet.create({
    surface: {
    },
    container: {
        paddingVertical: rh(1.5),
        paddingHorizontal: rh(2),
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    info: {
        width: "20%",
        alignItems: "flex-start",
    },
    details: {
        flex: 1,
    },
    splits: {
        width: "20%",
        alignItems: "flex-end",
    },
    shrink: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})

