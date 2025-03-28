import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import notifee, { AndroidImportance } from '@notifee/react-native';

// Thunk to send a debt reminder notification
export const sendDebtorReminder = createAsyncThunk(
    'debt/sendReminder',
    async (creditor, debtor, amountOwed, { rejectWithValue }) => {
        try {
            // Fetch creditor name
            // const creditorDoc = await firestore().collection('users').doc(debt.creditorId).get();
            // const creditorData = creditorDoc.data();

            // if (!creditorData) {
            //     return rejectWithValue('Creditor data not found');
            // }

            // Create a notification channel
            const channelId = await notifee.createChannel({
                id: 'debt_reminders',
                name: 'Debt Reminders',
                importance: AndroidImportance.HIGH,
            });

            // Display notification
            await notifee.displayNotification({
                title: '💸 Debt Reminder',
                body: `${creditor.fullName} is reminding you about a debt of $${amountOwed}`,
                android: {
                    channelId,
                    importance: AndroidImportance.HIGH,
                    pressAction: { id: 'view_debt' },
                },
            });

            // Update Firestore debt status
            await firestore().collection('debtReminders').doc(debt.id).update({
                status: 'reminded',
                reminderCount: (debt.reminderCount || 0) + 1,
                lastReminderAt: firestore.FieldValue.serverTimestamp(),
            });

            return debt.id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    "reminders/markAllRead",
    async (userId, { rejectWithValue }) => {
        try {
            const notificationsRef = firestore()
                .collection("reminders")
                .where("debtorId", "==", userId) // Get reminders for the user
                .where("status", "==", "unread");

            const snapshot = await notificationsRef.get();

            const batch = firestore().batch();

            snapshot.forEach((doc) => {
                batch.update(doc.ref, { status: "read" });
            });

            await batch.commit();

            return userId; // Return userId to update Redux store
        } catch (error) {
            console.error("Error marking reminders as read:", error);
            return rejectWithValue(error.message);
        }
    }
);


// Slice for managing reminders
const reminderSlice = createSlice({
    name: 'reminder',
    initialState: {
        reminders: [],
        loading: false,
        error: null,
    },
    reducers: {
        setReminders(state, action) {
            state.reminders = action.payload;
        },

        markAsRead: (state, action) => {
            state.reminders = state.reminders.map((notification) =>
                notification.id === action.payload ? { ...notification, status: "read" } : notification
            );
        },

        markAllRead: (state) => {
            state.reminders = state.reminders.map((notification) => ({
                ...notification,
                status: "read",
            }));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendDebtorReminder.pending, (state) => {
                state.loading = true;
            })
            .addCase(sendDebtorReminder.fulfilled, (state) => {
                state.loading = false;
                state.reminders.push(action.payload);
            })
            .addCase(sendDebtorReminder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(markAllNotificationsRead.pending, (state) => {
                state.loading = true;
            })
            .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
                state.loading = false;
                state.reminders = state.reminders.map((notification) =>
                    notification.debtorId === action.payload ? { ...notification, status: "read" } : notification
                );
            })
            .addCase(markAllNotificationsRead.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setReminders, markAsRead, markAllRead, } = debtSlice.actions;
export default reminder.reducer;
