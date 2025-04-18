import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import GroupExpensesScreen from '../screens/Groups/GroupExpensesScreen';
import GroupBalanceScreen from '../screens/Groups/GroupBalanceScreen';
import GroupSummaryScreen from '../screens/Groups/GroupSummaryScreen';
import { useTheme } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import GroupTransactionScreen from '../screens/Groups/GroupTransactionScreen';

const TopTab = createMaterialTopTabNavigator();

const GroupTopTabNavigator = ({ groupId }) => {
    const theme = useTheme()
    return (

        <TopTab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: theme.colors.secondaryContainer,
                },
                tabBarItemStyle: {
                    width: rw(35)
                },
                tabBarLabelStyle: {
                    fontWeight: 'bold',
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.secondary,
                tabBarIndicatorStyle: {
                    backgroundColor: theme.colors.primary,
                    height: rh(0.3),
                    borderRadius: rh(1)
                },
                tabBarScrollEnabled: true,
            }}

            initialRouteName='GroupExpenses'
        >
            <TopTab.Screen
                name="GroupExpenses"
                component={GroupExpensesScreen}
                options={{ title: "Expenses" }}
                initialParams={{ groupId }} // ✅ Pass groupId as an initial param
            />
            <TopTab.Screen
                name="GroupBalance"
                component={GroupBalanceScreen}
                options={{ title: "Balance" }}
                initialParams={{ groupId }} // ✅ Pass groupId
            />
            <TopTab.Screen
                name="GroupTransaction"
                component={GroupTransactionScreen}
                options={{ title: "Settlements" }}
                initialParams={{ groupId }} // ✅ Pass groupId
            />
            <TopTab.Screen
                name="SummaryTopTab"
                component={GroupSummaryScreen}
                options={{ title: "Summary" }}
                initialParams={{ groupId }} // ✅ Pass groupId
            />

        </TopTab.Navigator >

    );
}

export default GroupTopTabNavigator;