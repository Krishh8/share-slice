// Purpose: Tracks who owes whom and how much.
// Handles: Balance updates when expenses are created, edited, or payments are made.

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import firestore from "@react-native-firebase/firestore";

// export const fetchBalances = createAsyncThunk(
//     "balance/fetchBalances",
//     async ({ uid, groupId }, thunkAPI) => {
//         try {
//             console.log(uid, groupId)
//             const balancesRef = firestore()
//                 .collection("balances")
//                 .where("groupId", "==", groupId)
//                 .where("amountOwed", ">", 0);

//             const snapshot = await balancesRef.get();
//             console.log("Fetched balances count:", snapshot.size);
//             console.log("Snapshot docs:", snapshot.docs.map(doc => doc.data()));

//             let userBalances = [];
//             let userIds = new Set();

//             // Collect all involved user IDs (payer & payee)
//             snapshot.forEach((doc) => {
//                 const balance = { balanceId: doc.id, ...doc.data() };
//                 if (balance.creditorId === uid || balance.debtorId === uid) {
//                     userBalances.push(balance);
//                     userIds.add(balance.creditorId);
//                     userIds.add(balance.debtorId);
//                 }
//             });

//             console.log("User balances after filtering:", userBalances);

//             if (userBalances.length === 0) return [];

//             // Fetch user details for involved users
//             const usersRef = firestore()
//                 .collection("users")
//                 .where(firestore.FieldPath.documentId(), "in", Array.from(userIds));

//             const usersSnapshot = await usersRef.get();
//             let userMap = {};

//             usersSnapshot.forEach((doc) => {
//                 userMap[doc.id] = doc.data(); // Store user data mapped by uid
//             });

//             // Map user details to balances
//             const balancesWithUserDetails = userBalances.map((balance) => ({
//                 ...balance,
//                 creditor: {
//                     uid: userMap[balance.creditorId]?.uid || "",
//                     fullName: userMap[balance.creditorId]?.fullName || "Unknown",
//                     avatar: userMap[balance.creditorId]?.avatar || "",
//                     upiId: userMap[balance.creditorId]?.upiId || "",
//                     phoneNumber: userMap[balance.creditorId]?.phoneNumber || "",
//                     email: userMap[balance.creditorId]?.email || "",
//                 },
//                 debtor: {
//                     uid: userMap[balance.debtorId]?.uid || "",
//                     fullName: userMap[balance.debtorId]?.fullName || "Unknown",
//                     avatar: userMap[balance.debtorId]?.avatar || "",
//                     upiId: userMap[balance.debtorId]?.upiId || "",
//                     phoneNumber: userMap[balance.debtorId]?.phoneNumber || "",
//                     email: userMap[balance.debtorId]?.email || "",
//                 },
//             }));

//             console.log(balancesWithUserDetails)

//             return balancesWithUserDetails;
//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );

// export const updateBalancesOnExpenseCreate = createAsyncThunk(
//     "balance/updateBalancesOnExpenseCreate",
//     async ({ expenseData, groupId }, thunkAPI) => {
//         try {
//             const batch = firestore().batch();
//             const balancesRef = firestore().collection("balances");

//             const { paidBy, splitDetails } = expenseData;
//             console.log("Updating balances for:", paidBy, splitDetails);
//             let payerMap = {};

//             // 🔹 Step 1: Map payer amounts
//             paidBy.forEach(({ uid, amount }) => {
//                 payerMap[uid] = amount;
//             });

//             console.log("Payer Map:", payerMap);
//             console.log("Split Details:", splitDetails);

//             // 🔹 Step 2: Iterate through splitDetails & update balances
//             splitDetails.forEach(({ uid: debtorId, share }) => {
//                 Object.keys(payerMap).forEach(creditorId => {
//                     if (creditorId !== debtorId) {
//                         const balanceId = `${creditorId}_${debtorId}_${groupId}`;

//                         console.log("Balance Doc ID:", balanceId);
//                         if (!creditorId || !debtorId || !groupId) {
//                             throw new Error("Invalid balance document ID");
//                         }

//                         console.log("Share:", share);
//                         console.log("Payer's contribution:", payerMap[creditorId]);
//                         console.log("Total Expense Amount:", expenseData.amount);

