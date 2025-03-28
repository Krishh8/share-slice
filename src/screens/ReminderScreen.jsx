import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReminders } from '../redux/slices/reminderSlice';

const ReminderScreen = () => {
    const dispatch = useDispatch();
    const { sentReminders, receivedReminders, loading, error } = useSelector(state => state.reminder);

    useEffect(() => {
        dispatch(fetchReminders());
    }, [dispatch]);
    console.log(error)


    if (loading) return <ActivityIndicator size="large" />;
    if (error) return <Text>Error: {error}</Text>;

    return (
        <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Received Reminders</Text>
            {receivedReminders.length === 0 ? (
                <Text>No received reminders.</Text>
            ) : (
                <FlatList
                    data={receivedReminders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 10, borderBottomWidth: 1 }}>
                            <Text>From: {item.creditorId}</Text>
                            <Text>Amount: ₹{item.amount}</Text>
                        </View>
                    )}
                />
            )}

            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Sent Reminders</Text>
            {sentReminders.length === 0 ? (
                <Text>No sent reminders.</Text>
            ) : (
                <FlatList
                    data={sentReminders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 10, borderBottomWidth: 1 }}>
                            <Text>To: {item.debtorId}</Text>
                            <Text>Amount: ₹{item.amount}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default ReminderScreen;
