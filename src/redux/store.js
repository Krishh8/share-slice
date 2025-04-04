import { configureStore } from '@reduxjs/toolkit';
import userAuthReducer from './slices/userAuthSlice'
import groupReducer from './slices/groupSlice';
import expenseReducer from './slices/expensesSlice';
import balanceReducer from './slices/balancesSlice'
import reminderReducer from './slices/reminderSlice'
import transactionReducer from './slices/transactionsSlice'

export const store = configureStore({
    reducer: {
        userAuth: userAuthReducer,
        group: groupReducer,
        expense: expenseReducer,
        balance: balanceReducer,
        reminder: reminderReducer,
        transaction: transactionReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,  // Disable mutation checks
            serializableCheck: false, // Disable serializable checks
        }),
})