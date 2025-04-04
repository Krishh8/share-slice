import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const fetchTransactions = createAsyncThunk(
    'transactions/fetchTransactions',
    async (_, { rejectWithValue }) => {
        try {
            const userId = auth().currentUser?.uid;
            if (!userId) return rejectWithValue("User not logged in");

            // 🔍 One-time fetch for transactions where user is involved
            const snapshot = await firestore()
                .collection('transactions')
                .where('participants', 'array-contains', userId)
                .orderBy('timestamp', "desc")
                .get();

            let transactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // 🔥 Collect user IDs
            const userIds = new Set();
            transactions.forEach(({ creditorId, debtorId }) => {
                userIds.add(creditorId);
                userIds.add(debtorId);
            });

            // 🔄 Fetch user details
            const userDocs = await firestore()
                .collection('users')
                .where(firestore.FieldPath.documentId(), 'in', Array.from(userIds))
                .get();

            const userMap = userDocs.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data().fullName;
                return acc;
            }, {});

            // 💬 Attach names to each transaction
            transactions = transactions.map(transaction => ({
                ...transaction,
                creditorName: userMap[transaction.creditorId] || 'Unknown',
                debtorName: userMap[transaction.debtorId] || 'Unknown',
            }));

            // 🗂️ Group transactions by `groupId`
            const groupedTransactions = transactions.reduce((acc, transaction) => {
                const { groupIds } = transaction;
                if (Array.isArray(groupIds)) {
                    groupIds.forEach(groupId => {
                        if (!acc[groupId]) acc[groupId] = [];
                        acc[groupId].push(transaction);
                    });
                }
                return acc;
            }, {});


            return groupedTransactions;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const deleteTransaction = createAsyncThunk(
    'transactions/deleteTransaction',
    async (transactionId, { rejectWithValue }) => {
        try {
            // 🗑️ Delete the transaction from Firestore
            await firestore().collection('transactions').doc(transactionId).delete();
            return transactionId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Reducer
const transactionSlice = createSlice({
    name: 'transaction',
    initialState: {
        transactions: {},
        loading: false,
        error: null,
    },
    reducers: {
        updateTransactions: (state, action) => {
            // If empty object, show loading indicator
            if (Object.keys(action.payload).length === 0) {
                state.loading = true;
            } else {
                state.transactions = action.payload;
                state.loading = false;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.transactions = action.payload;
                state.loading = false;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })

            .addCase(deleteTransaction.fulfilled, (state, action) => {
                const transactionId = action.payload;
                Object.keys(state.transactions).forEach(groupId => {
                    state.transactions[groupId] = state.transactions[groupId].filter(
                        transaction => transaction.id !== transactionId
                    );
                });
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { updateTransactions, removeTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
