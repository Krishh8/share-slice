import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import notifee, { AndroidImportance } from '@notifee/react-native';
import auth from '@react-native-firebase/auth';

// export const sendReminder = createAsyncThunk(
//     'reminders/sendReminder',
//     async ({ creditor, amountOwed, debtor }, thunkAPI) => {
//         try {
//             const reminderRef = await firestore().collection('reminders').add({
//                 debtorId: debtor.uid,
//                 creditorId: creditor.uid,
//                 debtorName: debtor.fullName,
//                 creditorName: creditor.fullName,
//                 amountOwed,
//                 createdAt: firestore.Timestamp.now(),
//                 seen: false,
//             });

//             console.log(reminderRef)

//             return {
//                 id: reminderRef.id, // Include ID for Redux
//                 debtorId: debtor.uid,
//                 creditorId: creditor.uid,
//                 debtorName: debtor.fullName,
//                 creditorName: creditor.fullName,
//                 amountOwed,
//                 seen: false,
//             };
//         } catch (error) {
//             console.log(error.message)
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );

// export const checkReminders = createAsyncThunk(
//     'reminders/checkReminders',
//     async (_, { dispatch, rejectWithValue }) => {
//         try {
//             const userId = auth().currentUser?.uid;
//             if (!userId) return;

//             const remindersSnapshot = await firestore()
//                 .collection('reminders')
//                 .where('debtorId', '==', userId)
//                 .where('seen', '==', false)
//                 .get();

//             const unseenReminders = [];

//             for (const doc of remindersSnapshot.docs) {
//                 const { creditorId, amount, creditorName } = doc.data();

//                 // Show Notifee notification
//                 await notifee.requestPermission();
//                 await notifee.createChannel({
//                     id: 'reminders',
//                     name: 'Payment Reminders',
//                     importance: AndroidImportance.HIGH,
//                 });

//                 await notifee.displayNotification({
//                     title: 'Payment Reminder',
//                     body: `${creditorName} is reminding you to pay ₹${amount}.`,
//                     android: {
//                         channelId: 'reminders',
//                         importance: AndroidImportance.HIGH,
//                     },
//                 });

//                 // Mark reminder as seen
//                 await firestore().collection('reminders').doc(doc.id).update({ seen: true });

//                 unseenReminders.push({ creditorName, amount });
//             }

//             return unseenReminders;
//         } catch (error) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

// export const fetchReminders = createAsyncThunk(
//     'reminders/fetchReminders',
//     async (_, { rejectWithValue }) => {
//         try {
//             const userId = auth().currentUser?.uid;
//             if (!userId) return rejectWithValue("User not logged in");

//             // 🔥 Run both queries concurrently
//             const [sentRemindersSnapshot, receivedRemindersSnapshot] = await Promise.all([
//                 firestore()
//                     .collection('reminders')
//                     .where('creditorId', '==', userId)
//                     .orderBy('createdAt', 'desc')
//                     .get(),
//                 firestore()
//                     .collection('reminders')
//                     .where('debtorId', '==', userId)
//                     .orderBy('createdAt', 'desc')
//                     .get()
//             ]);

//             // 🔄 Process both snapshots
//             const sentReminders = sentRemindersSnapshot.empty
//                 ? []
//                 : sentRemindersSnapshot.docs.map(doc => ({
//                     id: doc.id,
//                     ...doc.data(),
//                 }));

//             const receivedReminders = receivedRemindersSnapshot.empty
//                 ? []
//                 : receivedRemindersSnapshot.docs.map(doc => ({
//                     id: doc.id,
//                     ...doc.data(),
//                 }));

//             return { sentReminders, receivedReminders };
//         } catch (error) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

// Slice for managing reminders

