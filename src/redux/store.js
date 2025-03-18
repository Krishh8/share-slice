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
})