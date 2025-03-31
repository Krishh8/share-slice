import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import firestore, { Timestamp } from "@react-native-firebase/firestore";
import { revertOldBalances, updateBalancesOnExpenseCreate } from "./balancesSlice";

// 🔹 Fetch all expenses where the user is involved
export const fetchExpenses = createAsyncThunk(
    "expense/fetchExpenses",
    async (uid, thunkAPI) => {
        try {
            // 🔹 Step 1: Get the user's groups from the users collection
            const userDoc = await firestore().collection("users").doc(uid).get();
            if (!userDoc.exists) throw new Error("User not found");

            const userGroups = userDoc.data()?.groups || [];
            if (userGroups.length === 0) return { expenses: [], groupExpenses: {} };

            if (userGroups.length === 0) {
                return []; // No groups, so no expenses
            }

            let allExpenses = [];
            let groupedExpenses = {}; // 🔹 Organize expenses by groupId

            // 🔹 Step 2: Fetch expenses in batches (Firestore allows max 10 `in` queries)
            const batchSize = 10;
            for (let i = 0; i < userGroups.length; i += batchSize) {
                const groupBatch = userGroups.slice(i, i + batchSize);
                const snapshot = await firestore()
                    .collection("expenses")
                    .where("groupId", "in", groupBatch)
                    .orderBy("createdAt", "desc")
                    .get();

                const expenses = snapshot.docs.map((doc) => {
                    const expenseData = {
                        expenseId: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt.toDate().toISOString(),
                        updatedAt: doc.data().updatedAt.toDate().toISOString(),
                    };

                    // 🔹 Organize expenses under their respective groupId
                    const groupId = expenseData.groupId;
                    if (!groupedExpenses[groupId]) groupedExpenses[groupId] = [];
                    groupedExpenses[groupId].push(expenseData);

                    return expenseData;
                });

                allExpenses = [...allExpenses, ...expenses];
            }

            return { expenses: allExpenses, groupExpenses: groupedExpenses };
        } catch (error) {
            console.log("Error fetching user expenses:", error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// 🔹 Create a new expense
export const createExpense = createAsyncThunk(
    "expense/createExpense",
    async ({ groupId, expenseData }, thunkAPI) => {
        const { dispatch } = thunkAPI;
        try {
            const expenseRef = await firestore().collection("expenses").add({
                ...expenseData,
                groupId, // Store reference to group
                createdAt: firestore.Timestamp.now(),
                updatedAt: firestore.Timestamp.now(),
            });

            const expenseId = expenseRef.id;

            // 🔹 Update 'groups' collection to reference the new expense
            await firestore().collection("groups").doc(groupId).update({
                expenses: firestore.FieldValue.arrayUnion(expenseId),
            });

            await dispatch(updateBalancesOnExpenseCreate({ expenseData, groupId }));

            const expenseSnapshot = await expenseRef.get();
            const expenseDataFetched = expenseSnapshot.data();

            console.log("Expense added successfully");

            return {
                expenseId,
                groupId,
                ...expenseDataFetched,
                createdAt: firestore.Timestamp.now().toDate().toISOString(),
                updatedAt: firestore.Timestamp.now().toDate().toISOString(),
            };
        } catch (error) {
            console.log("Error creating expense:", error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateExpense = createAsyncThunk(
    "expense/updateExpense",
    async ({ expenseId, updatedExpenseData }, thunkAPI) => {
        const { dispatch } = thunkAPI;
        try {
            const expenseRef = firestore().collection("expenses").doc(expenseId);
            const expenseSnapshot = await expenseRef.get();

            if (!expenseSnapshot.exists) {
                throw new Error("Expense not found");
            }

            const oldExpenseData = expenseSnapshot.data();

            const balanceAffectingFields = ["amount", "paidBy", "splitDetails"];
            const isBalanceAffected = balanceAffectingFields.some(
                field => updatedExpenseData[field] !== oldExpenseData[field]
            );

            if (isBalanceAffected) {
                // Only revert old balances if amount, paidBy, or splitAmong changed
                await dispatch(revertOldBalances({ oldExpenseData }));
            }
            // 🔹 Update the expense document
            await expenseRef.update({
                ...updatedExpenseData,
                updatedAt: firestore.Timestamp.now(),
            });

            if (isBalanceAffected) {
                // Only update balances if necessary
                await dispatch(
                    updateBalancesOnExpenseCreate({
                        expenseData: updatedExpenseData,
                        groupId: oldExpenseData.groupId,
                    })
                );
            }

            console.log("Expense updated successfully");

            return {
                expenseId,
                ...updatedExpenseData,
                updatedAt: firestore.Timestamp.now().toDate().toISOString(),
            };
        } catch (error) {
            console.log("Error updating expense:", error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// 🔹 Fetch details of a single expense
export const fetchExpenseDetails = createAsyncThunk(
    "expense/fetchExpenseDetails",
    async (expenseId, thunkAPI) => {
        try {
            // Fetch Expense Document
            const expenseDoc = await firestore().collection("expenses").doc(expenseId).get();
            if (!expenseDoc.exists) throw new Error("Expense not found");

            const expenseData = expenseDoc.data();
            const { createdBy, paidBy, splitDetails } = expenseData;
            // Collect all unique user IDs (createdBy, paidBy, participants)
            const userIds = new Set([createdBy, ...paidBy.map(p => p.uid), ...splitDetails.map(p => p.uid)]);

            // 🔹 Batch Fetch Users from Firestore
            const userDocs = await firestore()
                .collection("users")
                .where("uid", "in", Array.from(userIds))
                .get();

            // Create a user data map { userId -> { fullName, upiId } }
            const usersMap = {};
            userDocs.forEach(doc => {
                usersMap[doc.id] = { ...doc.data() };
            });

            const updatedSplitDetails = splitDetails.map(p => ({
                ...p,
                fullName: usersMap[p.uid]?.fullName || "Unknown",
                avatar: usersMap[p.uid]?.avatar || 0
            }));

            const updatedPaidBy = paidBy.map(payer => ({
                ...payer,
                fullName: usersMap[payer.uid]?.fullName || "Unknown",
                avatar: usersMap[payer.uid]?.avatar || 0
                // upiId: usersMap[payer.userId]?.upiId || "N/A",
            }))

            return {
                expenseId: expenseDoc.id,
                ...expenseData,
                createdAt: expenseData.createdAt.toDate().toISOString(),
                updatedAt: expenseData.updatedAt.toDate().toISOString(),

                createdByDetails: {
                    fullName: usersMap[createdBy]?.fullName || "Unknown",
                    avatar: usersMap[createdBy]?.avatar || 0
                },
                splitDetails: updatedSplitDetails,
                paidBy: updatedPaidBy
            };
        } catch (error) {
            console.error("Error fetching expense details:", error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// 🔹 Expenses Slice
const expensesSlice = createSlice({
    name: "expense",
    initialState: {

        // 🔹 All expenses for the user
        expenses: [],
        expensesLoading: false,
        expensesError: null,
        // 🔹 Group-specific expenses
        groupExpenses: {},
        // 🔹 Expense details (for viewing a single expense)
        expenseDetails: null,
        expenseDetailsLoading: false,
        expenseDetailsError: null,
    },
    extraReducers: (builder) => {
        builder
            // 🔹 Fetch all expenses for a user
            .addCase(fetchExpenses.pending, (state) => {
                state.expensesLoading = true;
                state.expensesError = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.expensesLoading = false;
                state.expenses = action.payload.expenses;
                state.groupExpenses = action.payload.groupExpenses;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.expensesLoading = false;
                state.expensesError = action.payload;
            })

            // 🔹 Create a new expense
            .addCase(createExpense.pending, (state) => {
                state.expensesLoading = true;
                state.expensesError = null;
            })
            .addCase(createExpense.fulfilled, (state, action) => {
                state.expensesLoading = false;
                const { groupId, expenseId, createdAt, updatedAt, ...expenseData } = action.payload;

                const newExpense = { expenseId, groupId, ...expenseData, createdAt: new Date(createdAt), updatedAt: new Date(updatedAt) };

                // Add to general expenses
                state.expenses = [newExpense, ...state.expenses];

                state.groupExpenses = {
                    ...state.groupExpenses,
                    [groupId]: [newExpense, ...(state.groupExpenses[groupId] || [])],
                };
            })
            .addCase(createExpense.rejected, (state, action) => {
                state.expensesLoading = false;
                state.expensesError = action.payload;
            })

            .addCase(updateExpense.pending, (state) => {
                state.expensesLoading = true;
                state.expensesError = null;
            })
            .addCase(updateExpense.fulfilled, (state, action) => {
                state.expensesLoading = false;
                const { expenseId, groupId, updatedAt, ...updatedExpenseData } = action.payload;

                // 🔹 Update the expense in the state
                state.expenses = state.expenses.map((expense) =>
                    expense.expenseId === expenseId ? { ...expense, ...updatedExpenseData, updatedAt: new Date(updatedAt) } : expense
                );

                if (state.groupExpenses[groupId]) {
                    state.groupExpenses[groupId] = state.groupExpenses[groupId].map((expense) =>
                        expense.expenseId === expenseId ? { ...expense, ...updatedExpenseData, updatedAt: new Date(updatedAt) } : expense
                    );
                }

                // if (state.expenseDetails && state.expenseDetails.expenseId === expenseId) {
                //     state.expenseDetails = {
                //         ...state.expenseDetails,  // Keep existing details
                //         ...updatedExpenseData,   // Apply updates
                //         updatedAt: new Date(updatedAt)
                //     };
                // }

                state.expenseDetails = null;

            })
            .addCase(updateExpense.rejected, (state, action) => {
                state.expensesLoading = false;
                state.expensesError = action.payload;
            })

            // 🔹 Fetch details of a single expense
            .addCase(fetchExpenseDetails.pending, (state) => {
                state.expenseDetailsLoading = true;
                state.expenseDetailsError = null;
            })
            .addCase(fetchExpenseDetails.fulfilled, (state, action) => {
                state.expenseDetailsLoading = false;
                state.expenseDetails = action.payload;
            })
            .addCase(fetchExpenseDetails.rejected, (state, action) => {
                state.expenseDetailsLoading = false;
                state.expenseDetailsError = action.payload;
            });
    },
});

// export const {setExpenses} = expensesSlice.reducer
export default expensesSlice.reducer;
