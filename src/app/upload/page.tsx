'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PdfUpload from '@/components/pdf/PdfUpload';

export default function UploadPage() {
  const router = useRouter();
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    // Redirect to home page after a short delay
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary mb-8 text-center">Upload PDF Document</h1>
      
      {uploadSuccess ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative max-w-md mx-auto" role="alert">
          <span className="block sm:inline">PDF uploaded successfully! Redirecting to home page...</span>
        </div>
      ) : (
        <PdfUpload onUploadSuccess={handleUploadSuccess} />
      )}
    </div>
  );
}