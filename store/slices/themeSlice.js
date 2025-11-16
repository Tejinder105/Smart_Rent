import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

const initialState = {
  mode: 'light', // 'light', 'dark', 'system'
  isDark: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.mode = action.payload;
      
      if (action.payload === 'system') {
        state.isDark = Appearance.getColorScheme() === 'dark';
      } else {
        state.isDark = action.payload === 'dark';
      }
      
      // Persist theme preference
      AsyncStorage.setItem('themeMode', action.payload).catch(console.error);
    },
    
    toggleTheme: (state) => {
      const newMode = state.isDark ? 'light' : 'dark';
      state.mode = newMode;
      state.isDark = newMode === 'dark';
      
      AsyncStorage.setItem('themeMode', newMode).catch(console.error);
    },
    
    setSystemTheme: (state, action) => {
      if (state.mode === 'system') {
        state.isDark = action.payload === 'dark';
      }
    },
    
    initializeTheme: (state, action) => {
      state.mode = action.payload;
      
      if (action.payload === 'system') {
        state.isDark = Appearance.getColorScheme() === 'dark';
      } else {
        state.isDark = action.payload === 'dark';
      }
    },
  },
});

export const { setThemeMode, toggleTheme, setSystemTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
