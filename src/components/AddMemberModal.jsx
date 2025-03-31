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
                console.log('Extracted Group ID from URL:', groupId); // Log the groupId
                await AsyncStorage.setItem('pendingGroupId', groupId);
            } else {
                console.log('No groupId found in deep link.');
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
            console.log(`link: `, inviteLink)
            if (!inviteLink) {
                setIsLoading(false)
                return
            }

            const message = `Hey! Join my group on ShareSlice using this link: ${inviteLink}`
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


    // Add member to group
    const handleAddMember = useCallback((uid) => {
        dispatch(addMember({ uid, groupId }))
    }, [dispatch, groupId])

    // Filter contacts based on search query
    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            setFilteredContacts(contacts)
            setManualUserState(null) // Reset manual search state
            return
        }

        const filtered = contacts.filter(contact =>
            contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.phoneNumber.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, ''))
        )

        if (filtered.length > 0) {
            setFilteredContacts(filtered)
            setManualUserState(null) // Reset manual search state if found in contacts
        } else if (/^\d{10}$/.test(searchQuery)) {
            // If a valid 10-digit number is entered, check manually
            const formattedNumber = normalizePhoneNumber(searchQuery)
            setManualPhoneNumber(formattedNumber)
            handleManualCheck(formattedNumber) // Automatically check user status
        } else {
            setFilteredContacts([])
            setManualUserState(null)
        }
    }, [searchQuery, contacts])

    // Modified handleManualCheck to accept input number
    const handleManualCheck = useCallback(async (number) => {
        if (!number) return

        setIsLoading(true)
        try {
            const userState = await checkUserExists(number)
            setManualUserState({ phoneNumber: number, ...userState })
        } catch (error) {
            console.error('Error checking number:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])


    // Check permission on mount
    useEffect(() => {
        checkContactsPermission()
    }, [checkContactsPermission])

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

    const renderResults = () => {
        if (filteredContacts.length > 0) {
            return (
                <>
                    <Text variant='titleMedium' style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                        Friends
                    </Text>
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
                </>
            )
        } else if (manualUserState) {
            const isMemberAlready = groupDetails.members.some(
                member => member.phoneNumber === manualUserState.phoneNumber
            )
            return (
                <View style={styles.contactRow}>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactPhone}>{manualUserState.phoneNumber}</Text>
                    </View>
                    {manualUserState?.exists ? (
                        <Button
                            mode="contained"
                            disabled={isMemberAlready}
                            onPress={() => handleAddMember(manualUserState.uid)}
                            style={styles.actionButton}
                        >
                            {isMemberAlready ? 'Added' : 'Add'}
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
            )
        } else if (!isLoading && searchQuery.length >= 10) {
            return <Text style={styles.emptyListText}>User not found</Text>
        }
        return null
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.secondaryContainer }]}
            >
                <View style={[styles.header]}>
                    <Text style={[{ fontSize: rfs(2.5) }, { fontWeight: '700' }, { color: theme.colors.onSecondaryContainer }]} >Add a member</Text>
                    <Button labelStyle={[{ fontSize: rfs(2.5) }]} onPress={() => (onDismiss())}>Done</Button>
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

                {renderResults()}

                {/* <View style={styles.manualEntrySection}>
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
                </View> */}

                {/* {manualUserState && (
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
                )} */}
                {/* 
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
                )} */}
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