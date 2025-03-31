
import AddMemberModal from '../../components/AddMemberModal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetails, makeAdmin, removeAdmin, removeMember, updateGroup } from '../../redux/slices/groupSlice';
import LoadingScreen from '../LoadingScreen';
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    useTheme,
    Avatar,
    IconButton,
    Surface,
    Card,
    Chip,
    Icon,
    Divider,
    Tooltip,
} from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import categories from '../../data/GroupCategory';
import avatars from '../../data/Avatar';
import HeaderComponent from '../../components/HeaderComponent';

const GroupSettingScreen = () => {
    const theme = useTheme();
    const route = useRoute();
    const { groupId } = route.params;
    const [visible, setVisible] = useState(false);
    const dispatch = useDispatch();
    const [groupName, setGroupName] = useState('');
    const [groupCategory, setGroupCategory] = useState({});
    const [editGroupName, setEditGroupName] = useState('');
    const [editGroupCategory, setEditGroupCategory] = useState({});
    const [members, setMembers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [nameError, setNameError] = useState('');
    const { user } = useSelector(state => state.userAuth)
    const { groupDetails } = useSelector(state => state.group);
    const [isAdmin, setIsAdmin] = useState(false);

    if (!user) {
        return null;
    }

    useEffect(() => {
        if (groupDetails?.groupId === groupId) {
            setGroupName(groupDetails.groupName);
            setEditGroupName(groupDetails.groupName)
            setMembers(groupDetails.members || []);
            setGroupCategory(groupDetails.category)
            setEditGroupCategory(groupDetails.category)
            setIsAdmin(groupDetails?.admins.includes(user?.uid))
        }
        else {
            dispatch(fetchGroupDetails(groupId))
        }
    }, [groupDetails, groupId]);


    const handleSubmit = () => {
        if (!groupName.trim()) {
            setNameError("Group name can't be empty.");
            return;
        }
        dispatch(updateGroup({ groupId, groupName: editGroupName, groupCategory: editGroupCategory }))
            .unwrap()
            .then(() => {
                console.log("Group name updated!");
                setNameError('');
                setIsEditing(false);
            })
            .catch((error) => {
                setNameError(error.message || "Failed to update group name.");
            });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <HeaderComponent title="Group Settings" />
            <View style={styles.headerCard}>
                <View style={styles.headerContent}>
                    {/* Left Side - Icon */}
                    <Avatar.Icon
                        size={rfs(7)}
                        icon={isEditing ? editGroupCategory?.icon : groupCategory?.icon}
                        style={styles.avatar}
                    />

                    {/* Right Side - Input & Buttons */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            label="Group Name"
                            mode="outlined"
                            value={isEditing ? editGroupName : groupName}
                            editable={isEditing}
                            onChangeText={text => setEditGroupName(text)}
                            style={styles.groupNameInput}
                            outlineColor={theme.colors.primary}
                            activeOutlineColor={theme.colors.primary}
                            right={isEditing ? <TextInput.Icon icon="pencil" /> : null}
                        />

                        {nameError && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>{nameError}</Text>
                        )}
                    </View>
                </View>

                {/* Category Selection (Visible Only When Editing) */}
                {isEditing && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContainer}
                    >
                        {categories.map((category) => (
                            <Button
                                key={category.label}
                                mode={editGroupCategory === category ? "contained" : "outlined"}
                                onPress={() => setEditGroupCategory(category)}
                                style={[
                                    styles.categoryButton,
                                    editGroupCategory === category && { backgroundColor: theme.colors.primary },
                                ]}
                                labelStyle={[
                                    styles.categoryButtonLabel,
                                    editGroupCategory === category && { color: theme.colors.onPrimary },
                                ]}
                                icon={category.icon}
                            >
                                {category.label}
                            </Button>
                        ))}
                    </ScrollView>
                )}

                {/* Action Buttons */}
                {isAdmin ? (
                    !isEditing ? (
                        <Button mode="contained" onPress={() => setIsEditing(true)} style={styles.editButton}>
                            Edit
                        </Button>
                    ) : (
                        <View style={styles.actionButtons}>
                            <Button mode="contained" onPress={handleSubmit} style={styles.saveButton}>
                                Save
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => {
                                    setIsEditing(false);
                                    setNameError('');
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </Button>
                        </View>
                    )
                ) : null}
            </View>


            <View style={[styles.membersCard, { borderColor: theme.colors.primary }]}>
                <Card.Title
                    style={{ alignItems: 'center', flexDirection: 'row' }}
                    title={`Members (${members.length})`}
                    titleStyle={{ fontSize: rfs(3), fontWeight: 'bold', color: theme.colors.primary }}
                    left={(props) => <Avatar.Icon {...props} icon="account-group" size={rfs(5)} />}
                    right={(props) => (
                        <IconButton
                            {...props}
                            icon="account-plus"
                            onPress={() => setVisible(true)}
                            size={rfs(4)}
                            iconColor={theme.colors.primary}
                        />
                    )}
                />
                <Card.Content>
                    <ScrollView style={styles.membersList} contentContainerStyle={{ paddingBottom: rh(10) }}>
                        {members?.map((member) => {
                            const isOwner = member.uid === groupDetails?.createdBy;
                            // const isAdmin = groupDetails?.admins?.includes(member.uid);
                            const isMemberAdmin = groupDetails?.admins?.includes(member.uid);
                            const currentUser = member.uid === user.uid

                            return (
                                <View key={member.uid} style={[styles.memberItem, { borderBottomColor: theme.colors.primary }]}>
                                    <View style={styles.memberInfo}>
                                        <Avatar.Image
                                            size={rfs(3.5)}
                                            source={avatars.find(a => a.id === (member?.avatar))?.uri}
                                            style={[styles.sectionIcon, { backgroundColor: theme.colors.primary }]}
                                            color={theme.colors.onPrimary}
                                        />
                                        <Text style={styles.memberName}>{currentUser ? <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>You</Text> : member.fullName}</Text>
                                    </View>

                                    {/* Show 'Owner' or 'Admin' chip */}
                                    {isOwner ? (
                                        <Chip
                                            mode="outlined"
                                            textStyle={{ fontSize: rfs(1.5) }}
                                            style={{ backgroundColor: theme.colors.primaryContainer, }}
                                            icon="crown"
                                        >
                                            Owner
                                        </Chip>
                                    ) : isMemberAdmin ? (
                                        <Chip
                                            mode="outlined"
                                            textStyle={{ fontSize: rfs(1.5) }}
                                            style={{ backgroundColor: theme.colors.primaryContainer }}
                                            icon="shield-account"
                                        >
                                            Admin
                                        </Chip>
                                    ) : null}

                                    {/* Action Buttons */}
                                    {!isOwner &&
                                        <View style={styles.actions}>
                                            {/* Remove Member (except the Owner) */}
                                            {/* {(isAdmin || member.uid === user?.uid) &&

                                                <Tooltip title="Remove Member">
                                                    <IconButton
                                                        icon="account-remove"
                                                        iconColor={theme.colors.primary}
                                                        onPress={() => dispatch(removeMember({ groupId, userId: member.uid }))}
                                                    />
                                                </Tooltip>
                                            } */}

                                            {(isAdmin || currentUser) && (
                                                <Tooltip title={currentUser ? "Leave Group" : "Remove Member"}>
                                                    <IconButton
                                                        icon={currentUser ? "logout" : "account-remove"}
                                                        iconColor={theme.colors.primary}
                                                        onPress={() => dispatch(removeMember({ groupId, uid: member.uid }))}
                                                    />
                                                </Tooltip>
                                            )}

                                            {/* Only Admin or Owner can Make Others Admin */}
                                            {/* {isAdmin || isOwner ? (
                                                !isAdmin && (
                                                    <Tooltip title="Make Admin">
                                                        <IconButton
                                                            icon="shield-account"
                                                            iconColor={theme.colors.primary}
                                                            onPress={() => dispatch(makeAdmin({ groupId, userId: member.uid }))}
                                                        />
                                                    </Tooltip>
                                                )
                                            ) : null} */}

                                            {isAdmin && !isMemberAdmin && (
                                                <Tooltip title="Make Admin">
                                                    <IconButton
                                                        icon="shield-account"
                                                        iconColor={theme.colors.primary}
                                                        onPress={() => dispatch(makeAdmin({ groupId, uid: member.uid }))}
                                                    />
                                                </Tooltip>
                                            )}

                                            {/* Only Admin can Remove Other Admins (Except Owner) */}
                                            {/* {isAdmin && !isOwner && (
                                                <Tooltip title="Remove Admin">
                                                    <IconButton
                                                        icon="shield-off"
                                                        iconColor={theme.colors.primary}
                                                        onPress={() => dispatch(removeAdmin({ groupId, userId: member.uid }))}
                                                    />
                                                </Tooltip>
                                            )} */}

                                            {isAdmin && isMemberAdmin && !isOwner && (
                                                <Tooltip title="Remove Admin">
                                                    <IconButton
                                                        icon="shield-off"
                                                        iconColor={theme.colors.primary}
                                                        onPress={() => dispatch(removeAdmin({ groupId, uid: member.uid }))}
                                                    />
                                                </Tooltip>
                                            )}
                                        </View>
                                    }
                                </View>
                            );
                        })}
                    </ScrollView>
                </Card.Content>

            </View>



            <AddMemberModal visible={visible} onDismiss={() => setVisible(false)} />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerCard: {
        margin: rw(2),
        padding: rh(2),
        borderRadius: rw(3),
        // elevation: 4, // Adds subtle shadow for better UI
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: rw(3),
        alignSelf: 'flex-start'
    },
    inputContainer: {
        flex: 1, // Takes full width next to avatar
    },
    groupNameInput: {
        fontSize: rfs(2),
    },
    errorText: {
        fontSize: rfs(1.5),
        marginTop: rh(1),
    },
    categoryButton: {
        marginRight: rw(2),
        borderRadius: rh(1),
    },
    categoryButtonLabel: {
        fontSize: rfs(1.8),
    },
    categoriesContainer: {
        paddingVertical: rh(1),
    },
    editButton: {
        alignSelf: 'flex-end',
        marginTop: rh(2),
        borderRadius: rh(1)
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: rh(2),
    },
    saveButton: {
        marginRight: rw(2),
        borderRadius: rh(1)
    },
    cancelButton: {
        borderRadius: rh(1)
    },
    membersCard: {
        margin: rw(4),
        borderRadius: rh(2),
        flex: 1,
        borderWidth: rw(0.3),
        borderStyle: 'dashed',
    },
    membersList: {
        // maxHeight: rh(40),
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: rh(1.5),
        marginBottom: rh(1),
        borderBottomWidth: rh(0.1),
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1
    },
    memberName: {
        marginLeft: rw(3),
        fontSize: rfs(2),
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        // flexGrow: 1
    }
})

export default GroupSettingScreen
