import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReminders } from '../redux/slices/reminderSlice';
import HeaderComponent from '../components/HeaderComponent';
import { Chip, IconButton, Text, useTheme } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import avatars from '../data/Avatar';
import ReminderComponent from '../components/ReminderComponent';
import LottieView from "lottie-react-native";

const EmptyComponent = () => {
    return (
        <View style={[styles.emptyContainer]}>
            <LottieView
                style={{ width: 200, height: 200, }} // Fixed size
                source={require("../assets/lottieFiles/NoDataFound.json")}
            />
            <Text style={[styles.emptyText]}>No Reminders yet.</Text>
        </View >
    )
}

const ReminderScreen = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const [isSent, setIsSent] = useState(true);
    const [isReceived, setIsReceived] = useState(true);

    const { sentReminders = [], receivedReminders = [], loading, error } = useSelector(state => state.reminder);

    useEffect(() => {
        dispatch(fetchReminders());
    }, [dispatch]);

    console.log("Received Reminders:", receivedReminders);
    console.log("Sent Reminders:", sentReminders);

    if (loading) return <ActivityIndicator size="large" />;
    if (error) return <Text>Error: {error}</Text>;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <HeaderComponent title="Reminders" />

            <View style={styles.reminders}>
                {/* Received Reminders Section */}
                <TouchableOpacity
                    onPress={() => setIsReceived(prev => !prev)}
                    style={[styles.section, { backgroundColor: theme.colors.secondaryContainer }]}
                >
                    <Text style={[styles.sectionText, { color: theme.colors.primary }]}>
                        Received Reminders ({receivedReminders.length})
                    </Text>
                    <IconButton
                        icon={isReceived ? "unfold-less-horizontal" : "unfold-more-horizontal"}
                        iconColor={theme.colors.primary}
                    />
                </TouchableOpacity>

                {isReceived && (
                    <FlatList
                        data={receivedReminders}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <ReminderComponent reminder={item} />}
                        ListEmptyComponent={<EmptyComponent />}
                    />
                )}

                {/* Sent Reminders Section */}
                <TouchableOpacity
                    onPress={() => setIsSent(prev => !prev)}
                    style={[styles.section, { backgroundColor: theme.colors.secondaryContainer }]}
                >
                    <Text style={[styles.sectionText, { color: theme.colors.primary }]}>
                        Sent Reminders ({sentReminders.length})
                    </Text>
                    <IconButton
                        icon={isSent ? "unfold-less-horizontal" : "unfold-more-horizontal"}
                        iconColor={theme.colors.primary}
                    />
                </TouchableOpacity>

                {isSent && (
                    <FlatList
                        data={sentReminders}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <ReminderComponent reminder={item} />}
                        ListEmptyComponent={<EmptyComponent />}
                    />
                )}
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
