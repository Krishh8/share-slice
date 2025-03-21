import { configureStore } from '@reduxjs/toolkit';
import userAuthReducer from './slices/userAuthSlice'
import groupReducer from './slices/groupSlice';
import expenseReducer from './slices/expensesSlice';
import balanceReducer from './slices/balancesSlice'

export const store = configureStore({
    reducer: {
        userAuth: userAuthReducer,
        group: groupReducer,
        expense: expenseReducer,
        balance: balanceReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,  // Disable mutation checks
            serializableCheck: false, // Disable serializable checks
        }),
})