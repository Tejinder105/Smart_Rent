import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo } from 'react';
import { Appearance } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getColors, getTheme } from '../../constants/theme';
import { initializeTheme, setSystemTheme } from '../slices/themeSlice';

/**
 * Enhanced theme hook with complete theme object
 * 
 * Returns:
 * - theme: Complete theme object with colors, spacing, typography, etc.
 * - colors: Just the color palette (for backwards compatibility)
 * - isDark: Boolean dark mode state
 * - mode: Theme mode ('light', 'dark', 'system')
 * 
 * Usage:
 * const { theme, colors, isDark } = useTheme();
 * 
 * // Use complete theme
 * <View style={{ padding: theme.spacing.md, backgroundColor: theme.colors.background }}>
 * 
 * // Or just colors (legacy)
 * <Text style={{ color: colors.text }}>
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  const { mode, isDark } = useSelector((state) => state.theme);

  // Initialize theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        dispatch(initializeTheme(savedMode || 'system'));
      } catch (error) {
        console.error('Error loading theme:', error);
        dispatch(initializeTheme('system'));
      }
    };

    loadTheme();
  }, []);

  // Listen to system theme changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch(setSystemTheme(colorScheme));
    });

    return () => subscription.remove();
  }, [mode]);

  // Memoize theme object to prevent unnecessary re-renders
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const colors = useMemo(() => getColors(isDark), [isDark]);

  return { 
    theme,      // Complete theme object (NEW - recommended)
    colors,     // Just colors (legacy support)
    isDark, 
    mode 
  };
};

export default useTheme;
