// Purpose: Tracks payments made by users.
// Handles: Adding payments, updating payment status, and removing paid debts.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import firestore from "@react-native-firebase/firestore";

export const settleBalance = createAsyncThunk(
    "balance/settleBalance",
    async ({ payerId, payeeId, groupId, amount }, thunkAPI) => {
        try {
            const balanceRef = firestore().collection("balances").doc(`${payerId}_${payeeId}_${groupId}`);

            await balanceRef.update({
                amountOwed: firestore.FieldValue.increment(-amount),
                updatedAt: firestore.Timestamp.now(),
            });

            console.log("Payment settled successfully.");
            return { payerId, payeeId, groupId, amount };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const paymentSlice = createSlice({
    name: "payment",
    initialState: {
        payments: [],
        loading: false,
        error: null,
    },
    reducers: {},
});

export default paymentSlice.reducer;

