/**
 * Authentication Context
 * Global state management for user authentication
 * Task 3.8 - Subtask 3.8.2
 */

import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create AuthContext
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check authentication status on mount
   * Validates token and fetches current user
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated
   * Called on mount and after login
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if token exists
      if (!authService.isAuthenticated()) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Validate token by fetching current user
      const data = await authService.getCurrentUser();
      setUser(data);
    } catch (err) {
      console.error('[AuthContext] Check auth failed:', err);
      setUser(null);
      setError(err.message);
      // Only clear token on 401 (invalid/expired token)
      // Preserve token on transient errors (404, 500) so next load can retry
      if (err.status === 401) {
        localStorage.removeItem('authToken');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   * @param {string} email
   * @param {string} password
   * @param {string} fullName
   */
  const register = async (email, password, fullName) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.register(email, password, fullName);

      // Registration successful - do NOT auto-login
      // User should login manually after registration
      return data;
    } catch (err) {
      console.error('[AuthContext] Register failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.login(email, password);

      // Set user from response
      setUser(data.user);

      return data;
    } catch (err) {
      console.error('[AuthContext] Login failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await authService.logout();

      // Clear user state
      setUser(null);
    } catch (err) {
      console.error('[AuthContext] Logout failed:', err);
      setError(err.message);
      // Clear user even if API call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   * @param {string} fullName
   */
  const updateProfile = async (fullName) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.updateProfile(fullName);

      // Update user state with new data
      setUser(data.user);

      return data;
    } catch (err) {
      console.error('[AuthContext] Update profile failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
