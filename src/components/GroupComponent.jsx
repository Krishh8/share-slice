import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Avatar, Card, IconButton, Text, useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';

const GroupComponent = ({ group, totalAmount }) => {
    const theme = useTheme()
    const navigation = useNavigation()
    const { user } = useSelector((state) => state.userAuth)

    return (
        <Card
            style={styles.groupCard}
            onPress={() => navigation.navigate("MainStack", { screen: "GroupDetails", params: { groupId: group.groupId } })}
        >
            <Card.Content style={styles.groupCardContent}>
                <View style={styles.groupIconContainer}>
                    <Avatar.Icon
                        size={rfs(6)}
                        icon={group.category.icon || "account-group"}
                        color={theme.colors.onPrimary}
                        style={{ backgroundColor: theme.colors.primary }}
                    />
                </View>
                <View style={styles.groupInfo}>
                    <Text style={[styles.groupName, { color: theme.colors.primary }]}>{group?.groupName}</Text>
                    {group.members && (
                        <Text style={[styles.groupMembers, { color: theme.colors.secondary }]}>
                            {group.members.length} {group?.members.length === 1 ? "member" : "members"}
                        </Text>
                    )}
                </View>
                {totalAmount != 0 ?
                    <Text style={{ color: totalAmount > 0 ? theme.colors.green : theme.colors.red, fontWeight: "bold" }}>
                        {totalAmount > 0 ? `+ ₹${totalAmount}` : `- ₹${Math.abs(totalAmount)}`}
                    </Text>
                    :
                    <Text style={{ color: theme.colors.secondary }}>
                        All settled up
                    </Text>
                }

                <IconButton icon="chevron-right" size={rfs(3)} iconColor={theme.colors.outline} />
            </Card.Content>
        </Card>
    )
}

export default GroupComponent

const styles = StyleSheet.create({
    groupCard: {
        marginBottom: rh(1.5),
        borderRadius: rh(1),
        elevation: 2,
    },
    groupCardContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: rh(1),
    },
    groupIconContainer: {
        marginRight: rw(3),
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: rfs(2.2),
        fontWeight: "600",
    },
    groupMembers: {
        fontSize: rfs(1.8),
        opacity: 0.7,
        marginTop: rh(0.5),
    },
})