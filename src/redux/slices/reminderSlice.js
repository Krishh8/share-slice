import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import notifee, { AndroidImportance } from '@notifee/react-native';
import auth from '@react-native-firebase/auth';

// Thunk to send a debt reminder notification
// export const sendDebtorReminder = createAsyncThunk(
//     'debt/sendReminder',
//     async (creditor, debtor, amountOwed, { rejectWithValue }) => {
//         try {
//             // Fetch creditor name
//             // const creditorDoc = await firestore().collection('users').doc(debt.creditorId).get();
//             // const creditorData = creditorDoc.data();

//             // if (!creditorData) {
//             //     return rejectWithValue('Creditor data not found');
//             // }

//             // Create a notification channel
//             const channelId = await notifee.createChannel({
//                 id: 'debt_reminders',
//                 name: 'Debt Reminders',
//                 importance: AndroidImportance.HIGH,
//             });

//             // Display notification
//             await notifee.displayNotification({
//                 title: '💸 Debt Reminder',
//                 body: `${creditor.fullName} is reminding you about a debt of $${amountOwed}`,
//                 android: {
//                     channelId,
//                     importance: AndroidImportance.HIGH,
//                     pressAction: { id: 'view_debt' },
//                 },
//             });

//             // Update Firestore debt status
//             await firestore().collection('debtReminders').doc(debt.id).update({
//                 status: 'reminded',
//                 reminderCount: (debt.reminderCount || 0) + 1,
//                 lastReminderAt: firestore.FieldValue.serverTimestamp(),
//             });

//             return debt.id;
//         } catch (error) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

// export const markAllNotificationsRead = createAsyncThunk(
//     "reminders/markAllRead",
//     async (userId, { rejectWithValue }) => {
//         try {
//             const notificationsRef = firestore()
//                 .collection("reminders")
//                 .where("debtorId", "==", userId) // Get reminders for the user
//                 .where("status", "==", "unread");

//             const snapshot = await notificationsRef.get();

//             const batch = firestore().batch();

//             snapshot.forEach((doc) => {
//                 batch.update(doc.ref, { status: "read" });
//             });

//             await batch.commit();

//             return userId; // Return userId to update Redux store
//         } catch (error) {
//             console.error("Error marking reminders as read:", error);
//             return rejectWithValue(error.message);
//         }
//     }
// );

export const sendReminder = createAsyncThunk(
    'reminders/sendReminder',
    async ({ creditorId, amountOwed, debtorId }, { rejectWithValue }) => {
        try {
            const reminderRef = await firestore().collection('reminders').add({
                debtorId,
                creditorId,
                amountOwed,
                createdAt: firestore.FieldValue.serverTimestamp(),
                seen: false,
            });

            return {
                id: reminderRef.id, // Include ID for Redux
                debtorId,
                creditorId,
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
                const { creditorId, amount } = doc.data();

                // Fetch creditor's name
                const creditorSnapshot = await firestore().collection('users').doc(creditorId).get();
                const creditorName = creditorSnapshot.exists ? creditorSnapshot.data().fullName : "Someone";

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

            const sentReminders = sentRemindersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            const receivedReminders = receivedRemindersSnapshot.docs.map(doc => ({
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

        // .addCase(markAllNotificationsRead.pending, (state) => {
        //     state.loading = true;
        // })
        // .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        //     state.loading = false;
        //     state.reminders = state.reminders.map((notification) =>
        //         notification.debtorId === action.payload ? { ...notification, status: "read" } : notification
        //     );
        // })
        // .addCase(markAllNotificationsRead.rejected, (state, action) => {
        //     state.loading = false;
        //     state.error = action.payload;
        // });
    },
});

export const { setReminders, markAsRead, markAllRead, } = reminderSlice.actions;
export default reminderSlice.reducer;
