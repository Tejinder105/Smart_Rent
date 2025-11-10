import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './slices/expenseSlice';
import flatReducer from './slices/flatSlice';
import paymentReducer from './slices/paymentSlice';
// New integrated APIs
import billReducer from './slices/billSlice';
import notificationReducer from './slices/notificationSlice';
import reportReducer from './slices/reportSlice';
import transactionReducer from './slices/transactionSlice';
import budgetReducer from './slices/budgetSlice';

export const store = configureStore({
  reducer: {
    // Existing slices
    auth: authReducer,
    payment: paymentReducer,
    expense: expenseReducer,
    flat: flatReducer,
    // New integrated slices
    bill: billReducer,
    transaction: transactionReducer,
    notification: notificationReducer,
    report: reportReducer,
    budget: budgetReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
