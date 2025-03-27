// import { FlatList, Linking, StyleSheet, View } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { ActivityIndicator, Button, Modal, Portal, Searchbar, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
// import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
// import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
// import Contacts from 'react-native-contacts';
// import dynamicLinks from '@react-native-firebase/dynamic-links';
// import { useDispatch, useSelector } from 'react-redux';
// import { checkUserExists } from '../services/userService';
// import FriendContainer from './FriendContainer';
// import { useNavigation } from '@react-navigation/native';
// import { addMember } from '../redux/slices/groupSlice';
// import AsyncStorage from "@react-native-async-storage/async-storage";
// // import Share from 'react-native-share';

// const AddMemberModal = ({ visible, onDismiss }) => {
//     const theme = useTheme();
//     const dispatch = useDispatch()
//     const navigation = useNavigation()
//     const [searchQuery, setSearchQuery] = useState('');
//     const [contacts, setContacts] = useState([]);
//     const [filteredContacts, setFilteredContacts] = useState([]);
//     const [permissionGranted, setPermissionGranted] = useState(false);
//     const [manualPhoneNumber, setManualPhoneNumber] = useState('');
//     const [manualUserState, setManualUserState] = useState(null);
//     const { groupDetails } = useSelector(state => state.group)
//     const groupId = groupDetails?.groupId
//     console.log('Group id in add member modal ', groupId)

//     useEffect(() => {
//         console.log('check contact permission')
//         checkContactsPermission(); // Check permission status on mount
//     }, []);

//     useEffect(() => {
//         const unsubscribe = dynamicLinks().onLink(handleDeepLink);
//         dynamicLinks().getInitialLink().then(handleDeepLink);

//         return () => unsubscribe();
//     }, []);

//     const handleDeepLink = async (link) => {
//         if (link) {
//             console.log('Received deep link:', link.url);

//             const parsed = queryString.parseUrl(link.url);
//             const groupId = parsed.query.groupId;

//             if (groupId) {
//                 console.log('User invited to group:', groupId);
//                 await AsyncStorage.setItem('pendingGroupId', groupId);
//             }
//         }
//     };

//     const generateInviteLink = async (groupId) => {
//         try {
//             const link = await dynamicLinks().buildShortLink({
//                 link: `https://shareslice.com/groupInvite?groupId=${groupId}`,
//                 domainUriPrefix: 'https://sharesliceapp.page.link',
//                 android: {
//                     packageName: 'com.shareslice',
//                     fallbackUrl: 'https://play.google.com/store/apps/details?id=com.shareslice'
//                 },
//                 // ios: {
//                 //     bundleId: 'com.yourapp.ios',
//                 //     appStoreId: 'YOUR_APP_STORE_ID', // Optional
//                 // fallbackUrl: 'https://apps.apple.com/app/idYOUR_APP_STORE_ID'
//                 // },
//             });
//             console.log('link: ', link)

//             return link;
//         } catch (error) {
//             console.error('Error creating invite link:', error);
//             return null;
//         }
//     };

//     // const sendInvite = async (phoneNumber) => {
//     //     const inviteLink = await generateInviteLink(groupId);
//     //     if (!inviteLink) return;

//     //     const options = {
//     //         title: 'Join My Group!',
//     //         message: `Hey! Join my group using this link: ${inviteLink}`,
//     //         url: inviteLink,
//     //     };
//     //     try {
//     //         await Share.open(options);
//     //     } catch (error) {
//     //         console.error('Error sharing invite:', error);
//     //     }
//     // };

//     const sendInviteViaSMS = async (phoneNumber) => {
//         const inviteLink = await generateInviteLink(groupId);
//         if (!inviteLink) return;

//         const message = `Hey! Join my group on SliceShare using this link: ${inviteLink}`;
//         const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

//         try {
//             await Linking.openURL(smsUrl);
//             console.log('Invitation sent')
//         } catch (error) {
//             console.error('Error sending SMS invite:', error);
//         }
//     };

//     const normalizePhoneNumber = (phoneNumber) => {
//         if (!phoneNumber) return ''; // Handle null or undefined values

//         let cleanedNumber = phoneNumber.replace(/\D+/g, ''); // Remove all spaces

