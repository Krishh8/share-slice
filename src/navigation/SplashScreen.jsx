import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LoadingScreen from '../screens/LoadingScreen';
import { clearUser, setUser } from '../redux/slices/userAuthSlice';
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore';
import { Image, View } from 'react-native';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { Text, useTheme } from 'react-native-paper';

const SplashScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const theme = useTheme()
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
                            isProfileComplete: userData.isProfileComplete || false,
                            upiId: userData.upiId || ''
                        }));

                        if (!userData.isProfileComplete) {
                            navigation.replace('AuthStack', { screen: 'Profile' });
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

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
            <Image source={require('../assets/icon.png')} style={{ width: rh(20), height: rh(20), borderRadius: rh(20) }} />
            <Text variant='headlineLarge' style={{ marginVertical: rh(1) }}>ShareSlice</Text>
        </View>
    );
};

export default SplashScreen;