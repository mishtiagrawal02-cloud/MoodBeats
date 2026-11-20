import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

/**
 * Authentication hook
 * Manages user authentication state
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          // Token exists, could verify with backend if needed
          // For now, just mark as authenticated
          setLoading(false);
        } catch (err) {
          console.error('Auth check failed:', err);
          authAPI.logout();
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (userName) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authAPI.login(userName);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (userName) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authAPI.register(userName);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
  }, []);

  /**
   * Check if authenticated
   */
  const isAuthenticated = useCallback(() => {
    return authAPI.isAuthenticated();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };
}
