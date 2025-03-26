import { StatusBar } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

import React from 'react';

const App = () => {
    return (
        <>
            <StatusBar />
            <AppNavigator />
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

