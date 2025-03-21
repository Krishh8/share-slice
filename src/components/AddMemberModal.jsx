import { FlatList, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Modal, Portal, Searchbar, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import Contacts from 'react-native-contacts';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { useSelector } from 'react-redux';
import { checkUserExists } from '../services/userService';
// import Share from 'react-native-share';

const AddMemberModal = ({ visible, onDismiss }) => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const { groupDetails } = useSelector(state => state.group)
    const groupId = groupDetails?.groupId
    console.log('Group id in add member modal ', groupId)

    // useEffect(() => {
    //     console.log('check contact permission')
    //     checkContactsPermission(); // Check permission status on mount
    // }, []);

    // useEffect(() => {
    //     // Listen for Dynamic Links when app is opened from a link
    //     const unsubscribe = dynamicLinks().onLink(handleDeepLink);

    //     // Check if app was opened from a dynamic link
    //     dynamicLinks().getInitialLink().then(handleDeepLink);

    //     return () => unsubscribe();
    // }, []);

    // const checkUserStatus = async (contactList) => {
    //     const updatedContacts = await Promise.all(contactList.map(async (contact) => {
    //         const isUser = await checkUserExists(contact.phoneNumber); // Call API to check
    //         return { ...contact, isUser };
    //     }));
    //     setContacts(updatedContacts);
    //     setFilteredContacts(filteredContacts);
    // };

    // const handleDeepLink = (link) => {
    //     if (link) {
    //         const groupId = new URL(link.url).searchParams.get('groupId');
    //         if (groupId) {
    //             console.log('User invited to group:', groupId);
    //             // Navigate to Group Screen (Example using React Navigation)
    //             // navigation.navigate('GroupDetails', { groupId });
    //         }
    //     }
    // };

    // const generateInviteLink = async (groupId) => {
    //     try {
    //         const link = await dynamicLinks().buildShortLink({
    //             link: `https://shareslice.com/groupInvite?groupId=${groupId}`,
    //             domainUriPrefix: 'https://sharesliceapp.page.link',
    //             android: {
    //                 packageName: 'com.shareslice',
    //             },
    //             // ios: {
    //             //     bundleId: 'com.yourapp.ios',
    //             //     appStoreId: 'YOUR_APP_STORE_ID', // Optional
    //             // },
    //         });

    //         return link;
    //     } catch (error) {
    //         console.error('Error creating invite link:', error);
    //         return null;
    //     }
    // };

    // const sendInvite = async (phoneNumber) => {
    //     const inviteLink = await generateInviteLink(groupId);
    //     if (!inviteLink) return;

    //     const options = {
    //         title: 'Join My Group!',
    //         message: `Hey! Join my group using this link: ${inviteLink}`,
    //         url: inviteLink,
    //     };

    //     // await Share.open(options);
    // };

    // const fetchContacts = async () => {
    //     try {
    //         console.log('Contacts Module:', Contacts);

    //         if (!Contacts || typeof Contacts.getAll !== 'function') {
    //             console.error('react-native-contacts is not properly linked or is null.');
    //             return;
    //         }

    //         const contacts = await Contacts.getAll();
    //         if (!contacts) {
    //             return <ActivityIndicator size="large" color="blue" />;
    //         }

    //         console.log("Contacts fetched:", contacts);

    //         const filteredContacts = contacts
    //             .filter(contact => contact.phoneNumbers.length > 0)
    //             .map(contact => ({
    //                 id: contact.recordID,
    //                 name: contact.displayName,
    //                 phoneNumber: contact.phoneNumbers[0].number,
    //                 isUser: false, // Default false, check from backend
    //             }));

    //         await checkUserStatus(filteredContacts);
    //     } catch (error) {
    //         console.error('Error fetching contacts:', error);
    //     }
    // };

    // const askContactsPermission = () => {
    //     request(PERMISSIONS.ANDROID.READ_CONTACTS).then((status) => {
    //         switch (status) {
    //             case RESULTS.UNAVAILABLE:
    //                 return console.log('This feature is not available (on this device / in this context)');
    //             case RESULTS.DENIED:
    //                 return console.log('The permission has not been requested / is denied but requestable');
    //             case RESULTS.BLOCKED:
    //                 return console.log('The permission is denied and not requestable');
    //             case RESULTS.GRANTED:
    //                 checkContactsPermission()
    //                 return console.log('The permission is granted');
    //             case RESULTS.LIMITED:
    //                 return console.log('The permission is granted but with limitations');
    //         }
    //     });
    // }

    // const checkContactsPermission = async () => {
    //     const status = await check(PERMISSIONS.ANDROID.READ_CONTACTS);
    //     console.log('Permission status:', status);

    //     if (status === RESULTS.GRANTED) {
    //         setPermissionGranted(true);
    //         console.log('Permission granted. Fetching contacts...');
    //         setTimeout(fetchContacts, 500);
    //     } else {
    //         console.log('Permission NOT granted:', status);
    //     }
    // };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim() === '') {
                setFilteredContacts(contacts);
                return;
            }

            const filtered = contacts.filter(contact =>
                contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.phoneNumber.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, ''))
            );

            setFilteredContacts(filtered);
        }, 200); // Debounce delay (adjust if necessary)

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, contacts]);

    const handleSearch = (query) => {
        setSearchQuery(String(query)); // Ensure it's a string
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                theme={{
                    colors: {
                        backdrop: "rgba(0, 0, 0, 0.7)",
                        // Adjust opacity here (0.3 for lighter effect)
                    },

                }}
                contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                <View style={[styles.header]}>
                    <Text style={[{ fontSize: rfs(2.5) }, { fontWeight: '700' }, { color: theme.colors.onSecondaryContainer }]} >Add a member</Text>
                    <Button labelStyle={[{ fontSize: rfs(2.5) }]} onPress={() => (onDismiss())}>Done</Button>
                </View>

                <Searchbar
                    style={[styles.searchbar,]}
                    placeholder="Search friends"
                    onChangeText={handleSearch}
                    value={searchQuery}
                    loading={false}
                    keyboardType='numeric'
                />

                <View>
                    <Text style={[{ fontSize: rfs(2) }]}>Friends</Text>
                </View>
                {/* {!permissionGranted && (
                    <Button mode='contained' style={[styles.allowBtn]} onPress={askContactsPermission} >Allow contacts</Button>
                )} */}
                <FlatList
                    data={filteredContacts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.contactRow}>
                            <Text style={{ fontSize: rfs(2) }}>{item.name}</Text>
                            {item.isUser ? (
                                <Button mode="contained" onPress={() => addUserToGroup(item.phoneNumber)}>
                                    Add
                                </Button>
                            ) : (
                                <Button mode="outlined" onPress={() => sendInvite(item.phoneNumber)}>
                                    Invite
                                </Button>
                            )}
                        </View>
                    )}
                />
            </Modal>
        </Portal >
    )
}

export default AddMemberModal

const styles = StyleSheet.create({
    modalContainer: {
        padding: rw(5),
        borderRadius: rw(2),
        margin: rw(7),
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: rw(0.2),
        borderStyle: 'dashed',
        paddingBottom: rh(1)
    },
    searchbar: {
        marginVertical: rw(2),
        marginBottom: rh(2),
        borderRadius: rh(1),
        elevation: 0,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    allowBtn: {
        marginTop: rh(1),
    },

})