//         // If the number starts with '0', replace it with '+91'
//         if (cleanedNumber.length >= 10) {
//             cleanedNumber = cleanedNumber.slice(-10);
//         }
//         return `+91${cleanedNumber}`;
//     };

//     const checkUserStatus = async (contactList) => {
//         const updatedContacts = await Promise.all(contactList.map(async (contact) => {
//             const formattedNumber = normalizePhoneNumber(contact.phoneNumber); // Normalize here too!
//             const userState = await checkUserExists(formattedNumber);

//             return { ...contact, phoneNumber: formattedNumber, userState }; // Store formatted number
//         }));

//         setContacts(updatedContacts);
//         setFilteredContacts(updatedContacts);
//     };

//     const handleManualCheck = async () => {
//         const formattedNumber = normalizePhoneNumber(manualPhoneNumber);
//         const userState = await checkUserExists(formattedNumber);
//         setManualUserState({ phoneNumber: formattedNumber, ...userState });
//     };


//     const fetchContacts = async () => {
//         try {
//             if (!contacts) {
//                 return <ActivityIndicator size="large" color="red" />;
//             }
//             const storedContacts = await AsyncStorage.getItem("contacts");
//             if (storedContacts) {
//                 setContacts(JSON.parse(storedContacts));
//             }
//             const contacts = await Contacts.getAll();
//             console.log("Contacts fetched:", contacts);

//             const filteredContacts = contacts
//                 .filter(contact => contact.phoneNumbers.length > 0)
//                 .map(contact => ({
//                     id: contact.recordID,
//                     name: contact.displayName,
//                     phoneNumber: contact.phoneNumbers[0].number,
//                 }));
//             await AsyncStorage.setItem("contacts", JSON.stringify(filteredContacts));
//             await checkUserStatus(filteredContacts);
//         } catch (error) {
//             console.error('Error fetching contacts:', error);
//         }
//     };

//     const askContactsPermission = () => {
//         request(PERMISSIONS.ANDROID.READ_CONTACTS).then((status) => {
//             switch (status) {
//                 case RESULTS.UNAVAILABLE:
//                     return console.log('This feature is not available (on this device / in this context)');
//                 case RESULTS.DENIED:
//                     return console.log('The permission has not been requested / is denied but requestable');
//                 case RESULTS.BLOCKED:
//                     return console.log('The permission is denied and not requestable');
//                 case RESULTS.GRANTED:
//                     checkContactsPermission()
//                     return console.log('The permission is granted');
//                 case RESULTS.LIMITED:
//                     return console.log('The permission is granted but with limitations');
//             }
//         });
//     }

//     const checkContactsPermission = async () => {
//         const status = await check(PERMISSIONS.ANDROID.READ_CONTACTS);
//         console.log('Permission status:', status);

//         if (status === RESULTS.GRANTED) {
//             setPermissionGranted(true);
//             console.log('Permission granted. Fetching contacts...');
//             fetchContacts();
//         } else {
//             console.log('Permission NOT granted:', status);
//         }
//     };

//     useEffect(() => {
//         if (!searchQuery || searchQuery.trim() === '') {  // Ensure searchQuery is defined
//             setFilteredContacts(filteredContacts);
//             return;
//         }

//         const filtered = contacts.filter(contact =>
//             contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             contact.phoneNumber.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, ''))
//         );

//         setFilteredContacts(filtered);
//     }, [searchQuery, contacts]); // Add dependencies to avoid stale state issues

//     const handleSearch = (query) => {
//         setSearchQuery(query); // Ensure it's a string
//     };

//     return (
//         <Portal>
//             <Modal
//                 visible={visible}
//                 onDismiss={onDismiss}
//                 theme={{
//                     colors: {
//                         backdrop: "rgba(0, 0, 0, 0.7)",
//                         // Adjust opacity here (0.3 for lighter effect)
//                     },

//                 }}
//                 contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
//                 <View style={[styles.header]}>
//                     <Text style={[{ fontSize: rfs(2.5) }, { fontWeight: '700' }, { color: theme.colors.onSecondaryContainer }]} >Add a member</Text>
//                     <Button labelStyle={[{ fontSize: rfs(2.5) }]} onPress={() => (onDismiss())}>Done</Button>
//                 </View>

