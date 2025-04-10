import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LoadingScreen from '../screens/LoadingScreen';
import { clearUser, setUser } from '../redux/slices/userAuthSlice';
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore';
import { Text } from 'react-native-paper';

const SplashScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                try {
                    const userDoc = await firestore().collection('users').doc(currentUser.uid).get();

                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        dispatch(setUser({
                            uid: currentUser.uid,
                            phoneNumber: userData.phoneNumber || '',
                            fullName: userData.fullName || '',
                            email: userData.email || '',
                            avatar: userData.avatar || '',
                            groups: userData.groups || [],
                            isEmailVerified: userData.isEmailVerified || false,
                            isProfileComplete: userData.isProfileComplete || false,
                            upiId: userData.upiId || ''
                        }));

                        // Route based on profile/email
                        if (!userData.isProfileComplete) {
                            navigation.replace('AuthStack', { screen: 'Profile' });
                        } else if (!userData.isEmailVerified) {
                            navigation.replace('AuthStack', { screen: 'VerifyEmail' });
                        } else {
                            navigation.replace('MainStack');
                        }
                    } else {
                        navigation.replace('AuthStack', { screen: 'Profile' });
                    }
                } catch (err) {
                    console.error('Error loading user:', err);
                    navigation.replace('AuthStack');
                }
            } else {
                dispatch(clearUser());
                navigation.replace('AuthStack');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return null;
};

export default SplashScreen;