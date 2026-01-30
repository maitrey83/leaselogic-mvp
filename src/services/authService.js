/**
 * Authentication Service
 * Handles all API calls to backend auth endpoints
 * Task 3.8 - Subtask 3.8.1
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User full name (optional)
 * @returns {Promise<Object>} - User data and session
 */
const register = async (email, password, fullName) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('[authService] Register error:', error);
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data and session with access_token
 */
const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token in localStorage
    if (data.session && data.session.access_token) {
      localStorage.setItem('authToken', data.session.access_token);
    }

    return data;
  } catch (error) {
    console.error('[authService] Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
const logout = async () => {
  try {
    const token = localStorage.getItem('authToken');

    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    // Clear token from localStorage
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('[authService] Logout error:', error);
    // Clear token even if API call fails
    localStorage.removeItem('authToken');
    throw error;
  }
};

/**
 * Get current user
 * @returns {Promise<Object>} - Current user data
 */
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get current user');
    }

    return data;
  } catch (error) {
    console.error('[authService] Get current user error:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} fullName - Updated full name
 * @returns {Promise<Object>} - Updated user data
 */
const updateProfile = async (fullName) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    console.error('[authService] Update profile error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean}
 */
const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Get stored auth token
 * @returns {string|null}
 */
const getToken = () => {
  return localStorage.getItem('authToken');
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  isAuthenticated,
  getToken,
};

export default authService;
