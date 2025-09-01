'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BookForm from '@/components/book/BookForm';

export default function WritePage() {
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Handle successful book creation
  const handleSuccess = () => {
    setSuccess(true);
    // Redirect to home page after 2 seconds
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <div className="container mx-auto py-8">
      {success ? (
        <div className="max-w-md mx-auto p-6 bg-green-100 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">Book Published Successfully!</h2>
          <p className="text-green-700">Redirecting to home page...</p>
        </div>
      ) : (
        <BookForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}