import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import GroupExpensesScreen from '../screens/Groups/GroupExpensesScreen';
import GroupBalanceScreen from '../screens/Groups/GroupBalanceScreen';
import GroupSummaryScreen from '../screens/Groups/GroupSummaryScreen';
import { useTheme } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';

const TopTab = createMaterialTopTabNavigator();

const GroupTopTabNavigator = () => {
    const theme = useTheme()
    return (
        <TopTab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: theme.colors.secondaryContainer,
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
            }
            }
            initialRouteName='GroupExpenses'
        >
            <TopTab.Screen name="GroupExpenses" component={GroupExpensesScreen} options={{ title: "Expenses" }} />
            <TopTab.Screen name="GroupBalance" component={GroupBalanceScreen} options={{ title: "Balance" }} />
            <TopTab.Screen name="GroupSummary" component={GroupSummaryScreen} options={{ title: "Summary" }} />
        </TopTab.Navigator >
    );
}

export default GroupTopTabNavigator;