import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, subscriptionAPI } from '../services/apiService';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated (without triggering refresh attempt)
      const userData = await authAPI.checkCurrentUser();
      setUser(userData);

      // Refresh subscription status on startup (per API docs)
      try {
        await subscriptionAPI.refreshStatus();
        // Re-fetch user to get updated subscription status
        const updatedUser = await authAPI.getCurrentUser();
        setUser(updatedUser);
      } catch (error) {
        console.warn('Failed to refresh subscription status:', error);
      }
    } catch (error) {
      // No valid session (no valid cookies) - this is expected on first visit
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken, deviceInfo) => {
    try {
      setError(null);
      const response = await authAPI.loginWithGoogle(googleToken, deviceInfo);
      setUser(response.user);

      // Refresh subscription status after login
      try {
        await subscriptionAPI.refreshStatus();
        const updatedUser = await authAPI.getCurrentUser();
        setUser(updatedUser);
      } catch (error) {
        console.warn('Failed to refresh subscription after login:', error);
      }

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const loginWithApple = async (appleToken, deviceInfo) => {
    try {
      setError(null);
      const response = await authAPI.loginWithApple(appleToken, deviceInfo);
      setUser(response.user);

      // Refresh subscription status after login
      try {
        await subscriptionAPI.refreshStatus();
        const updatedUser = await authAPI.getCurrentUser();
        setUser(updatedUser);
      } catch (error) {
        console.warn('Failed to refresh subscription after login:', error);
      }

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshSubscriptionStatus = async () => {
    try {
      await subscriptionAPI.refreshStatus();
      // Re-fetch user to get updated subscription status
      const updatedUser = await authAPI.getCurrentUser();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    hasActiveSubscription: user?.hasActiveSubscription || false,
    hasLifetimeAccess: user?.hasLifetimeAccess || false,
    loginWithGoogle,
    loginWithApple,
    logout,
    refreshSubscriptionStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
