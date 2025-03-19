import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LoadingScreen from '../screens/LoadingScreen';
import { clearUser, setUser } from '../redux/slices/userAuthSlice';
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore';

const SplashScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const checkAuthState = async () => {
    //         const currentUser = auth().currentUser;

    //         if (currentUser) {
    //             try {
    //                 const userRef = firestore().collection('users').doc(currentUser.uid);
    //                 const userDoc = await userRef.get();

    //                 if (userDoc.exists) {
    //                     const userData = userDoc.data();
    //                     dispatch(setUser({
    //                         uid: userData.uid,
    //                         phoneNumber: userData.phoneNumber || '',
    //                         fullName: userData.fullName || '',
    //                         email: userData.email || '',
    //                         avatar: userData.avatar || '',
    //                         groups: userData.groups || [],
    //                         isEmailVerified: userData.isEmailVerified || false,
    //                         isProfileComplete: userData.isProfileComplete || false,
    //                         upiId: userData.upiId || ''
    //                     }));

    //                     if (!userData.isProfileComplete) {
    //                         navigation.replace('AuthStack', { screen: 'Profile' });
    //                     } else if (!userData.isEmailVerified) {
    //                         navigation.replace('AuthStack', { screen: 'VerifyEmail' });
    //                     } else {
    //                         navigation.replace('MainStack');
    //                     }
    //                 } else {
    //                     // User exists in Firebase Auth but not in Firestore
    //                     navigation.replace('AuthStack', { screen: 'Profile' });
    //                 }
    //             } catch (error) {
    //                 console.error('Error fetching user:', error);
    //                 navigation.replace('AuthStack');
    //             }
    //         } else {
    //             dispatch(clearUser());
    //             navigation.replace('AuthStack');
    //         }

    //         setLoading(false);
    //     };

    //     checkAuthState();
    // }, []);

    useEffect(() => {
        // Listen for auth state changes in real-time
        const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                try {
                    const userRef = firestore().collection('users').doc(currentUser.uid);
                    const userDoc = await userRef.get();

                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        dispatch(setUser({
                            uid: userData.uid,
                            phoneNumber: userData.phoneNumber || '',
                            fullName: userData.fullName || '',
                            email: userData.email || '',
                            avatar: userData.avatar || '',
                            groups: userData.groups || [],
                            isEmailVerified: userData.isEmailVerified || false,
                            isProfileComplete: userData.isProfileComplete || false,
                            upiId: userData.upiId || ''
                        }));

                        if (!userData.isProfileComplete) {
                            navigation.replace('AuthStack', { screen: 'Profile' });
                        } else if (!userData.isEmailVerified) {
                            navigation.replace('AuthStack', { screen: 'VerifyEmail' });
                        } else {
                            navigation.replace('MainStack');
                        }
                    } else {
                        // User exists in Firebase Auth but not in Firestore
                        navigation.replace('AuthStack', { screen: 'Profile' });
                    }
                } catch (error) {
                    console.error('Error fetching user:', error);
                    navigation.replace('AuthStack');
                }
            } else {
                dispatch(clearUser());
                navigation.replace('AuthStack');
            }

            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener when component unmounts
    }, []);

    if (loading) {
        return (
            <LoadingScreen />
        );
    }

    return null;
};

export default SplashScreen;
