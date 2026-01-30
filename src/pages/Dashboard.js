/**
 * Dashboard Page
 * Landing page after login with quick links
 * Task 3.8 - Subtask 3.8.7
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import DisclaimerBanner from '../components/DisclaimerBanner';
import Footer from '../components/Footer';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('[Dashboard] Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Legal Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">LeaseLogic</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
          </h2>
          <p className="text-gray-600">
            What would you like to do today?
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create 3-Day Notice */}
          <Link
            to="/form/utah-3day-notice"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create 3-Day Notice
            </h3>
            <p className="text-sm text-gray-600">
              Generate a Utah-compliant 3-day notice to pay or vacate
            </p>
          </Link>

          {/* Create Rent Increase Notice */}
          <Link
            to="/form/utah-rent-increase"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Rent Increase Notice
            </h3>
            <p className="text-sm text-gray-600">
              Create a Utah-compliant rent increase notice
            </p>
          </Link>

          {/* View Properties */}
          <Link
            to="/properties"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              My Properties
            </h3>
            <p className="text-sm text-gray-600">
              Manage your rental properties
            </p>
          </Link>

          {/* View Templates */}
          <Link
            to="/templates"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              My Templates
            </h3>
            <p className="text-sm text-gray-600">
              Access saved notice templates
            </p>
          </Link>

          {/* Notice History */}
          <Link
            to="/notices"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Notice History
            </h3>
            <p className="text-sm text-gray-600">
              View all generated notices
            </p>
          </Link>

          {/* Account Settings */}
          <Link
            to="/profile"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Account Settings
            </h3>
            <p className="text-sm text-gray-600">
              Manage your profile and preferences
            </p>
          </Link>
        </div>

        {/* Legal Disclaimer Section */}
        <div className="mt-12 space-y-6">
          {/* Important Legal Notice */}
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  IMPORTANT: Not Legal Advice
                </h3>
                <div className="text-sm text-red-800 space-y-2">
                  <p className="font-semibold">
                    LeaseLogic is NOT a law firm and does NOT provide legal advice.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>This service provides <strong>document templates only</strong></li>
                    <li>No attorney-client relationship is created</li>
                    <li>We cannot represent you in legal matters</li>
                    <li>Laws change frequently - templates may not reflect current law</li>
                  </ul>
                  <p className="font-bold text-red-900 mt-3">
                    ⚠️ You are strongly advised to consult with a qualified Utah attorney before using any legal documents.
                  </p>
                  <p className="text-xs mt-2">
                    Utah State Bar Lawyer Referral Service: <a href="tel:8015319077" className="underline hover:text-red-900">(801) 531-9077</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">
                  Welcome to LeaseLogic
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    LeaseLogic helps you generate document templates for Utah rental properties.
                    Get started by creating your first notice or setting up your properties.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Link to="/terms-of-service" className="text-blue-600 hover:text-blue-800 hover:underline">
                  📄 Terms of Service
                </Link>
                <p className="text-xs text-gray-600 mt-1">
                  Read our complete terms and conditions
                </p>
              </div>
              <div>
                <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 hover:underline">
                  🔒 Privacy Policy
                </Link>
                <p className="text-xs text-gray-600 mt-1">
                  How we protect your information
                </p>
              </div>
              <div>
                <Link to="/cookie-policy" className="text-blue-600 hover:text-blue-800 hover:underline">
                  🍪 Cookie Policy
                </Link>
                <p className="text-xs text-gray-600 mt-1">
                  Learn about our cookie usage
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-600">
                By using this service, you acknowledge that you have read and agree to our{' '}
                <Link to="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                You understand that this service does not provide legal advice and you should consult an attorney
                for legal guidance.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
