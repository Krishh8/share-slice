import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import notifee, { AndroidImportance } from '@notifee/react-native';
import auth from '@react-native-firebase/auth';

export const sendReminder = createAsyncThunk(
    'reminders/sendReminder',
    async ({ creditor, amountOwed, debtor }, { rejectWithValue }) => {
        try {
            const reminderRef = await firestore().collection('reminders').add({
                debtorId: debtor.uid,
                creditorId: creditor.uid,
                debtorName: debtor.fullName,
                creditorName: creditor.fullName,
                amountOwed,
                createdAt: firestore.FieldValue.serverTimestamp(),
                seen: false,
            });

            return {
                id: reminderRef.id, // Include ID for Redux
                debtorId: debtor.uid,
                creditorId: creditor.uid,
                debtorName: debtor.fullName,
                creditorName: creditor.fullName,
                amountOwed,
                seen: false,
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const checkReminders = createAsyncThunk(
    'reminders/checkReminders',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const userId = auth().currentUser?.uid;
            if (!userId) return;

            const remindersSnapshot = await firestore()
                .collection('reminders')
                .where('debtorId', '==', userId)
                .where('seen', '==', false)
                .get();

            const unseenReminders = [];

            for (const doc of remindersSnapshot.docs) {
                const { creditorId, amount, creditorName } = doc.data();

                // Show Notifee notification
                await notifee.requestPermission();
                await notifee.createChannel({
                    id: 'reminders',
                    name: 'Payment Reminders',
                    importance: AndroidImportance.HIGH,
                });

                await notifee.displayNotification({
                    title: 'Payment Reminder',
                    body: `${creditorName} is reminding you to pay ₹${amount}.`,
                    android: {
                        channelId: 'reminders',
                        importance: AndroidImportance.HIGH,
                    },
                });

                // Mark reminder as seen
                await firestore().collection('reminders').doc(doc.id).update({ seen: true });

                unseenReminders.push({ creditorName, amount });
            }

            return unseenReminders;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchReminders = createAsyncThunk(
    'reminders/fetchReminders',
    async (_, { rejectWithValue }) => {
        try {
            const userId = auth().currentUser?.uid;
            console.log(userId)
            if (!userId) return rejectWithValue("User not logged in");

            const sentRemindersSnapshot = await firestore()
                .collection('reminders')
                .where('creditorId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            const receivedRemindersSnapshot = await firestore()
                .collection('reminders')
                .where('debtorId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            const sentReminders = sentRemindersSnapshot.empty
                ? []
                : sentRemindersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

            const receivedReminders = receivedRemindersSnapshot.empty
                ? []
                : receivedRemindersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

            return { sentReminders, receivedReminders };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// Slice for managing reminders
const reminderSlice = createSlice({
    name: 'reminder',
    initialState: {
        sentReminders: [],
        receivedReminders: [],
        reminders: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendReminder.pending, (state) => {
                state.loading = true;
            })
            .addCase(sendReminder.fulfilled, (state) => {
                state.loading = false;
                state.reminders = [action.payload, ...state.reminders];
            })
            .addCase(sendReminder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchReminders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchReminders.fulfilled, (state, action) => {
                state.sentReminders = action.payload.sentReminders;
                state.receivedReminders = action.payload.receivedReminders;
                state.loading = false;
            })
            .addCase(fetchReminders.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })
    },
});

export const { setReminders, markAsRead, markAllRead, } = reminderSlice.actions;
export default reminderSlice.reducer;
