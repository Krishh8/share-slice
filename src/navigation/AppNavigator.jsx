import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import TabNavigator from './TabNavigator';
import GroupTopTabNavigator from './GroupTopTabNavigator';
import GroupSummaryScreen from '../screens/Groups/GroupSummaryScreen';


const Stack = createStackNavigator();
const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="AuthStack" component={AuthNavigator} />
                <Stack.Screen name="MainStack" component={MainNavigator} />
                <Stack.Screen name="Loading" component={LoadingScreen} />
                <Stack.Screen name="BottomTab" component={TabNavigator} />
                <Stack.Screen name="TopTab" component={GroupTopTabNavigator} />
                <Stack.Screen name="SummaryTopTab" component={GroupSummaryScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;