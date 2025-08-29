import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.userData;
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { login, logout, setLoading, setError, clearError } = authSlice.actions;

export default authSlice.reducer;
