import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './slices/expenseSlice';
import flatmateReducer from './slices/flatmateSlice';
import flatReducer from './slices/flatSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    payment: paymentReducer,
    expense: expenseReducer,
    flatmate: flatmateReducer,
    flat: flatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
