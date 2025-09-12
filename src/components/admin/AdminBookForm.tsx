'use client';

import BookForm from '@/components/book/BookForm';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface AdminBookFormProps {
  onSuccess?: () => void;
}

// Admin credentials for Firebase authentication
// These should match your default admin credentials
const ADMIN_EMAIL = 'admin@tunetalez.com';
const ADMIN_PASSWORD = 'admin123';

export default function AdminBookForm({ onSuccess }: AdminBookFormProps) {
  const [authenticating, setAuthenticating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticate with Firebase when component mounts
  useEffect(() => {
    const authenticateAdmin = async () => {
      try {
        // Check if we're already authenticated
        if (auth.currentUser) {
          setAuthenticating(false);
          return;
        }

        // Sign in with admin credentials
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        setAuthenticating(false);
      } catch (err) {
        console.error('Error authenticating admin for uploads:', err);
        setError('Failed to authenticate for file uploads. Please check your Firebase configuration.');
        setAuthenticating(false);
      }
    };

    authenticateAdmin();

    // Clean up on unmount
    return () => {
      // We don't sign out because it would affect other parts of the app
    };
  }, []);

  if (authenticating) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2">Preparing editor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold mb-2">Authentication Error</h3>
        <p>{error}</p>
        <p className="mt-2">
          To fix this issue, please create a Firebase user with email "{ADMIN_EMAIL}" and password "{ADMIN_PASSWORD}",
          then assign it the admin role.
        </p>
      </div>
    );
  }

  return <BookForm onSuccess={onSuccess} />;
}
