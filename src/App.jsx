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

export default App;

