import React from 'react'
import { Icon, useTheme } from 'react-native-paper'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import FriendsScreen from '../screens/FriendsScreen'
import HomeScreen from '../screens/HomeScreen';
import BillsScreen from '../screens/BillsScreen';
import GroupsScreen from '../screens/GroupsScreen';

const BottomTab = createMaterialBottomTabNavigator()

const TabNavigator = () => {
    const theme = useTheme()
    return (
        <BottomTab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let icon;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Bills') {
                        iconName = focused ? 'receipt' : 'receipt';
                    } else if (route.name === 'Groups') {
                        iconName = focused ? 'account-group' : 'account-group-outline';
                    } else if (route.name === 'Friends') {
                        iconName = focused ? 'account-supervisor' : 'account-supervisor-outline';
                    }
                    return <Icon
                        source={iconName}
                        color={color}
                        size={rfs(3.5)}
                    />;
                },
            })}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.onSecondaryContainer}
            barStyle={[
                // { backgroundColor: theme.colors.secondaryContainer },
            ]}
        >
            <BottomTab.Screen name='Home' component={HomeScreen} />
            <BottomTab.Screen name='Bills' component={BillsScreen} />
            <BottomTab.Screen name='Groups' component={GroupsScreen} />
            <BottomTab.Screen name='Friends' component={FriendsScreen} />
            {/* <Tab.Screen name='Activity' component={ActivityScreen} /> */}
        </BottomTab.Navigator>
    )
}

export default TabNavigator