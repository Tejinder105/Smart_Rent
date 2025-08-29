import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import authAPI from '../api/authAPI';
import { login, setLoading } from '../slices/authSlice';

// Hook to check for existing authentication on app start
export const useAuthPersistence = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      dispatch(setLoading(true));
      try {
        const tokens = await authAPI.getTokens();
        
        if (tokens.accessToken) {
          // You could validate the token here by calling a /me endpoint
          // For now, we'll just assume if token exists, user is logged in
          dispatch(login({ 
            userData: { 
              // You could store more user data in AsyncStorage if needed
              email: 'stored@example.com' // Placeholder
            } 
          }));
        }
      } catch (error) {
        console.error('Auth persistence check failed:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkAuthStatus();
  }, [dispatch]);
};
