import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Avatar, Text, IconButton, useTheme, Icon, Card } from "react-native-paper";
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import CreateGroupModal from "./CreateGroupModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroups } from "../redux/slices/groupSlice";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";

const RecentGroupsComponent = () => {
    const theme = useTheme();
    const dispatch = useDispatch()
    const navigation = useNavigation();
    const [visible, setVisible] = useState(false);
    const { groups } = useSelector(state => state.group)
    const { user } = useSelector(state => state.userAuth);
    if (!user) {
        return null; // Don't render anything if user is null
    }

    const uid = user?.uid
    const [displayGroups, setDisplayGroups] = useState([]);


    useEffect(() => {
        dispatch(fetchGroups(uid));
    }, [dispatch, uid]); // ✅ Run only when uid changes

    useEffect(() => {
        const groupArray = Object.values(groups)
            // .sort((a, b) => b.createdAt - a.createdAt) // Sort from newest to oldest
            .slice(0, 5); // Take only the last 5 groups

        setDisplayGroups(groupArray); // ✅ Show only last 5 created groups
    }, [groups]);


    const renderItem = ({ item, index }) => (
        <Animated.View entering={FadeInRight.delay(index * 50)} style={styles.groupContainer}>
            <View style={styles.avatarContainer}>
                <Avatar.Icon size={rfs(7)} icon={item.category.icon} />
                <IconButton
                    icon="arrow-right-bottom"
                    size={rfs(2)}
                    onPress={() => navigation.navigate('GroupDetails', { groupId: item.groupId })}
                    style={[styles.arrowIcon, { backgroundColor: theme.colors.surface }]}
                />
            </View>
            <Text style={[styles.groupName, { color: theme.colors.primary }]}>{item.groupName}</Text>
        </Animated.View >
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.div]}>
                <View style={styles.createGroupContainer}>
                    <IconButton
                        icon="plus"
                        mode="contained"
                        onPress={() => setVisible(true)}
                        style={styles.addButton}
                        size={rfs(7)}
                    // iconColor={theme.colors.primaryContainer}
                    // containerColor={theme.colors.onPrimaryContainer}
                    />
                    <Text style={[styles.createGroupText, { color: theme.colors.primary }]}>Create Group</Text>
                </View>
                <FlatList
                    data={displayGroups}
                    keyExtractor={(item) => item.groupId}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                />
            </View>
            <CreateGroupModal visible={visible} onDismiss={() => setVisible(false)} />
        </View>
    );
};

export default RecentGroupsComponent;

export const styles = StyleSheet.create({
    container: {
        marginHorizontal: rw(2),
        padding: rh(1),
    },
    createGroupContainer: {
        alignItems: "center",
        marginRight: rw(3),
    },
    addButton: {
        width: rh(7),
        height: rh(7),
        borderRadius: rh(7),
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: rfs(3.3),
        fontWeight: '500',
    },
    createGroupText: {
        fontSize: rfs(2),
        marginTop: rh(1),
        fontWeight: 'bold'
    },
    div: {
        paddingVertical: rh(0.5),
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    groupContainer: {
        alignItems: "center",
        marginRight: rw(5),
        marginTop: rh(0.7),
    },
    groupName: {
        marginTop: rh(1.6),
        fontSize: rfs(1.8),
    },
    avatarContainer: {
        position: 'relative', // Enables absolute positioning for children
    },
    arrowIcon: {
        position: 'absolute',
        bottom: rh(-2), // Aligns to bottom
        right: rw(-5), // Aligns to right
        borderRadius: rh(1),
    },
});
