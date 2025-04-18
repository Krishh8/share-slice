import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar, Text, IconButton, useTheme, Icon, Card } from "react-native-paper";
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import CreateGroupModal from "./CreateGroupModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroups } from "../redux/slices/groupSlice";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import LoadingScreen from "../screens/LoadingScreen";

const RecentGroupsComponent = () => {
    const theme = useTheme();
    const dispatch = useDispatch()
    const navigation = useNavigation();
    const [visible, setVisible] = useState(false);
    const { groups, loadingGroups } = useSelector(state => state.group)
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


    // if (loadingGroups) return <LoadingScreen />

    const renderItem = ({ item, index }) => (
        <Animated.View entering={FadeInRight.delay(index * 50)} style={[styles.groupContainer]}>
            <TouchableOpacity onPress={() => navigation.navigate('GroupDetails', { groupId: item.groupId })} style={[styles.avatarContainer, { backgroundColor: theme.colors.shadow }]}>
                <IconButton
                    mode="contained"
                    icon={item.category.icon}
                    size={rfs(4)}
                />
                <Text numberOfLines={1}
                    ellipsizeMode="tail" style={[styles.groupName, { color: theme.colors.primary }]}>{item.groupName}</Text>
            </TouchableOpacity>
        </Animated.View >
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.div]}>
                <TouchableOpacity onPress={() => setVisible(true)} style={[styles.createGroupContainer,]}>
                    <IconButton
                        mode="contained"
                        icon="plus"
                        size={rfs(4)}
                    />
                    <Text style={[styles.createGroupText, { color: theme.colors.primary }]}>Create Group</Text>
                </TouchableOpacity>
                <FlatList
                    data={displayGroups}
                    keyExtractor={(item) => item.groupId}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                />
            </View>
            <CreateGroupModal visible={visible} onDismiss={() => setVisible(false)} />
        </View >
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
        // marginRight: rw(3),
        padding: rh(1)
    },
    addButton: {
        width: rh(7),
        height: rh(7),
        borderRadius: rh(7),
        justifyContent: "center",
        alignItems: "center",
    },
    avatarContainer: {
        borderRadius: rh(2),
        padding: rh(1),
        alignItems: "center",
        marginRight: rw(3),
        width: rw(23)
    },
    createGroupText: {
        fontSize: rfs(2),
        // marginTop: rh(1),
        fontWeight: 'bold'
    },
    div: {
        paddingVertical: rh(0.5),
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    groupContainer: {
        alignItems: "center",
    },
    groupName: {
        fontSize: rfs(1.8),
    },

});
