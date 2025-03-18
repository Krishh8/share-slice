import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import SummaryCategoryWiseScreen from './SummaryCategoryWise';
import SummaryTotalScreen from './SummaryTotalScreen';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';

const SummaryTopTab = createMaterialTopTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const theme = useTheme();
    return (
        <View style={[
            {
                marginTop: rh(2),
                marginBottom: rh(4),
                flexDirection: 'row',
                justifyContent: 'center'
            }
        ]}>
            {/* <ScrollView horizontal contentContainerStyle={{
                marginVertical: rh(2),
            }}> */}
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const { options } = descriptors[route.key];
                const label = options.title;

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={() => navigation.navigate(route.name)}
                        style={{
                            backgroundColor: isFocused ? theme.colors.primary : 'transparent',
                            paddingVertical: rh(1),
                            paddingHorizontal: rw(4),
                            borderRadius: rw(10),
                            marginHorizontal: rw(2),
                            borderWidth: rw(0.3),
                            borderColor: theme.colors.primary,
                        }}
                    >
                        <Text style={{
                            color: isFocused ? theme.colors.background : theme.colors.primary,
                            fontWeight: 'bold',
                        }}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
            {/* </ScrollView> */}
        </View>
    );
};

const GroupSummaryScreen = () => {
    const theme = useTheme();

    return (
        <SummaryTopTab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            style={[{ backgroundColor: theme.colors.background }]}
        >
            <SummaryTopTab.Screen
                name="SummaryCategoryWise"
                component={SummaryCategoryWiseScreen}
                options={{ title: "Category Wise" }}
            />
            <SummaryTopTab.Screen
                name="SummaryTotal"
                component={SummaryTotalScreen}
                options={{ title: "Total Spending" }}
            />

        </SummaryTopTab.Navigator>
    );
};

export default GroupSummaryScreen;
