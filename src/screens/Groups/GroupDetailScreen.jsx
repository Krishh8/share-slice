import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import GroupTopTabNavigator from '../../navigation/GroupTopTabNavigator';
import { useTheme, Text, IconButton, Surface, Appbar, Menu, Divider, Icon, Avatar } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useDispatch, useSelector } from 'react-redux';
import { deleteGroup, fetchGroupDetails } from '../../redux/slices/groupSlice';
import { convertToTimestamp } from '../../assets/utilityFunc';
import LoadingScreen from '../LoadingScreen';
import { getUserByUserId } from '../../services/userService';

const GroupDetailScreen = () => {
    const theme = useTheme();
    const route = useRoute();
    const { groupId } = route.params;
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [owner, setOwner] = useState(null);
    const { user } = useSelector(state => state.userAuth)
    const [isAdmin, setIsAdmin] = useState(false)

    const [group, setGroup] = useState({
        category: {},
        createdBy: "",
        groupId: "",
        groupName: "",
    });

    const { groupDetails, loadingGroupDetails, errorGroups, error } = useSelector(state => state.group);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupDetails(groupId));
        }
    }, [groupId, dispatch]);


    useEffect(() => {
        const updateGroupDetails = async () => {
            if (!groupDetails) return;

            // 🔹 Set group details only when new data is available
            setGroup(prevGroup => ({
                category: groupDetails.category || prevGroup.category,
                createdBy: groupDetails.createdBy || prevGroup.createdBy,
                groupId: groupDetails.groupId || prevGroup.groupId,
                groupName: groupDetails.groupName || prevGroup.groupName,
            }));

            // 🔹 Fetch and set owner name
            if (groupDetails?.createdBy) {
                let name = groupDetails.createdBy === user?.uid ? "You" : await getUserByUserId(groupDetails.createdBy);
                setOwner(name);
            }

            // 🔹 Set admin status
            setIsAdmin(groupDetails?.admins?.includes(user?.uid));
        };

        updateGroupDetails();
    }, [groupDetails, user]);

    const handleDelete = async () => {
        Alert.alert(
            "Delete Group",
            "Are you sure you want to delete this group? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await dispatch(deleteGroup(groupId));
                            if (deleteGroup.fulfilled.match(result)) {
                                navigation.navigate('BottomTab', { screen: 'Groups' });
                            } else {
                                console.error('Error deleting group:', result.error.message);
                                Alert.alert('Error', errorGroups);
                            }
                        } catch (error) {
                            console.error('Unexpected error:', error);
                        }
                    }
                }
            ]
        );
    };

    // if (loadingGroupDetails) return <LoadingScreen />;

    if (error) return (
        <View style={styles.errorContainer}>
            <Text style={{ color: theme.colors.error }}>Error: {error}</Text>
        </View>
    );

    return (
        <Surface style={{ flex: 1 }}>
            <Appbar.Header style={{ backgroundColor: theme.colors.secondaryContainer, elevation: 0, }}>
                <Appbar.Action icon="chevron-left" size={rfs(3.5)} iconColor={theme.colors.primary}
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('BottomTab', { screen: 'Groups' }); // Fallback to Groups screen
                        }
                    }} />
            </Appbar.Header>

            <View style={[styles.header, { backgroundColor: theme.colors.secondaryContainer }]}>
                <View style={[styles.iconContainer]}>
                    <View>
                        <Avatar.Icon icon={group?.category?.icon} size={rfs(8)} />
                    </View>
                    <View>
                        <Text style={[styles.groupName]}>{group?.groupName}</Text>
                        <Text>Created By <Text style={[styles.admin, { color: theme.colors.primary }]}>{owner}</Text></Text>
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <IconButton icon='cog' size={rfs(3)}
                        onPress={() => (navigation.navigate('GroupSettings', { groupId }))}
                    />
                    <IconButton icon='delete' size={rfs(3)}
                        onPress={handleDelete} disabled={!isAdmin}
                    />
                </View>
            </View>

            {/* Tab Navigator */}
            <GroupTopTabNavigator groupId={groupId} />
        </Surface>
    );
};

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: rh(2),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: rh(3),
        paddingHorizontal: rh(2)
    },
    groupName: {
        fontSize: rfs(4),
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    admin: {
        fontWeight: 'bold',
    },
    iconContainer: {
        flexDirection: 'row',
        gap: rw(3),
    },

});

export default GroupDetailScreen
