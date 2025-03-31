import { StatusBar } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { checkReminders } from './redux/slices/reminderSlice';
import Toast from 'react-native-toast-message';


const App = () => {
    useEffect(() => {
        const handleDeepLink = async (link) => {
            if (link) {
                console.log('Received deep link:', link.url);
                const parsed = queryString.parseUrl(link.url);
                const groupId = parsed.query.groupId;
                if (groupId) {
                    console.log('Extracted Group ID from URL:', groupId);
                    await AsyncStorage.setItem('pendingGroupId', groupId);
                } else {
                    console.log('No groupId found in deep link.');
                }
            }
        };

        // Handle deep links when app is opened from a link
        dynamicLinks().getInitialLink().then(handleDeepLink);

        // Listen for deep links while app is running
        const unsubscribe = dynamicLinks().onLink(handleDeepLink);

        return () => unsubscribe();
    }, []);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(checkReminders());
    }, []);

    return (
        <>
            <StatusBar />
            <AppNavigator />
            <Toast />
        </>
    );
};

// --------------------------------------------------------

// import { useEffect, useState } from 'react';
// import { View, Text, FlatList, Button, Alert, Linking } from 'react-native';
// import Contacts from 'react-native-contacts';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// const App = () => {
//     const [contacts, setContacts] = useState([]);

//     useEffect(() => {
//         checkContactsPermission();
//     }, []);

//     const checkContactsPermission = async () => {
//         const permission = PERMISSIONS.ANDROID.READ_CONTACTS; // iOS: PERMISSIONS.IOS.CONTACTS

//         const result = await check(permission);
//         if (result === RESULTS.GRANTED) {
//             fetchContacts();
//         } else {
//             requestContactsPermission();
//         }
//     };

//     const requestContactsPermission = async () => {
//         const permission = PERMISSIONS.ANDROID.READ_CONTACTS;

//         const result = await request(permission);
//         if (result === RESULTS.GRANTED) {
//             fetchContacts();
//         } else {
//             Alert.alert('Permission Denied', 'Contacts access is required to display contacts.');
//         }
//     };

//     const fetchContacts = async () => {
//         try {
//             console.log("Contacts", Contacts.checkPermission())
//             const contacts = await Contacts.getAll();
//             console.log("Fetched Contacts:", contacts); // Log contacts
//             if (contacts.length === 0) {
//                 console.warn("No contacts found!");
//             }
//             setContacts(contacts);
//         } catch (error) {
//             console.error("Error fetching contacts:", error);
//             Alert.alert("Error", error.message); // Show error message
//         }
//     };


//     return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
//             <Button title="Load Contacts" onPress={fetchContacts} />
//             <FlatList
//                 data={contacts}
//                 keyExtractor={item => item.recordID}
//                 renderItem={({ item }) => (
//                     <Text>{item.displayName} - {item.phoneNumbers[0]?.number}</Text>
//                 )}
//                 ListEmptyComponent={<Text>NOO</Text>}
//             />
//         </View>
//     );
// };

export default App;