//                 {/* <FriendContainer navigation={navigation} members={groupDetails.members} /> */}

//                 <Searchbar
//                     style={[styles.searchbar,]}
//                     placeholder="Search friends"
//                     onChangeText={handleSearch}
//                     value={searchQuery}
//                     loading={false}
//                 />

//                 {!permissionGranted && (
//                     <Button mode='contained' style={[styles.allowBtn]} onPress={askContactsPermission} >Allow contacts</Button>
//                 )}

//                 <Text variant='titleMedium'>Enter Phone Number</Text>
//                 <TextInput
//                     style={styles.searchbar}
//                     placeholder="Enter phone number"
//                     value={manualPhoneNumber}
//                     keyboardType="phone-pad"
//                     onChangeText={setManualPhoneNumber}
//                 />
//                 <Button mode="contained" onPress={handleManualCheck}>Check</Button>

//                 {manualUserState && (
//                     <View style={styles.manualUserRow}>
//                         <Text>{manualUserState.phoneNumber}</Text>
//                         {manualUserState.exists ? (
//                             <Button mode="contained" onPress={() => dispatch(addMember({ uid: manualUserState.uid, groupId }))}>
//                                 Add
//                             </Button>
//                         ) : (
//                             <Button mode="outlined" onPress={() => sendInviteViaSMS(manualUserState.phoneNumber)}>
//                                 Invite
//                             </Button>
//                         )}
//                     </View>
//                 )}


//                 {searchQuery && <Text variant='titleMedium' style={[{ color: theme.colors.primary }]}>Friends</Text>}
//                 <FlatList
//                     data={filteredContacts}
//                     showsVerticalScrollIndicator={false}
//                     keyExtractor={(item) => item.id}

//                     renderItem={({ item }) => (
//                         <View style={styles.contactRow} key={item.phoneNumber}>
//                             <View>
//                                 <Text style={{ fontSize: rfs(2) }}>{item.name}</Text>
//                                 <Text style={{ fontSize: rfs(2) }}>{item.phoneNumber}</Text>
//                             </View>
//                             {item.userState.exists ? (
//                                 <Button disabled={groupDetails.members.some(member => member.phoneNumber === item.phoneNumber)}
//                                     mode="contained" onPress={() => dispatch(addMember({ uid: item.userState.uid, groupId }))}>
//                                     Add
//                                 </Button>
//                             ) : (
//                                 <Button mode="outlined" onPress={() => sendInviteViaSMS(item.phoneNumber)}>
//                                     Invite
//                                 </Button>
//                             )}
//                         </View>
//                     )}
//                 />
//             </Modal>
//         </Portal >
//     )
// }

