import { FlatList, Keyboard, Linking, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { ActivityIndicator, Button, Chip, Divider, IconButton, Modal, Portal, Searchbar, Text, TextInput, useTheme } from 'react-native-paper'
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
import { showToast } from '../services/toastService'
import { cachedCheckUserExists, clearUserExistenceCache, handleRefreshUserStatus } from '../services/checkIfUserExists'
import { sendInviteViaSMS } from '../services/InviteServices'

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
    const [checkingManualUser, setCheckingManualUser] = useState(false)
    const { groupDetails } = useSelector(state => state.group)
    const groupId = groupDetails?.groupId

    useEffect(() => {
        checkContactsPermission()
    }, [checkContactsPermission])

    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            setFilteredContacts(contacts)
            setManualUserState(null)
            return
        }

        const filtered = contacts.filter(contact =>
            contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.phoneNumber.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, ''))
        )

        if (filtered.length > 0) {
            setFilteredContacts(filtered)
            setManualUserState(null)
        } else if (/^\d{10}$/.test(searchQuery)) {
            const formattedNumber = normalizePhoneNumber(searchQuery)
            setManualPhoneNumber(formattedNumber)
            handleManualCheck(formattedNumber)
        } else {
            setFilteredContacts([])
            setManualUserState(null)
        }
    }, [searchQuery, contacts])

    const normalizePhoneNumber = useCallback((phoneNumber) => {
        if (!phoneNumber) return ''
        let cleanedNumber = phoneNumber.replace(/\D+/g, '')
        if (cleanedNumber.length >= 10) {
            cleanedNumber = cleanedNumber.slice(-10)
        }
        return `+91${cleanedNumber}`
    }, [])

    const checkUserStatus = useCallback(async (contactList) => {
        setIsLoading(true)
        try {
            const updatedContacts = await Promise.all(contactList.map(async (contact) => {
                const formattedNumber = normalizePhoneNumber(contact.phoneNumber)
                const userState = await cachedCheckUserExists(formattedNumber)
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

    const fetchContacts = useCallback(async () => {
        setIsLoading(true)
        try {
            const storedContacts = await AsyncStorage.getItem("contacts")
            if (storedContacts) {
                const parsedContacts = JSON.parse(storedContacts)
                setContacts(parsedContacts)
                setFilteredContacts(parsedContacts)
                checkUserStatus(parsedContacts)
                return
            }

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

    const checkContactsPermission = useCallback(async () => {
        const status = await check(PERMISSIONS.ANDROID.READ_CONTACTS)
        if (status === RESULTS.GRANTED) {
            setPermissionGranted(true)
            fetchContacts()
        }
    }, [fetchContacts])

    const askContactsPermission = useCallback(() => {
        request(PERMISSIONS.ANDROID.READ_CONTACTS).then((status) => {
            if (status === RESULTS.GRANTED) {
                setPermissionGranted(true)
                fetchContacts()
            }
        })
    }, [fetchContacts])

    const handleSendInviteViaSMS = (phoneNumber) => {
        sendInviteViaSMS(phoneNumber, groupId, setIsLoading)
    }

    const handleAddMember = useCallback(async (uid) => {
        console.log(uid)
        try {
            onDismiss()
            await dispatch(addMember({ uid, groupId })).unwrap()
            showToast('success', 'Member added successfully.')
        } catch (error) {
            showToast('error', "Failed to add Member.", error)
        }
    }, [dispatch, groupId])

    const handleManualCheck = useCallback(async (number) => {
        if (!number) return
        setCheckingManualUser(true)
        try {
            const userState = await cachedCheckUserExists(number)
            setManualUserState({ phoneNumber: number, userState })
        } catch (error) {
            console.error('Error checking number:', error)
        } finally {
            setCheckingManualUser(false)
        }
    }, [])

    const renderContactItem = ({ item }) => {
        const isMemberAlready = groupDetails.members.some(
            member => member.phoneNumber === item.phoneNumber
        )

        return (

            <View style={[styles.contactRow, { borderColor: theme.colors.secondary }]}>
                <View style={styles.contactInfo}>
                    <IconButton icon="refresh" onPress={() => clearUserExistenceCache(item.phoneNumber)} size={rfs(3)} />
                    <View >
                        <Text style={styles.contactName}>{item.name}</Text>
                        <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                    </View>
                </View>
                {item.userState === undefined ? (
                    <ActivityIndicator size="small" />
                ) : item.userState.exists ? (
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
                        disabled={isLoading}
                        onPress={() => handleSendInviteViaSMS(item.phoneNumber)}
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
                <View style={[styles.contactRow, { borderColor: theme.colors.blue }]}>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactPhone}>{manualUserState.phoneNumber}</Text>
                    </View>

                    {checkingManualUser || manualUserState.userState === undefined ? (
                        <ActivityIndicator size="small" />
                    ) : manualUserState.userState.exists ? (
                        <Button
                            mode="contained"
                            disabled={isMemberAlready}
                            onPress={() => handleAddMember(manualUserState.userState.uid)}
                            style={styles.actionButton}
                        >
                            {isMemberAlready ? 'Added' : 'Add'}
                        </Button>
                    ) : (
                        <Button
                            mode="outlined"
                            disabled={isLoading}
                            onPress={() => handleSendInviteViaSMS(manualUserState.phoneNumber)}
                            style={styles.actionButton}
                        >
                            Invite
                        </Button>
                    )}
                </View>
            )
        } else if (!checkingManualUser && searchQuery.length === 10) {
            return (
                <Text style={[styles.emptyListText, { color: theme.colors.error }]}>
                    User not found
                </Text>
            )
        }
        return null
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            {/* <View style={{ flex: 1 }}> */}
            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={onDismiss}
                    theme={{
                        colors: {
                            backdrop: "rgba(0, 0, 0, 0.7)",
                        },
                    }}
                    contentContainerStyle={[
                        styles.modalContainer,
                        { backgroundColor: theme.colors.secondaryContainer },
                    ]}
                >
                    <View style={styles.header}>
                        <Text
                            style={{
                                fontSize: rfs(2.5),
                                fontWeight: "700",
                                color: theme.colors.onSecondaryContainer,
                            }}
                        >
                            Add a member
                        </Text>
                        <Button
                            labelStyle={{ fontSize: rfs(2.5) }}
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
                            mode="contained"
                            style={styles.allowBtn}
                            onPress={askContactsPermission}
                        >
                            Allow contacts
                        </Button>
                    )}

                    {renderResults()}
                </Modal>
            </Portal>
            {/* </View> */}
        </TouchableWithoutFeedback>


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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: rh(1),
        borderBottomWidth: rw(0.3)
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    allowBtn: {
        marginTop: rh(1),
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    }

})