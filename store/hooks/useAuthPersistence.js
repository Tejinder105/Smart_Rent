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
        
          try {
            const userResponse = await authAPI.getCurrentUser();
            const userData = userResponse.data?.data || userResponse.data;
            
            dispatch(login({ userData }));
          } catch (error) {
            console.error('Failed to get current user:', error);
  
            await authAPI.clearTokens();
          }
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