import { FlatList, Linking, StyleSheet, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { ActivityIndicator, Button, Modal, Portal, Searchbar, Text, TextInput, useTheme } from 'react-native-paper'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions'
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions'
import Contacts from 'react-native-contacts'
import dynamicLinks from '@react-native-firebase/dynamic-links'
import { useDispatch, useSelector } from 'react-redux'
import { checkUserExists } from '../services/userService'
import { useNavigation } from '@react-navigation/native'
import { addMember } from '../redux/slices/groupSlice'
import AsyncStorage from "@react-native-async-storage/async-storage"
import queryString from 'query-string'

const AddMemberModal = ({ visible, onDismiss }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const [searchQuery, setSearchQuery] = useState('')
    const [contacts, setContacts] = useState([])
    const [filteredContacts, setFilteredContacts] = useState([])
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [manualPhoneNumber, setManualPhoneNumber] = useState('')
    const [manualUserState, setManualUserState] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const { groupDetails } = useSelector(state => state.group)
    const groupId = groupDetails?.groupId

    // Normalize phone number to standard format
    const normalizePhoneNumber = useCallback((phoneNumber) => {
        if (!phoneNumber) return ''
        let cleanedNumber = phoneNumber.replace(/\D+/g, '')
        if (cleanedNumber.length >= 10) {
            cleanedNumber = cleanedNumber.slice(-10)
        }
        return `+91${cleanedNumber}`
    }, [])

    // Handle deep links for invitations
    const handleDeepLink = useCallback(async (link) => {
        if (link) {
            console.log('Received deep link:', link.url)
            const parsed = queryString.parseUrl(link.url)
            const groupId = parsed.query.groupId
            if (groupId) {
                await AsyncStorage.setItem('pendingGroupId', groupId)
            }
        }
    }, [])

    // Generate invite link for sharing
    const generateInviteLink = useCallback(async (groupId) => {
        try {
            return await dynamicLinks().buildShortLink({
                link: `https://shareslice.com/groupInvite?groupId=${groupId}`,
                domainUriPrefix: 'https://sharesliceapp.page.link',
                android: {
                    packageName: 'com.shareslice',
                    fallbackUrl: 'https://play.google.com/store/apps/details?id=com.shareslice'
                },
            })
        } catch (error) {
            console.error('Error creating invite link:', error)
            return null
        }
    }, [])

    // Send invitation via SMS
    const sendInviteViaSMS = useCallback(async (phoneNumber) => {
        setIsLoading(true)
        try {
            const inviteLink = await generateInviteLink(groupId)
            if (!inviteLink) {
                setIsLoading(false)
                return
            }

            const message = `Hey! Join my group on SliceShare using this link: ${inviteLink}`
            const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`
            await Linking.openURL(smsUrl)
        } catch (error) {
            console.error('Error sending SMS invite:', error)
        } finally {
            setIsLoading(false)
        }
    }, [generateInviteLink, groupId])

    // Check if users exist in the system
    const checkUserStatus = useCallback(async (contactList) => {
        setIsLoading(true)
        try {
            const updatedContacts = await Promise.all(contactList.map(async (contact) => {
                const formattedNumber = normalizePhoneNumber(contact.phoneNumber)
                const userState = await checkUserExists(formattedNumber)
                return { ...contact, phoneNumber: formattedNumber, userState }
            }))
            setContacts(updatedContacts)
            setFilteredContacts(updatedContacts)
        } catch (error) {
            console.error('Error checking user status:', error)
        } finally {
            setIsLoading(false)
        }
    }, [normalizePhoneNumber])

    // Fetch contacts from device
    const fetchContacts = useCallback(async () => {
        setIsLoading(true)
        try {
            // Try to get cached contacts first
            const storedContacts = await AsyncStorage.getItem("contacts")
            if (storedContacts) {
                const parsedContacts = JSON.parse(storedContacts)
                setContacts(parsedContacts)
                setFilteredContacts(parsedContacts)
                checkUserStatus(parsedContacts)
                return
            }

            // Fetch fresh contacts if none cached
            const contacts = await Contacts.getAll()
            const filteredContacts = contacts
                .filter(contact => contact.phoneNumbers.length > 0)
                .map(contact => ({
                    id: contact.recordID,
                    name: contact.displayName || 'Unknown',
                    phoneNumber: contact.phoneNumbers[0].number,
                }))

            await AsyncStorage.setItem("contacts", JSON.stringify(filteredContacts))
            await checkUserStatus(filteredContacts)
        } catch (error) {
            console.error('Error fetching contacts:', error)
        } finally {
            setIsLoading(false)
        }
    }, [checkUserStatus])

    // Check contacts permission
    const checkContactsPermission = useCallback(async () => {
        const status = await check(PERMISSIONS.ANDROID.READ_CONTACTS)
        if (status === RESULTS.GRANTED) {
            setPermissionGranted(true)
            fetchContacts()
        }
    }, [fetchContacts])

    // Request contacts permission
    const askContactsPermission = useCallback(() => {
        request(PERMISSIONS.ANDROID.READ_CONTACTS).then((status) => {
            if (status === RESULTS.GRANTED) {
                setPermissionGranted(true)
                fetchContacts()
            }
        })
    }, [fetchContacts])

    // Check manual phone number
    const handleManualCheck = useCallback(async () => {
        if (!manualPhoneNumber || manualPhoneNumber.trim() === '') return

        setIsLoading(true)
        try {
            const formattedNumber = normalizePhoneNumber(manualPhoneNumber)
            const userState = await checkUserExists(formattedNumber)
            setManualUserState({ phoneNumber: formattedNumber, ...userState })
        } catch (error) {
            console.error('Error checking manual number:', error)
        } finally {
            setIsLoading(false)
        }
    }, [manualPhoneNumber, normalizePhoneNumber])

    // Add member to group
    const handleAddMember = useCallback((uid) => {
        dispatch(addMember({ uid, groupId }))
    }, [dispatch, groupId])

    // Filter contacts based on search query
    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            setFilteredContacts(contacts)
            return
        }

        const filtered = contacts.filter(contact =>
            contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.phoneNumber.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, ''))
        )
        setFilteredContacts(filtered)
    }, [searchQuery, contacts])

    // Check permission on mount
    useEffect(() => {
        checkContactsPermission()
    }, [checkContactsPermission])

    // Setup deep link handling
    useEffect(() => {
        const unsubscribe = dynamicLinks().onLink(handleDeepLink)
        dynamicLinks().getInitialLink().then(handleDeepLink)
        return () => unsubscribe()
    }, [handleDeepLink])

    // Render contact item
    const renderContactItem = ({ item }) => {
        const isMemberAlready = groupDetails.members.some(
            member => member.phoneNumber === item.phoneNumber
        )

        return (
            <View style={styles.contactRow}>
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                </View>
                {item.userState?.exists ? (
                    <Button
                        mode="contained"
                        disabled={isMemberAlready}
                        onPress={() => handleAddMember(item.userState.uid)}
                        style={styles.actionButton}
                    >
                        {isMemberAlready ? 'Added' : 'Add'}
                    </Button>
                ) : (
                    <Button
                        mode="outlined"
                        onPress={() => sendInviteViaSMS(item.phoneNumber)}
                        style={styles.actionButton}
                    >
                        Invite
                    </Button>
                )}
            </View>
        )
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.secondaryContainer }]}
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.colors.onSecondaryContainer }]}>
                        Add a member
                    </Text>
                    <Button
                        labelStyle={styles.doneButtonLabel}
                        onPress={onDismiss}
                    >
                        Done
                    </Button>
                </View>

                <Searchbar
                    style={styles.searchbar}
                    placeholder="Search friends"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    loading={isLoading}
                />

                {!permissionGranted && (
                    <Button
                        mode='contained'
                        style={styles.allowBtn}
                        onPress={askContactsPermission}
                    >
                        Allow contacts
                    </Button>
                )}

                <View style={styles.manualEntrySection}>
                    <Text variant='titleMedium' style={styles.sectionTitle}>
                        Enter Phone Number
                    </Text>
                    <View style={styles.manualInputRow}>
                        <TextInput
                            style={styles.manualInput}
                            placeholder="Enter phone number"
                            value={manualPhoneNumber}
                            keyboardType="phone-pad"
                            onChangeText={setManualPhoneNumber}
                        />
                        <Button
                            mode="contained"
                            onPress={handleManualCheck}
                            disabled={!manualPhoneNumber || isLoading}
                            style={styles.checkButton}
                        >
                            Check
                        </Button>
                    </View>
                </View>

                {manualUserState && (
                    <View style={styles.manualUserRow}>
                        <Text style={styles.manualUserPhone}>
                            {manualUserState.phoneNumber}
                        </Text>
                        {manualUserState.exists ? (
                            <Button
                                mode="contained"
                                onPress={() => handleAddMember(manualUserState.uid)}
                                style={styles.actionButton}
                            >
                                Add
                            </Button>
                        ) : (
                            <Button
                                mode="outlined"
                                onPress={() => sendInviteViaSMS(manualUserState.phoneNumber)}
                                style={styles.actionButton}
                            >
                                Invite
                            </Button>
                        )}
                    </View>
                )}

                {filteredContacts.length > 0 && (
                    <Text variant='titleMedium' style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                        Friends
                    </Text>
                )}

                {isLoading && filteredContacts.length === 0 ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                ) : (
                    <FlatList
                        data={filteredContacts}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={renderContactItem}
                        contentContainerStyle={styles.contactsList}
                        ListEmptyComponent={
                            permissionGranted && !isLoading ? (
                                <Text style={styles.emptyListText}>No contacts found</Text>
                            ) : null
                        }
                    />
                )}
            </Modal>
        </Portal>
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