//                         if (share === undefined || payerMap[creditorId] === undefined || expenseData.amount === undefined) {
//                             throw new Error("Invalid balance calculation: missing values");
//                         }


//                         const balanceRef = balancesRef.doc(balanceId);

//                         const amountOwed = parseFloat((share * (payerMap[creditorId] / expenseData.amount)).toFixed(2));
//                         if (!isFinite(amountOwed)) {
//                             throw new Error(`Invalid balance update: ${amountOwed}`);
//                         }

//                         batch.set(
//                             balanceRef,
//                             {
//                                 creditorId,
//                                 debtorId,
//                                 groupId,
//                                 amountOwed: firestore.FieldValue.increment(amountOwed),
//                                 updatedAt: firestore.Timestamp.now(),
//                             },
//                             { merge: true } // 🔹 Merge existing balances
//                         );
//                     }
//                 });
//             });

//             console.log("Committing batch update...");
//             await batch.commit();
//             console.log("Batch update committed successfully.");

//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );
// ✅ Revert Old Balances when Expense is Updated

export const updateBalancesOnExpenseCreate = createAsyncThunk(
    "balance/updateBalancesOnExpenseCreate",
    async ({ expenseData, groupId }, thunkAPI) => {
        try {
            const batch = firestore().batch();
            const balancesRef = firestore().collection("balances");

            const { paidBy, splitDetails } = expenseData;
            console.log("Updating balances for:", paidBy, splitDetails);
            let payerMap = {};

            // 🔹 Step 1: Map payer amounts
            paidBy.forEach(({ uid, amount }) => {
                payerMap[uid] = amount;
            });

            console.log("Payer Map:", payerMap);
            console.log("Split Details:", splitDetails);

            // 🔹 Step 2: Iterate through splitDetails & update balances
            for (const { uid: debtorId, share } of splitDetails) {
                for (const creditorId of Object.keys(payerMap)) {
                    if (creditorId !== debtorId) {
                        const balanceId = `${creditorId}_${debtorId}_${groupId}`;
                        const reverseBalanceId = `${debtorId}_${creditorId}_${groupId}`;

                        const balanceRef = balancesRef.doc(balanceId);
                        const reverseBalanceRef = balancesRef.doc(reverseBalanceId);

                        console.log("Checking balance docs:", balanceId, reverseBalanceId);

                        if (!creditorId || !debtorId || !groupId) {
                            throw new Error("Invalid balance document ID");
                        }

                        const amountOwed = parseFloat(
                            (share * (payerMap[creditorId] / expenseData.amount)).toFixed(2)
                        );

                        if (!isFinite(amountOwed)) {
                            throw new Error(`Invalid balance update: ${amountOwed}`);
                        }

                        const balanceDoc = await balanceRef.get();
                        const reverseBalanceDoc = await reverseBalanceRef.get();

                        if (reverseBalanceDoc.exists) {
                            // 🔹 Case 1: A reverse balance exists (debtor owes creditor)
                            const existingReverseAmount = reverseBalanceDoc.data()?.amountOwed || 0;
                            const netAmount = existingReverseAmount - amountOwed;

                            console.log(`Reverse balance found: ${existingReverseAmount}, Net Amount: ${netAmount}`);

                            if (netAmount > 0) {
                                // Debtor still owes some amount → Update reverse balance
                                batch.update(reverseBalanceRef, {
                                    amountOwed: netAmount,
                                    updatedAt: firestore.Timestamp.now()
                                });
                            } else if (netAmount < 0) {
                                // Creditor now owes debtor → Swap & create new balance
                                batch.set(balanceRef, {
                                    creditorId,
                                    debtorId,
                                    groupId,
                                    amountOwed: Math.abs(netAmount),
                                    updatedAt: firestore.Timestamp.now(),
                                });
                                batch.delete(reverseBalanceRef); // Remove reverse balance
                            } else {
                                // Full settlement → Delete reverse balance document
                                batch.delete(reverseBalanceRef);
                            }
                        } else if (balanceDoc.exists) {
                            // 🔹 Case 2: Update existing balance if it exists
                            const existingAmount = balanceDoc.data()?.amountOwed || 0;
                            const updatedAmount = existingAmount + amountOwed;

                            console.log(`Existing balance found: ${existingAmount}, Updated Amount: ${updatedAmount}`);

                            if (updatedAmount === 0) {
                                batch.delete(balanceRef); // Remove document if balance is settled
                            } else {
                                batch.update(balanceRef, {
                                    amountOwed: updatedAmount,
                                    updatedAt: firestore.Timestamp.now()
                                });
                            }
                        } else {
                            // 🔹 Case 3: No existing balance → Create a new balance entry
                            batch.set(balanceRef, {
                                creditorId,
                                debtorId,
                                groupId,
                                amountOwed,
                                updatedAt: firestore.Timestamp.now(),
                            });
                        }
                    }
                }
            }

            console.log("Committing batch update...");
            await batch.commit();
            console.log("Batch update committed successfully.");

        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const revertOldBalances = createAsyncThunk(
    "balance/revertOldBalances",
    async ({ oldExpenseData }, thunkAPI) => {
        try {
            const batch = firestore().batch();
            const balancesRef = firestore().collection("balances");

            const { paidBy, splitDetails, groupId } = oldExpenseData;

            let payerMap = {};
            paidBy.forEach(({ uid, amount }) => {
                payerMap[uid] = amount;
            });

            splitDetails.forEach(({ uid: debtorId, share }) => {
                Object.keys(payerMap).forEach(creditorId => {
                    if (debtorId !== creditorId) {
                        const balanceId = `${creditorId}_${debtorId}_${groupId}`;
                        console.log("Balance Doc ID:", balanceId);
                        if (!creditorId || !debtorId || !groupId) {
                            throw new Error("Invalid balance document ID");
                        }

                        const balanceDoc = balancesRef.doc(`${creditorId}_${debtorId}_${groupId}`);

                        console.log("Share:", share);
                        console.log("Payer's contribution:", payerMap[creditorId]);
                        console.log("Total Expense Amount:", oldExpenseData.amount);

                        if (share === undefined || payerMap[creditorId] === undefined || oldExpenseData.amount === undefined) {
                            throw new Error("Invalid balance calculation: missing values");
                        }

                        const amountOwed = parseFloat((share * (payerMap[creditorId] / oldExpenseData.amount)).toFixed(2));
                        if (!isFinite(amountOwed)) {
                            throw new Error(`Invalid balance update: ${amountOwed}`);
                        }

                        batch.update(balanceDoc, {
                            amountOwed: firestore.FieldValue.increment(-1 * amountOwed),
                            updatedAt: firestore.Timestamp.now(),
                        });

                    }
                });
            });

            await batch.commit();
            console.log("Old balances reverted successfully.");
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const balancesSlice = createSlice({
    name: 'balance',
    initialState: {
        balances: [],
        loading: false,
        error: null,
        unsubscribe: null, // 🔹 Store the listener for cleanup
    },
    reducers: {
        setBalances: (state, action) => {
            state.balances = action.payload;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setUnsubscribe: (state, action) => {
            state.unsubscribe = action.payload;
        },
        clearBalances: (state) => {
            state.balances = [];
            state.unsubscribe?.(); // 🔹 Stop the listener when user leaves
            state.unsubscribe = null;
        },
    },
    // extraReducers: (builder) => {
    //     builder
    //         .addCase(fetchBalances.pending, (state) => {
    //             state.loading = true;
    //         })
    //         .addCase(fetchBalances.fulfilled, (state, action) => {
    //             console.log("Balances fetched:", action.payload);
    //             state.balances = action.payload;
    //             state.loading = false;
    //         })
    //         .addCase(fetchBalances.rejected, (state, action) => {
    //             state.error = action.payload;
    //             state.loading = false;
    //         })

    //         .addCase(updateBalancesOnExpenseCreate.pending, (state) => {
    //             state.loading = true;
    //         })
    //         .addCase(updateBalancesOnExpenseCreate.fulfilled, (state, action) => {
    //             state.loading = false;
    //             console.log("Balances updated successfully in Redux:", action.payload);
    //         })
    //         .addCase(updateBalancesOnExpenseCreate.rejected, (state, action) => {
    //             state.loading = false;
    //             state.error = action.payload;
    //             console.error("Failed to update balances:", action.payload);
    //         });
    // }
})

export const { setBalances, setLoading, setError, setUnsubscribe, clearBalances } = balancesSlice.actions;
export default balancesSlice.reducer