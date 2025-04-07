import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import firestore from "@react-native-firebase/firestore";

export const fetchBalances = createAsyncThunk(
    'balance/fetchBalances',
    async ({ uid }, { rejectWithValue }) => {
        try {
            let balancesRef = firestore().collection("balances").where("amountOwed", ">", 0);
            if (groupId) balancesRef = balancesRef.where("groupId", "==", groupId);

            const snapshot = await balancesRef.get();

            let userBalances = [];
            const userIds = new Set();

            snapshot.forEach(doc => {
                const balance = { balanceId: doc.id, ...doc.data() };
                if (balance.creditorId === uid || balance.debtorId === uid) {
                    userBalances.push(balance);
                    userIds.add(balance.creditorId);
                    userIds.add(balance.debtorId);
                }
            });

            if (userBalances.length === 0) return [];

            const usersSnapshot = await firestore()
                .collection("users")
                .where(firestore.FieldPath.documentId(), "in", Array.from(userIds))
                .get();

            const userMap = {};
            usersSnapshot.forEach(doc => {
                userMap[doc.id] = doc.data();
            });

            return userBalances.map(balance => ({
                ...balance,
                updatedAt: balance.updatedAt.toDate().toISOString(),
                creditor: {
                    uid: userMap[balance.creditorId]?.uid || "",
                    fullName: userMap[balance.creditorId]?.fullName || "Unknown",
                    avatar: userMap[balance.creditorId]?.avatar || "",
                    upiId: userMap[balance.creditorId]?.upiId || "",
                    phoneNumber: userMap[balance.creditorId]?.phoneNumber || "",
                    email: userMap[balance.creditorId]?.email || "",
                },
                debtor: {
                    uid: userMap[balance.debtorId]?.uid || "",
                    fullName: userMap[balance.debtorId]?.fullName || "Unknown",
                    avatar: userMap[balance.debtorId]?.avatar || "",
                    upiId: userMap[balance.debtorId]?.upiId || "",
                    phoneNumber: userMap[balance.debtorId]?.phoneNumber || "",
                    email: userMap[balance.debtorId]?.email || "",
                },
            }));
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

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
//             for (const { uid: debtorId, share } of splitDetails) {
//                 for (const creditorId of Object.keys(payerMap)) {
//                     if (creditorId !== debtorId) {
//                         const balanceId = `${creditorId}_${debtorId}_${groupId}`;
//                         const reverseBalanceId = `${debtorId}_${creditorId}_${groupId}`;

//                         const balanceRef = balancesRef.doc(balanceId);
//                         const reverseBalanceRef = balancesRef.doc(reverseBalanceId);

//                         if (!creditorId || !debtorId || !groupId) {
//                             throw new Error("Invalid balance document ID");
//                         }

//                         const amountOwed = parseFloat(
//                             (share * (payerMap[creditorId] / expenseData.amount)).toFixed(2)
//                         );

//                         if (!isFinite(amountOwed)) {
//                             throw new Error(`Invalid balance update: ${amountOwed}`);
//                         }

//                         const balanceDoc = await balanceRef.get();
//                         const reverseBalanceDoc = await reverseBalanceRef.get();

//                         if (reverseBalanceDoc.exists) {
//                             // 🔹 Case 1: A reverse balance exists (debtor owes creditor)
//                             const existingReverseAmount = reverseBalanceDoc.data()?.amountOwed || 0;
//                             const netAmount = existingReverseAmount - amountOwed;

//                             if (netAmount > 0) {
//                                 // Debtor still owes some amount → Update reverse balance
//                                 batch.update(reverseBalanceRef, {
//                                     amountOwed: netAmount,
//                                     updatedAt: firestore.Timestamp.now()
//                                 });
//                             } else if (netAmount < 0) {
//                                 // Creditor now owes debtor → Swap & create new balance
//                                 batch.set(balanceRef, {
//                                     creditorId,
//                                     debtorId,
//                                     groupId,
//                                     amountOwed: Math.abs(netAmount),
//                                     updatedAt: firestore.Timestamp.now(),
//                                 });
//                                 batch.delete(reverseBalanceRef); // Remove reverse balance
//                             } else {
//                                 // Full settlement → Delete reverse balance document
//                                 batch.delete(reverseBalanceRef);
//                             }
//                         } else if (balanceDoc.exists) {
//                             // 🔹 Case 2: Update existing balance if it exists
//                             const existingAmount = balanceDoc.data()?.amountOwed || 0;
//                             const updatedAmount = existingAmount + amountOwed;

//                             if (updatedAmount === 0) {
//                                 batch.delete(balanceRef); // Remove document if balance is settled
//                             } else {
//                                 batch.update(balanceRef, {
//                                     amountOwed: updatedAmount,
//                                     updatedAt: firestore.Timestamp.now()
//                                 });
//                             }
//                         } else {
//                             // 🔹 Case 3: No existing balance → Create a new balance entry
//                             batch.set(balanceRef, {
//                                 creditorId,
//                                 debtorId,
//                                 groupId,
//                                 amountOwed,
//                                 updatedAt: firestore.Timestamp.now(),
//                             });
//                         }
//                     }
//                 }
//             }

//             console.log("Committing batch update...");
//             await batch.commit();
//             console.log("Batch update committed successfully.");

//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );


export const updateBalancesOnExpenseCreate = createAsyncThunk(
    "balance/updateBalancesOnExpenseCreate",
    async ({ expenseData, groupId }, thunkAPI) => {
        try {
            const batch = firestore().batch();
            const balancesRef = firestore().collection("balances");

            const { paidBy, splitDetails, amount: totalAmount } = expenseData;

            const payerMap = Object.fromEntries(
                paidBy.map(({ uid, amount }) => [uid, amount])
            );

            const balanceDocRefs = new Map(); // Map<docId, docRef>

            // Step 1: Build a set of all relevant balance doc IDs
            for (const { uid: debtorId, share } of splitDetails) {
                for (const creditorId of Object.keys(payerMap)) {
                    if (creditorId !== debtorId) {
                        const balanceId = `${creditorId}_${debtorId}_${groupId}`;
                        const reverseBalanceId = `${debtorId}_${creditorId}_${groupId}`;
                        balanceDocRefs.set(balanceId, balancesRef.doc(balanceId));
                        balanceDocRefs.set(reverseBalanceId, balancesRef.doc(reverseBalanceId));
                    }
                }
            }

            // Step 2: Fetch all relevant balance documents in one go
            const balanceDocs = await Promise.all(
                Array.from(balanceDocRefs.values()).map((ref) => ref.get())
            );

            const docDataMap = new Map(); // Map<docId, docData>
            let i = 0;
            for (const [docId] of balanceDocRefs) {
                docDataMap.set(docId, balanceDocs[i++]);
            }

            // Step 3: Calculate and apply balance updates
            for (const { uid: debtorId, share } of splitDetails) {
                for (const creditorId of Object.keys(payerMap)) {
                    if (creditorId === debtorId) continue;

                    const balanceId = `${creditorId}_${debtorId}_${groupId}`;
                    const reverseBalanceId = `${debtorId}_${creditorId}_${groupId}`;
                    const balanceRef = balanceDocRefs.get(balanceId);
                    const reverseBalanceRef = balanceDocRefs.get(reverseBalanceId);
                    const balanceDoc = docDataMap.get(balanceId);
                    const reverseBalanceDoc = docDataMap.get(reverseBalanceId);

                    const amountOwed = parseFloat(
                        (share * (payerMap[creditorId] / totalAmount)).toFixed(2)
                    );

                    if (!isFinite(amountOwed)) {
                        throw new Error(`Invalid amountOwed: ${amountOwed}`);
                    }

                    if (reverseBalanceDoc.exists) {
                        const existingReverseAmount = reverseBalanceDoc.data()?.amountOwed || 0;
                        const netAmount = existingReverseAmount - amountOwed;

                        if (netAmount > 0) {
                            batch.update(reverseBalanceRef, {
                                amountOwed: netAmount,
                                updatedAt: firestore.Timestamp.now(),
                            });
                        } else if (netAmount < 0) {
                            batch.set(balanceRef, {
                                creditorId,
                                debtorId,
                                groupId,
                                amountOwed: Math.abs(netAmount),
                                updatedAt: firestore.Timestamp.now(),
                            });
                            batch.delete(reverseBalanceRef);
                        } else {
                            batch.delete(reverseBalanceRef);
                        }
                    } else if (balanceDoc.exists) {
                        const existingAmount = balanceDoc.data()?.amountOwed || 0;
                        const updatedAmount = existingAmount + amountOwed;

                        if (updatedAmount === 0) {
                            batch.delete(balanceRef);
                        } else {
                            batch.update(balanceRef, {
                                amountOwed: updatedAmount,
                                updatedAt: firestore.Timestamp.now(),
                            });
                        }
                    } else {
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

            await batch.commit();
            console.log("Balances updated successfully.");
        } catch (error) {
            console.error("Balance update failed:", error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


// export const revertOldBalances = createAsyncThunk(
//     "balance/revertOldBalances",
//     async ({ oldExpenseData }, thunkAPI) => {
//         try {
//             const batch = firestore().batch();
//             const balancesRef = firestore().collection("balances");

//             const { paidBy, splitDetails, groupId } = oldExpenseData;

//             let payerMap = {};
//             paidBy.forEach(({ uid, amount }) => {
//                 payerMap[uid] = amount;
//             });

//             splitDetails.forEach(({ uid: debtorId, share }) => {
//                 Object.keys(payerMap).forEach(creditorId => {
//                     if (debtorId !== creditorId) {
//                         const balanceId = `${creditorId}_${debtorId}_${groupId}`;
//                         console.log("Balance Doc ID:", balanceId);
//                         if (!creditorId || !debtorId || !groupId) {
//                             throw new Error("Invalid balance document ID");
//                         }

//                         const balanceDoc = balancesRef.doc(`${creditorId}_${debtorId}_${groupId}`);

//                         console.log("Share:", share);
//                         console.log("Payer's contribution:", payerMap[creditorId]);
//                         console.log("Total Expense Amount:", oldExpenseData.amount);

//                         if (share === undefined || payerMap[creditorId] === undefined || oldExpenseData.amount === undefined) {
//                             throw new Error("Invalid balance calculation: missing values");
//                         }

//                         const amountOwed = parseFloat((share * (payerMap[creditorId] / oldExpenseData.amount)).toFixed(2));
//                         if (!isFinite(amountOwed)) {
//                             throw new Error(`Invalid balance update: ${amountOwed}`);
//                         }

//                         batch.update(balanceDoc, {
//                             amountOwed: firestore.FieldValue.increment(-1 * amountOwed),
//                             updatedAt: firestore.Timestamp.now(),
//                         });

//                     }
//                 });
//             });

//             await batch.commit();
//             console.log("Old balances reverted successfully.");
//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );


export const revertOldBalances = createAsyncThunk(
    "balance/revertOldBalances",
    async ({ oldExpenseData }, thunkAPI) => {
        try {
            const batch = firestore().batch();
            const balancesRef = firestore().collection("balances");

            const { paidBy, splitDetails, groupId, amount: totalAmount } = oldExpenseData;

            if (!groupId || !totalAmount) {
                throw new Error("Invalid old expense data: missing groupId or amount");
            }

            const payerMap = Object.fromEntries(
                paidBy.map(({ uid, amount }) => [uid, amount])
            );

            for (const { uid: debtorId, share } of splitDetails) {
                for (const creditorId of Object.keys(payerMap)) {
                    if (debtorId === creditorId) continue;

                    const balanceId = `${creditorId}_${debtorId}_${groupId}`;
                    const balanceRef = balancesRef.doc(balanceId);

                    if (
                        share === undefined ||
                        payerMap[creditorId] === undefined ||
                        totalAmount === 0
                    ) {
                        throw new Error("Invalid balance calculation: missing or zero values");
                    }

                    const amountOwed = parseFloat(
                        (share * (payerMap[creditorId] / totalAmount)).toFixed(2)
                    );

                    if (!isFinite(amountOwed)) {
                        throw new Error(`Invalid amountOwed: ${amountOwed}`);
                    }
                    const balanceDoc = await balanceRef.get();
                    if (balanceDoc.exists) {
                        batch.update(balanceRef, {
                            amountOwed: firestore.FieldValue.increment(-1 * amountOwed),
                            updatedAt: firestore.Timestamp.now(),
                        });
                    }


                }
            }

            await batch.commit();
            console.log("Old balances reverted successfully.");
        } catch (error) {
            console.error("Error reverting old balances:", error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateBalanceAfterPayment = createAsyncThunk(
    'balances/updateBalanceAfterPayment',
    async ({ creditorId, debtorId, groupId, paidAmount, paymentMethod, tid }, { rejectWithValue }) => {
        try {
            console.log('In update')
            const balanceDocId = `${creditorId}_${debtorId}_${groupId}`;
            const balanceRef = firestore().collection('balances').doc(balanceDocId);
            const balanceDoc = await balanceRef.get();

            if (!balanceDoc.exists) return rejectWithValue("Balance document not found!");

            const { amountOwed } = balanceDoc.data();
            if (paidAmount >= amountOwed) {
                await balanceRef.delete();
            } else {
                await balanceRef.update({ amountOwed: amountOwed - paidAmount });
            }

            // Store transaction record
            await firestore().collection('transactions').add({
                creditorId,
                debtorId,
                groupIds: [groupId],
                paidAmount,
                paymentMethod,
                tid,
                participants: [creditorId, debtorId],
                timestamp: firestore.Timestamp.now()
            });
            console.log("Balances updated after upi payment successfully.");
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBalanceAfterCashPayment = createAsyncThunk(
    'balances/updateBalanceAfterCashPayment',
    async ({ creditorId, debtorId, groupId, receivedAmount }, { rejectWithValue }) => {
        try {
            const balanceDocId = `${creditorId}_${debtorId}_${groupId}`;
            const balanceRef = firestore().collection('balances').doc(balanceDocId);
            const balanceDoc = await balanceRef.get();

            if (!balanceDoc.exists) return rejectWithValue("Balance not found!");

            const { amountOwed } = balanceDoc.data();
            const newBalance = amountOwed - receivedAmount;

            if (newBalance <= 0) {
                await balanceRef.delete();
            } else {
                await balanceRef.update({ amountOwed: newBalance });
            }

            await firestore().collection('transactions').add({
                creditorId,
                debtorId,
                groupIds: [groupId],
                paidAmount: receivedAmount,
                paymentMethod: "Cash",
                participants: [creditorId, debtorId],
                timestamp: firestore.Timestamp.now()
            });

            console.log("Balances updated after cash payment successfully.");
            return { creditorId, debtorId, groupId, amountOwed: newBalance };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const settleFullBalanceOutsideGroup = createAsyncThunk(
    'balances/settleFullBalanceOutsideGroup',
    async ({ creditorId, debtorId, paidAmount, paymentMethod, tid }, { rejectWithValue }) => {
        try {
            const balancesRef = firestore().collection('balances');
            // Fetch all balances where the creditor and debtor are involved
            const snapshot = await balancesRef.get();

            let totalAmountOwed = 0;
            let groupIds = [];

            const batch = firestore().batch();

            snapshot.forEach((doc) => {
                const docId = doc.id;
                if (docId.startsWith(`${creditorId}_${debtorId}_`)) {
                    const balanceData = doc.data();
                    const { amountOwed } = balanceData;
                    const groupId = docId.split('_').pop(); // Extract groupId from document ID

                    totalAmountOwed += amountOwed;
                    groupIds.push(groupId);

                    batch.delete(doc.ref); // Delete the balance document
                }
                else if (docId.startsWith(`${debtorId}_${creditorId}_`)) {
                    const balanceData = doc.data();
                    const { amountOwed } = balanceData;
                    const groupId = docId.split('_').pop(); // Extract groupId from document ID

                    totalAmountOwed -= amountOwed;
                    groupIds.push(groupId);

                    batch.delete(doc.ref); // Delete the balance document
                }
            });
            console.log('paid :', paidAmount)
            console.log('ttoal :', totalAmountOwed)
            // 🔴 Verify that the paidAmount matches totalAmountOwed
            if (Math.abs(paidAmount - totalAmountOwed) > 0.01) {
                return rejectWithValue("Paid amount does not match the total amount owed!");
            }

            if (groupIds.length === 0 || totalAmountOwed === 0) {
                console.log("Nothing to settle.")
                return rejectWithValue("Nothing to settle.");
            }

            await batch.commit();

            await firestore().collection('transactions').add({
                creditorId,
                debtorId,
                groupIds,
                paidAmount,
                paymentMethod,
                tid,
                participants: [creditorId, debtorId],
                timestamp: firestore.Timestamp.now()
            });
            console.log('DONE')

        } catch (error) {
            return rejectWithValue(error.message);
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
            state.loading = false;
            state.balances = action.payload;
        },
        setUnsubscribe: (state, action) => {
            state.unsubscribe = action.payload;
        },
        clearBalances: (state) => {
            state.balances = [];
            if (state.unsubscribe) {
                state.unsubscribe(); // ✅ Stop Firestore listener before clearing
                state.unsubscribe = null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBalances.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBalances.fulfilled, (state, action) => {
                state.loading = false;
                state.balances = action.payload;
            })
            .addCase(fetchBalances.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Something went wrong";
            });
    }


})

export const { setBalances, setLoading, setError, clearBalances, setUnsubscribe } = balancesSlice.actions;
export default balancesSlice.reducer