import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './slices/expenseSlice';
import flatReducer from './slices/flatSlice';
import paymentReducer from './slices/paymentSlice';
import themeReducer from './slices/themeSlice';
// New integrated APIs
import billReducer from './slices/billSlice';
import notificationReducer from './slices/notificationSlice';
import reportReducer from './slices/reportSlice';
import transactionReducer from './slices/transactionSlice';
// V2 Unified Systems (Optimized) ⭐
import expenseUnifiedReducer from './slices/expenseUnifiedSlice';
import reportUnifiedReducer from './slices/reportUnifiedSlice';

export const store = configureStore({
  reducer: {
    // Existing slices
    auth: authReducer,
    payment: paymentReducer,
    expense: expenseReducer,
    flat: flatReducer,
    theme: themeReducer,
    // Legacy integrated slices (DEPRECATED - use V2 unified)
    bill: billReducer,
    transaction: transactionReducer,
    notification: notificationReducer,
    report: reportReducer, // DEPRECATED: Use reportUnified instead
    // V2 Unified Systems (Optimized) ⭐
    expenseUnified: expenseUnifiedReducer,
    reportUnified: reportUnifiedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
