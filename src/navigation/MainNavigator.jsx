import React from 'react';
import TabNavigator from './TabNavigator';
import GroupSettingScreen from '../screens/Groups/GroupSettingScreen';
import AccountScreen from '../screens/AccountScreen';
import EditAccountScreen from '../screens/EditAccountScreen';
import GroupTopTabNavigator from './GroupTopTabNavigator';
import GroupDetailScreen from '../screens/Groups/GroupDetailScreen';
import AddExpenseScreen from '../screens/Groups/AddExpenseScreen';
import AddFriendsScreen from '../screens/Groups/AddFriendsScreen';
import { createStackNavigator } from '@react-navigation/stack';
import ExpenseDetailScreen from '../screens/Groups/ExpenseDetailScreen';
import UpdateExpenseScreen from '../screens/Groups/UpdateExpenseScreen';
import { customScreenInterpolator } from '../animation/customScreenInterpolator';
import { Easing } from 'react-native';


const MainStack = createStackNavigator();

const MainNavigator = () => {
    return (
        <MainStack.Navigator screenOptions={{
            headerShown: false,
        }}>
            <MainStack.Screen name="TabNavigator" component={TabNavigator} />
            <MainStack.Screen name="GroupSettings" component={GroupSettingScreen} />
            <MainStack.Screen name="Account" component={AccountScreen} />
            <MainStack.Screen name="EditAccount" component={EditAccountScreen} />
            <MainStack.Screen name="GroupTopTabNavigator" component={GroupTopTabNavigator} />
            <MainStack.Screen name="GroupDetails" component={GroupDetailScreen} />
            <MainStack.Screen name="ExpenseDetails" component={ExpenseDetailScreen} />
            <MainStack.Screen name="AddExpense" component={AddExpenseScreen} />
            <MainStack.Screen name="UpdateExpense" component={UpdateExpenseScreen} />
            <MainStack.Screen name="AddFriends" component={AddFriendsScreen} />

        </MainStack.Navigator>
    );
};

export default MainNavigator;
