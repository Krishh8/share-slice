import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Avatar, Text, IconButton, useTheme, Icon, Card } from "react-native-paper";
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import CreateGroupModal from "./CreateGroupModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroups } from "../redux/slices/groupSlice";

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
        setDisplayGroups(groups); // ✅ Update displayGroups when groups change
    }, [groups]);

    const renderItem = ({ item }) => (
        <View style={styles.groupContainer}>
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
        </View >
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
                <CreateGroupModal visible={visible} onDismiss={() => setVisible(false)} />
                <FlatList
                    data={displayGroups}
                    keyExtractor={(item) => item.groupId}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                />
            </View>
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

// import { useNavigation } from "@react-navigation/native";
// import { useEffect, useState } from "react";
// import { View, FlatList, StyleSheet } from "react-native";
// import { Avatar, Text, IconButton, useTheme, Card, Button } from "react-native-paper";
// import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
// import CreateGroupModal from "./CreateGroupModal";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchGroups } from "../redux/slices/groupSlice";

// const RecentGroupsComponent = () => {
//     const theme = useTheme();
//     const dispatch = useDispatch()
//     const navigation = useNavigation();
//     const [visible, setVisible] = useState(false);
//     const { groups } = useSelector(state => state.group)
//     const { uid } = useSelector(state => state.userAuth)
//     const [displayGroups, setDisplayGroups] = useState([]);

//     useEffect(() => {
//         dispatch(fetchGroups(uid));
//     }, [dispatch, uid]);

//     useEffect(() => {
//         setDisplayGroups(groups);
//     }, [groups]);

//     const renderItem = ({ item }) => (
//         <Card style={styles.groupCard} onPress={() => navigation.navigate('GroupDetails', { groupId: item.groupId })}>
//             <Card.Content style={styles.groupCardContent}>
//                 <Avatar.Icon size={rfs(7)} icon={item.icon} style={{ backgroundColor: theme.colors.primary }} />
//                 <Text style={[styles.groupName, { color: theme.colors.onSurface }]} numberOfLines={1}>{item.groupName}</Text>
//             </Card.Content>
//         </Card>
//     );

//     return (
//         <Card style={styles.container}>
//             {/* <Card.Title title="Recent Groups" titleStyle={styles.title} /> */}
//             <Card.Content>
//                 <View style={styles.groupsContainer}>
//                     <Card style={styles.groupCard} onPress={() => setVisible(true)}>
//                         <Card.Content style={styles.groupCardContent}>
//                             <Avatar.Icon size={rfs(7)} icon='plus' style={{ backgroundColor: theme.colors.primary }} />
//                             <Text style={[styles.createText, { color: theme.colors.onSurface }]} numberOfLines={1}>Create Group</Text>
//                         </Card.Content>
//                     </Card>
//                     <FlatList
//                         data={displayGroups}
//                         keyExtractor={(item) => item.groupId}
//                         horizontal
//                         showsHorizontalScrollIndicator={false}
//                         renderItem={renderItem}
//                         contentContainerStyle={styles.groupsList}
//                         ListEmptyComponent={
//                             <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant, }]}>No groups yet. Create one!</Text>
//                         }
//                     />
//                 </View>
//             </Card.Content>
//             <CreateGroupModal visible={visible} onDismiss={() => setVisible(false)} />
//         </Card>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         margin: rh(2),
//         borderRadius: rh(2),
//         elevation: 4,
//     },
//     title: {
//         fontSize: rfs(2.5),
//         fontWeight: 'bold',
//     },
//     groupsContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     createGroupButton: {
//         borderRadius: rh(1),
//         marginRight: rw(3),
//     },
//     createGroupText: {
//         fontSize: rfs(1.8),
//     },
//     groupsList: {
//         paddingVertical: rh(1),
//     },
//     groupCard: {
//         width: rw(20),
//         marginRight: rw(2),
//         borderRadius: rh(1),
//     },
//     groupCardContent: {
//         alignItems: 'center',
//         padding: rh(1),
//     },
//     groupName: {
//         marginTop: rh(1),
//         fontSize: rfs(1.8),
//         textAlign: 'center',
//     },
//     emptyText: {
//         fontStyle: 'italic',
//     },
//     createText:{
//         marginTop: rh(1),
//         fontSize: rfs(1.8),
//         textAlign: 'center',
//         fontWeight:'bold',
//     }
// });

// export default RecentGroupsComponent;

