import { StatusBar, Text, View, ScrollView, StyleSheet, PermissionsAndroid, Alert } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

import React, { useEffect } from 'react';
import { useTheme, Card, Title, Button } from "react-native-paper"
import LinearGradient from 'react-native-linear-gradient';
import { Linking } from 'react-native';


const App = () => {
  return (
    <>
      <StatusBar />
      <AppNavigator />
    </>
  );
};

// import { useEffect, useState } from 'react';
// import { View, Text, FlatList, Button, Alert, Linking } from 'react-native';
// import Contacts from 'react-native-contacts';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// const App = () => {
//   const [contacts, setContacts] = useState([]);

//   useEffect(() => {
//     checkContactsPermission();
//   }, []);

//   const checkContactsPermission = async () => {
//     const permission = PERMISSIONS.ANDROID.READ_CONTACTS; // iOS: PERMISSIONS.IOS.CONTACTS

//     const result = await check(permission);
//     if (result === RESULTS.GRANTED) {
//       fetchContacts();
//     } else {
//       requestContactsPermission();
//     }
//   };

//   const requestContactsPermission = async () => {
//     const permission = PERMISSIONS.ANDROID.READ_CONTACTS;

//     const result = await request(permission);
//     if (result === RESULTS.GRANTED) {
//       fetchContacts();
//     } else {
//       Alert.alert('Permission Denied', 'Contacts access is required to display contacts.');
//     }
//   };

//   const fetchContacts = async () => {
//     try {
//       const contacts = await Contacts.getAll();
//       console.log("Fetched Contacts:", contacts); // Log contacts
//       if (contacts.length === 0) {
//         console.warn("No contacts found!");
//       }
//       setContacts(contacts);
//     } catch (error) {
//       console.error("Error fetching contacts:", error);
//       Alert.alert("Error", error.message); // Show error message
//     }
//   };


//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
//       <Button title="Load Contacts" onPress={fetchContacts} />
//       <FlatList
//         data={contacts}
//         keyExtractor={item => item.recordID}
//         renderItem={({ item }) => (
//           <Text>{item.displayName} - {item.phoneNumbers[0]?.number}</Text>
//         )}
//         ListEmptyComponent={<Text>NOO</Text>}
//       />
//     </View>
//   );
// };

// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import { NavigationContainer } from '@react-navigation/native';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { Easing } from 'react-native-reanimated';

// const Stack = createStackNavigator();

// const customScreenInterpolator = ({ current, next }) => {
//   return {
//     cardStyle: {
//       opacity: current.progress,
//       transform: [
//         {
//           scale: next
//             ? next.progress.interpolate({
//               inputRange: [0, 1],
//               outputRange: [0.95, 1],
//             })
//             : current.progress.interpolate({
//               inputRange: [0, 1],
//               outputRange: [1, 1.05],
//             }),
//         },
//       ],
//     },
//   };
// };

// const HomeScreen = ({ navigation }) => (
//   <View style={styles.container}>
//     <Text style={styles.title}>Home Screen</Text>
//     <Button title="Go to Details" onPress={() => navigation.navigate('Details')} />
//   </View>
// );

// const DetailsScreen = ({ navigation }) => (
//   <View style={styles.container}>
//     <Text style={styles.title}>Details Screen</Text>
//     <Button title="Go Back" onPress={() => navigation.goBack()} />
//   </View>
// );

// function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         screenOptions={{
//           cardStyleInterpolator: customScreenInterpolator,
//           transitionSpec: {
//             open: {
//               animation: 'timing',
//               config: {
//                 duration: 500,
//                 easing: Easing.inOut(Easing.ease),
//               },
//             },
//             close: {
//               animation: 'timing',
//               config: {
//                 duration: 500,
//                 easing: Easing.inOut(Easing.ease),
//               },
//             },
//           },
//         }}
//       >
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen name="Details" component={DetailsScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f4f4f4',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
// });


export default App;
