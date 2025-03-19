import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/Auth/ProfileScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import VerifyOtpScreen from '../screens/Auth/VerifyOtpScreen';
import VerifyEmailScreen from '../screens/Auth/VerifyEmailScreen';
import { customScreenInterpolator } from '../animation/customScreenInterpolator';
import { Easing } from 'react-native';

const AuthStack = createStackNavigator();

const AuthNavigator = () => {
    return (
        <AuthStack.Navigator screenOptions={{
            headerShown: false,
        }}>
            <AuthStack.Screen name="SignUp" component={SignUpScreen} />
            <AuthStack.Screen name="VerifyOTP" component={VerifyOtpScreen} />
            <AuthStack.Screen name="Profile" component={ProfileScreen} />
            <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        </AuthStack.Navigator>
    );
}

export default AuthNavigator