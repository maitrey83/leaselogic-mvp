/**
 * ProtectedRoute Component
 * Redirects unauthenticated users to login page
 * Task 3.8 - Subtask 3.8.4
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * ProtectedRoute wrapper component
 * Checks authentication and redirects to login if not authenticated
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  // Save the attempted location so we can redirect back after login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
