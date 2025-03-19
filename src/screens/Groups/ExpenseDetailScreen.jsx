import React, { useCallback, useEffect, useState } from "react"
import { ScrollView, View, StyleSheet, Animated } from "react-native"
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { Text, Card, Avatar, Chip, IconButton, useTheme, Surface, TouchableRipple, Appbar } from "react-native-paper"
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import { fetchExpenseDetails } from "../../redux/slices/expensesSlice"
import LoadingScreen from "../LoadingScreen"
import avatars from "../../data/Avatar"
import HeaderComponent from "../../components/HeaderComponent"

const ExpenseDetailScreen = () => {
    const route = useRoute()
    const { expenseId } = route.params
    const dispatch = useDispatch()
    const theme = useTheme()
    const navigation = useNavigation()
    const { user } = useSelector(state => state.userAuth)
    const { expenseDetails, expenseDetailsLoading } = useSelector((state) => state.expense)
    const { groupDetails } = useSelector((state) => state.group)
    const [isAdmin, setIsAdmin] = useState(false)

    const fadeAnim = React.useRef(new Animated.Value(0)).current

    if (!user) {
        return null;
    }

    // useFocusEffect(
    //     useCallback(() => {
    //         if (expenseId) {
    //             dispatch(fetchExpenseDetails(expenseId)); // Refetch data
    //         }
    //     }, [dispatch, expenseId])
    // );

    useEffect(() => {
        if (expenseId) {
            dispatch(fetchExpenseDetails(expenseId)); // Refetch data
        }
    }, [dispatch, expenseId])

    useEffect(() => {
        if (expenseDetails && !expenseDetailsLoading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start()
        }
        if (groupDetails) {
            setIsAdmin(groupDetails?.admins.includes(user?.uid) || expenseDetails?.createdBy === user?.uid)
        }
    }, [expenseDetails, expenseDetailsLoading, groupDetails, fadeAnim])

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
    }

    if (expenseDetailsLoading) return <LoadingScreen />
    console.table(expenseDetails)

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <HeaderComponent title="Expense" />
                <Surface style={[styles.headerCard,]}>
                    <View style={[styles.headerContent,]}>
                        <View style={[styles.expenseHeader]}>
                            <Avatar.Icon
                                size={rfs(7)}
                                icon={expenseDetails?.category?.icon || "cash"}
                                color={theme.colors.onPrimary}
                                style={{ backgroundColor: theme.colors.primary }}
                            />
                            <View style={styles.expenseInfo}>
                                <Text style={[styles.expenseDescription, { color: theme.colors.onSurface }]}>
                                    {expenseDetails?.description}
                                </Text>
                                <Chip
                                    mode="outlined"
                                    style={[styles.groupChip, { borderColor: theme.colors.primary }]}
                                    textStyle={{ color: theme.colors.primary }}
                                >
                                    {groupDetails?.groupName}
                                </Chip>
                            </View>
                        </View>
                        <View style={styles.amountContainer}>
                            <Text style={[styles.amountLabel, { color: theme.colors.onSurfaceVariant }]}>Total</Text>
                            <Text style={[styles.amount, { color: theme.colors.primary }]}>₹  {expenseDetails?.amount}</Text>
                        </View>
                    </View>

                    <View style={[styles.dateContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <View style={styles.dateItem}>
                            <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>Created</Text>
                            <Text style={[styles.dateValue, { color: theme.colors.onSurfaceVariant }]}>
                                {formatDate(expenseDetails?.createdAt)}
                            </Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>Updated</Text>
                            <Text style={[styles.dateValue, { color: theme.colors.onSurfaceVariant }]}>
                                {formatDate(expenseDetails?.updatedAt)}
                            </Text>
                        </View>

                        <View style={[styles.buttons]}>
                            <IconButton icon="pencil" size={rfs(3)}
                                onPress={() => navigation.navigate("UpdateExpense", { expenseId })}
                                disabled={!isAdmin} iconColor={theme.colors.primary} />
                        </View>
                    </View>
                </Surface>

                <Card style={[styles.detailCard,]}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <Avatar.Icon
                                size={rfs(3.5)}
                                icon="account"
                                style={[styles.sectionIcon, { backgroundColor: theme.colors.primary }]}
                                color={theme.colors.onPrimary}
                            />
                            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Created By</Text>
                        </View>
                        <View style={[styles.sectionContent, { flexDirection: 'row' }, { alignItems: 'center' }]}>
                            <Avatar.Image
                                size={rfs(3.5)}
                                source={avatars.find(a => a.id === (expenseDetails?.createdByDetails?.avatar))?.uri}
                                style={[styles.sectionIcon, { backgroundColor: theme.colors.primary }]}
                                color={theme.colors.onPrimary}
                            />
                            <Text style={[styles.createdByText, { color: theme.colors.onSurfaceVariant }]}>
                                {expenseDetails?.createdByDetails.fullName || "Unknown"}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={[styles.detailCard]}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <Avatar.Icon
                                size={rfs(3.5)}
                                icon="credit-card"
                                style={[styles.sectionIcon, { backgroundColor: theme.colors.primary }]}
                                color={theme.colors.onPrimary}
                            />
                            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Paid By</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {expenseDetails?.paidBy?.map((payer, index) => (
                                <View key={index} style={styles.payerItem}>
                                    <View style={styles.payerInfo}>
                                        <Avatar.Image
                                            size={rfs(3.5)}
                                            source={avatars.find(a => a.id === (payer.avatar))?.uri}
                                            style={[styles.sectionIcon, { backgroundColor: theme.colors.primary }]}
                                            color={theme.colors.onPrimary}
                                        />
                                        <Text style={[styles.payerName, { color: theme.colors.onSurface }]}>{payer.fullName}</Text>
                                    </View>
                                    <Text style={[styles.payerAmount, { color: theme.colors.primary }]}>₹{payer.amount}</Text>
                                </View>
                            ))}
                        </View>
                    </Card.Content>
                </Card>

                <Card style={[styles.detailCard,]}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <Avatar.Icon
                                size={rfs(3.5)}
                                icon="account-group"
                                style={[styles.sectionIcon, { backgroundColor: theme.colors.primary }]}
                                color={theme.colors.onPrimary}
                            />
                            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Split Among</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {expenseDetails?.splitDetails?.map((participant) => (
                                <View key={participant.uid} style={styles.participantItem}>
                                    <View style={styles.participantInfo}>
                                        <Avatar.Image
                                            size={rfs(3.5)}
                                            source={avatars.find(a => a.id === (participant.avatar))?.uri}
                                            style={[styles.sectionIcon, { backgroundColor: theme.colors.primary }]}
                                            color={theme.colors.onPrimary}
                                        />
                                        <Text style={[styles.participantName, { color: theme.colors.onSurface }]}>
                                            {participant.fullName}
                                        </Text>
                                    </View>
                                    <View style={styles.shareContainer}>
                                        <Chip
                                            mode="flat"
                                            style={[styles.shareChip, { backgroundColor: theme.colors.secondaryContainer }]}
                                            textStyle={{ color: theme.colors.onSecondaryContainer }}
                                        >
                                            {participant.share}
                                        </Chip>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </Card.Content>
                </Card>
            </Animated.View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerCard: {
        margin: rw(4),
        borderRadius: rw(3),
        elevation: 4,
        overflow: "hidden",
    },
    headerContent: {
        padding: rw(4),
    },
    expenseHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    expenseInfo: {
        marginLeft: rw(4),
        flex: 1,
    },
    expenseDescription: {
        fontSize: rfs(2.5),
        fontWeight: "bold",
        marginBottom: rh(1),
    },
    groupChip: {
        alignSelf: "flex-start",
        borderRadius: rw(4),
    },
    amountContainer: {
        marginTop: rh(2),
        alignItems: "flex-end",
    },
    amountLabel: {
        fontSize: rfs(1.8),
    },
    amount: {
        fontSize: rfs(4),
        fontWeight: "bold",
    },
    dateContainer: {
        flexDirection: "row",
        padding: rw(3),
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateItem: {
        flex: 1,
    },
    dateLabel: {
        fontSize: rfs(1.5),
    },
    dateValue: {
        fontSize: rfs(1.8),
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: "flex-end",
        alignItems: "center",
    },
    detailCard: {
        marginHorizontal: rw(4),
        marginBottom: rh(2),
        borderRadius: rw(3),
        overflow: "hidden",
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: rh(2),
    },
    sectionIcon: {
        marginRight: rw(3),
    },
    sectionTitle: {
        fontSize: rfs(2.3),
        fontWeight: "bold",
    },
    sectionContent: {
        marginLeft: rw(2),
    },
    createdByText: {
        fontSize: rfs(2),
        paddingVertical: rh(1),
        marginLeft: rw(3),
    },
    payerItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: rh(1.5),
    },
    payerInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    payerName: {
        marginLeft: rw(3),
        fontSize: rfs(2),
    },
    payerAmount: {
        fontSize: rfs(2),
        fontWeight: "bold",
    },
    participantItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: rh(1.5),
    },
    participantInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    participantName: {
        marginLeft: rw(3),
        fontSize: rfs(2),
    },
    shareContainer: {
        alignItems: "flex-end",
    },
    shareChip: {
        borderRadius: rw(4),
    },
});

export default ExpenseDetailScreen