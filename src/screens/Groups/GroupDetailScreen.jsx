import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import GroupTopTabNavigator from '../../navigation/GroupTopTabNavigator';
import { useTheme, Text, IconButton, Surface, Appbar, Menu, Divider, Icon, Avatar } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useDispatch, useSelector } from 'react-redux';
import { deleteGroup, fetchGroupDetails } from '../../redux/slices/groupSlice';
import { convertToTimestamp } from '../../assets/utilityFunc';
import { getUserByUserId } from '../../services/userService';
import CustomAlert from '../../components/CustomAlert';
import Toast from 'react-native-toast-message';
import { showToast } from '../../services/toastService';
import LoadingScreen from '../LoadingScreen';

const GroupDetailScreen = () => {
    const theme = useTheme();
    const route = useRoute();
    const { groupId } = route.params;
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [owner, setOwner] = useState(null);
    const { user } = useSelector(state => state.userAuth);
    const { groups, errorGroups, loadingGroups } = useSelector(state => state.group);
    const [isAdmin, setIsAdmin] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);


    const group = {
        category: groups[groupId]?.category,
        createdBy: groups[groupId]?.createdBy,
        groupId: groups[groupId]?.groupId,
        groupName: groups[groupId]?.groupName,
    };


    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupDetails(groupId));
        }
    }, [groupId, dispatch]);

    useEffect(() => {
        const updateGroupDetails = async () => {
            if (group?.createdBy) {
                let name = group.createdBy === user?.uid ? "You" : await getUserByUserId(group.createdBy);
                setOwner(name);
            }

            setIsAdmin(groups[groupId]?.admins?.includes(user?.uid));
        };

        updateGroupDetails();
    }, [groups, user]);



    const handleDelete = async () => {
        setAlertVisible(false);
        try {
            await dispatch(deleteGroup(groupId)).unwrap();
            navigation.navigate('BottomTab', { screen: 'Groups' });
            showToast('success', 'Group deleted successfully! 🎉');
        } catch (error) {
            showToast('error', 'Group deletion failed.', error);
            // Alert.alert('Error', error.message);
        }
    };

    if (loadingGroups) return <LoadingScreen message='Deleting Group....' />

    return (
        <Surface style={{ flex: 1 }}>
            <Appbar.Header style={{ backgroundColor: theme.colors.secondaryContainer, elevation: 0 }}>
                <Appbar.Action
                    icon="chevron-left"
                    size={rfs(3.5)}
                    iconColor={theme.colors.primary}
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('BottomTab', { screen: 'Groups' });
                        }
                    }}
                />
            </Appbar.Header>

            <View style={[styles.header, { backgroundColor: theme.colors.secondaryContainer }]}>
                <View style={styles.iconContainer}>
                    <Avatar.Icon icon={group?.category?.icon} size={rfs(8)} />
                    <View>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.groupName, { flexShrink: 1 }]}>{group?.groupName}</Text>
                        <Text numberOfLines={1} ellipsizeMode="tail">Created By <Text style={[styles.admin, { color: theme.colors.primary }]}>{owner}</Text></Text>
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <IconButton
                        icon='cog'
                        size={rfs(3)}
                        onPress={() => navigation.navigate('GroupSettings', { groupId })}
                    />
                    <IconButton
                        icon='delete'
                        size={rfs(3)}
                        onPress={() => setAlertVisible(true)}
                        disabled={!isAdmin}
                    />
                </View>
            </View>

            {/* Tab Navigator */}
            <GroupTopTabNavigator groupId={groupId} />

            {/* Custom Alert for Delete Confirmation */}
            <CustomAlert
                visible={alertVisible}
                title="Delete Group"
                message="Are you sure you want to delete this group? This action cannot be undone. You will lose all your group expense and data."
                onClose={() => setAlertVisible(false)}
                onConfirm={handleDelete} // 🔹 Calls handleDelete() when confirmed
                confirmText="Yes"
                cancelText="No"
                showCancel={true}
                icon="delete"
            />
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
        paddingHorizontal: rh(2),
    },
    groupName: {
        fontSize: rfs(3),
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '30%',
    },
    admin: {
        fontWeight: 'bold',
        flexShrink: 1
    },
    iconContainer: {
        width: '50%',
        flexDirection: 'row',
        gap: rw(3),
        alignItems: 'center'
    },

});

export default GroupDetailScreen
