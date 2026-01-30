/**
 * useAuth Hook
 * Custom hook to access AuthContext
 * Task 3.8 - Subtask 3.8.3
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
