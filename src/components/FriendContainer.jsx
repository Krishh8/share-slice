// import { useNavigation } from "@react-navigation/native";
// import { View, FlatList, StyleSheet } from "react-native";
// import { Avatar, Text, IconButton, useTheme } from "react-native-paper";
// import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';

// const FriendContainer = ({ members, disableAddButton = false }) => {
//     const theme = useTheme();
//     const navigation = useNavigation();

//     const renderItem = ({ item }) => (
//         <View style={styles.memberContainer}>
//             <Avatar.Image size={rh(7)} source={{ uri: item.avatar }} />
//             <Text style={[styles.memberName, { color: theme.colors.primary }]}>{item.name}</Text>
//         </View>
//     );

//     return (
//         <View style={[styles.container]}>
//             <View style={[styles.div]}>
//                 {!disableAddButton && <View style={styles.addMemberContainer}>
//                     <IconButton
//                         icon="plus"
//                         mode="contained"
//                         onPress={() => navigation.navigate('AddFriends')}
//                         style={styles.addButton}
//                         size={rfs(7)}                         // Disable button when required
//                     />
//                     <Text style={[styles.addMemberText, { color: theme.colors.primary }]}>Add Friends</Text>
//                 </View>}
//                 <FlatList
//                     data={members}
//                     keyExtractor={(item, index) => index.toString()}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     renderItem={renderItem}
//                 />
//             </View>

//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         margin: rh(1),
//     },
//     addMemberContainer: {
//         alignItems: "center",
//         marginRight: rw(3),
//     },
//     addButton: {
//         width: rh(7),
//         height: rh(7),
//         borderRadius: rh(7),
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     addMemberText: {
//         marginTop: rh(1),
//         fontSize: rfs(2),
//     },
//     memberContainer: {
//         alignItems: "center",
//         marginRight: rw(5),
//         marginTop: rh(0.7),
//     },
//     memberName: {
//         marginTop: rh(1.6),
//         fontSize: rh(1.8)
//     },
//     div: {
//         flexDirection: 'row',
//         alignItems: 'flex-end'
//     },
// });

// export default FriendContainer;


import { useNavigation } from "@react-navigation/native";
import { View, FlatList, StyleSheet } from "react-native";
import { Avatar, Text, IconButton, useTheme, Surface, Card } from "react-native-paper";
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import avatars from "../data/Avatar";

const FriendContainer = ({ members, navigation: propNavigation }) => {
    const theme = useTheme();
    const navigation = propNavigation || useNavigation();

    const renderItem = ({ item }) => (
        <View style={styles.memberContainer}>
            <Avatar.Image size={rh(7)} source={avatars.find(a => a.id === (item?.avatar || 0))?.uri} />
            <Text style={[styles.memberName, { color: theme.colors.onSurface }]}>{item.name}</Text>
        </View>
    );

    return (
        <Card style={styles.container}>
            <Card.Content>
                <View style={styles.headerContainer}>
                    <Text variant="titleMedium" style={{ color: theme.colors.primary }}>Friends</Text>
                </View>
                <FlatList
                    data={members}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant, }]}>No friends added yet</Text>
                    }
                />
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: rh(2),
        borderRadius: rh(2),
        elevation: 4,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: rh(2),
    },
    listContent: {
        paddingVertical: rh(1),
    },
    memberContainer: {
        alignItems: "center",
        marginRight: rw(4),
    },
    memberName: {
        marginTop: rh(1),
        fontSize: rfs(1.8),
    },
    emptyText: {
        fontStyle: 'italic',
    },
});

export default FriendContainer;