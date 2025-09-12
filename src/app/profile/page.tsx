'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, logout, updateRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const handleRoleChange = async (role: 'reader' | 'author') => {
    try {
      setLoading(true);
      setMessage('');
      await updateRole(role);
      setMessage(`Your account has been updated to ${role} status`);
    } catch (error) {
      setMessage('Failed to update role. Please try again.');
      console.error('Error updating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-[#1F1F1F] rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-[#1F1F1F] rounded-lg shadow-lg overflow-hidden">
        {/* Header section with user info */}
        <div className="p-6 bg-[#2a2a2a] border-b border-[#3a3a3a]">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden mr-6">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-medium text-white">{user.email?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.displayName || user.email?.split('@')[0]}</h1>
              <p className="text-gray-400">{user.email}</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-[#3a3a3a] text-sm text-white capitalize">
                {profile.role}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6">
          {message && (
            <div className="mb-6 p-4 rounded-md bg-green-900 text-white">
              {message}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Account Type</h2>
            <p className="text-gray-400 mb-4">
              Choose your account type based on how you want to use TuneTalez:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleRoleChange('reader')}
                disabled={loading || profile.role === 'reader'}
                className={`px-4 py-3 rounded-md flex-1 ${profile.role === 'reader' ? 'bg-primary text-white' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-semibold">Reader</div>
                <div className="text-sm opacity-80 mt-1">Access and read content</div>
              </button>
              <button
                onClick={() => handleRoleChange('author')}
                disabled={loading || profile.role === 'author'}
                className={`px-4 py-3 rounded-md flex-1 ${profile.role === 'author' ? 'bg-primary text-white' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-semibold">Author</div>
                <div className="text-sm opacity-80 mt-1">Create and publish content</div>
              </button>
            </div>
          </div>

          <div className="border-t border-[#3a3a3a] pt-6 flex flex-col sm:flex-row gap-4">
            <Link href="/" className="px-4 py-2 bg-[#2a2a2a] text-white rounded-md text-center hover:bg-[#3a3a3a]">
              Back to Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-900 text-white rounded-md hover:bg-red-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}