export const sendReminder = createAsyncThunk(
    'reminders/sendReminder',
    async ({ creditor, amountOwed, debtor }, thunkAPI) => {
        try {
            const reminderRef = await firestore().collection('reminders').add({
                debtorId: debtor.uid,
                creditorId: creditor.uid,
                amountOwed,
                createdAt: firestore.Timestamp.now(),
                seen: false,
            });

            return {
                id: reminderRef.id,
                debtorId: debtor.uid,
                creditorId: creditor.uid,
                amountOwed,
                seen: false,
            };
        } catch (error) {
            console.log(error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


export const fetchReminders = createAsyncThunk(
    'reminders/fetchReminders',
    async (_, { rejectWithValue }) => {
        try {
            const userId = auth().currentUser?.uid;
            if (!userId) return rejectWithValue("User not logged in");

            // 🔥 Fetch sent and received reminders concurrently
            const [sentRemindersSnapshot, receivedRemindersSnapshot] = await Promise.all([
                firestore()
                    .collection('reminders')
                    .where('creditorId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get(),
                firestore()
                    .collection('reminders')
                    .where('debtorId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get(),
            ]);

            const allDocs = [...sentRemindersSnapshot.docs, ...receivedRemindersSnapshot.docs];

            // 🧠 Collect all unique user IDs (debtorId + creditorId) excluding current user
            const userIdSet = new Set();
            allDocs.forEach(doc => {
                const data = doc.data();
                if (data.creditorId && data.creditorId !== userId) userIdSet.add(data.creditorId);
                if (data.debtorId && data.debtorId !== userId) userIdSet.add(data.debtorId);
            });

            // ⚡️Batch fetch user names
            const userMap = {};
            const userIds = Array.from(userIdSet);
            const BATCH_LIMIT = 10;

            for (let i = 0; i < userIds.length; i += BATCH_LIMIT) {
                const batch = userIds.slice(i, i + BATCH_LIMIT);
                const batchSnapshot = await firestore()
                    .collection('users')
                    .where(firestore.FieldPath.documentId(), 'in', batch)
                    .get();

                batchSnapshot.docs.forEach(doc => {
                    userMap[doc.id] = doc.data().fullName || 'Unknown';
                });
            }

            // 📨 Process sentReminders
            const sentReminders = sentRemindersSnapshot.empty
                ? []
                : await Promise.all(
                    sentRemindersSnapshot.docs.map(async (doc) => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            debtorName: userMap[data.debtorId] || 'Unknown',
                        };
                    })
                );

            // 📥 Process receivedReminders
            const receivedReminders = receivedRemindersSnapshot.empty
                ? []
                : await Promise.all(
                    receivedRemindersSnapshot.docs.map(async (doc) => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            creditorName: userMap[data.creditorId] || 'Unknown',
                        };
                    })
                );

            return { sentReminders, receivedReminders };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const checkReminders = createAsyncThunk(
    'reminders/checkReminders',
    async (_, { rejectWithValue }) => {
        try {
            const userId = auth().currentUser?.uid;
            if (!userId) return;

            const remindersSnapshot = await firestore()
                .collection('reminders')
                .where('debtorId', '==', userId)
                .where('seen', '==', false)
                .get();

            if (remindersSnapshot.empty) return [];

            const unseenReminders = [];
            const creditorIdSet = new Set();

            for (const doc of remindersSnapshot.docs) {
                const { creditorId } = doc.data();
                creditorIdSet.add(creditorId);
            }

            // ⚡️Batch fetch all creditor user docs
            const creditorIds = Array.from(creditorIdSet);
            const batchedUserDocs = [];

            // Firestore 'in' clause supports max 10 ids per query
            const BATCH_LIMIT = 10;
            for (let i = 0; i < creditorIds.length; i += BATCH_LIMIT) {
                const batchIds = creditorIds.slice(i, i + BATCH_LIMIT);
                const batchSnapshot = await firestore()
                    .collection('users')
                    .where(fs.FieldPath.documentId(), 'in', batchIds)
                    .get();
                batchedUserDocs.push(...batchSnapshot.docs);
            }

            // Map of uid -> fullName
            const userMap = {};
            batchedUserDocs.forEach(doc => {
                userMap[doc.id] = doc.data().fullName || 'Someone';
            });

            await notifee.requestPermission();
            await notifee.createChannel({
                id: 'reminders',
                name: 'Payment Reminders',
                importance: AndroidImportance.HIGH,
            });

            for (const doc of remindersSnapshot.docs) {
                const { creditorId, amountOwed } = doc.data();
                const creditorName = userMap[creditorId] || 'Someone';

                await notifee.displayNotification({
                    title: 'Payment Reminder',
                    body: `${creditorName} is reminding you to pay ₹${amountOwed}.`,
                    android: {
                        channelId: 'reminders',
                        importance: AndroidImportance.HIGH,
                    },
                });

                await firestore().collection('reminders').doc(doc.id).update({ seen: true });

                unseenReminders.push({ creditorName, amountOwed });
            }

            return unseenReminders;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


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
            .addCase(sendReminder.fulfilled, (state, action) => {
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
