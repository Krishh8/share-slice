import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReminders } from '../redux/slices/reminderSlice';
import HeaderComponent from '../components/HeaderComponent';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import avatars from '../data/Avatar';
import ReminderComponent from '../components/ReminderComponent';
import LottieView from "lottie-react-native";

const EmptyComponent = () => {
    return (
        <View style={[styles.emptyContainer]}>
            {/* <View
                style={{ width: 200, height: 200, }} // Fixed size
                // source={require("../assets/lottieFiles/NoDataFound.json")}
                source={{ uri: 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*ZFXXmTX3HIZHSlmmU7Ydqg.gif' }}

            /> */}
            <Text style={[styles.emptyText]}>No Reminders yet.</Text>
        </View >
    )
}

const ReminderScreen = () => {
    const dispatch = useDispatch();
    const theme = useTheme()
    const [isSent, setIsSent] = useState(true);
    const [isReceived, setIsReceived] = useState(true);
    const { sentReminders, receivedReminders, loading, error } = useSelector(state => state.reminder);

    useEffect(() => {
        dispatch(fetchReminders());
    }, [dispatch]);
    console.log(error)


    if (loading) return <ActivityIndicator size="large" />;
    if (error) return <Text>Error: {error}</Text>;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <HeaderComponent title="Reminders" />

            <View style={[styles.reminders]}>
                <View style={[styles.section, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Text style={[styles.sectionText, { color: theme.colors.primary }]}>Received Reminders</Text>
                    <IconButton icon={isReceived ? "unfold-more-horizontal" : "unfold-less-horizontal"} onPress={() => setIsReceived((prev) => !prev)} iconColor={theme.colors.primary} />
                </View>
                {isReceived &&
                    <FlatList
                        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                        data={receivedReminders}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ReminderComponent reminder={item} />
                        )}
                        ListEmptyComponent={
                            <EmptyComponent />
                        }
                    />
                }

                <View style={[styles.section, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Text style={[styles.sectionText, { color: theme.colors.primary }]}>Sent Reminders</Text>
                    <IconButton icon={isSent ? "unfold-more-horizontal" : "unfold-less-horizontal"} onPress={() => setIsSent((prev) => !prev)} iconColor={theme.colors.primary} />
                </View>
                {isSent &&
                    <FlatList
                        data={sentReminders}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ReminderComponent reminder={item} />
                        )}
                        ListEmptyComponent={
                            <EmptyComponent />
                        }
                    />
                }
            </View>

        </View>
    );
};

export default ReminderScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    reminders: {
    },
    emptyContainer: {
        flex: 1,
        marginVertical: rh(4),
        justifyContent: "center",
        alignItems: 'center'
    },
    emptyText: {
        fontSize: rfs(2.5),
        fontWeight: 'bold'
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: rh(2),
        borderRadius: rh(1),
        marginBottom: rh(2)
    },
    sectionText: {
        fontSize: rfs(2),
        fontWeight: 'bold'
    }
})
