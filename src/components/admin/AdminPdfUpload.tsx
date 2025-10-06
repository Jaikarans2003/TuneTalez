'use client';

import React, { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';

interface AdminPdfUploadProps {
  onUploadSuccess: () => void;
}

const AdminPdfUpload: React.FC<AdminPdfUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  // Direct upload function that bypasses the service layer
  const uploadPdfDirect = async (file: File, onProgress?: (progress: number) => void) => {
    try {
      // Create a storage reference
      const storageRef = ref(storage, `pdfs/${file.name}`);
      
      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Wait for upload to complete
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress monitoring
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            // Call the progress callback if provided
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            // Handle errors
            console.error('Upload failed:', error);
            reject(error);
          },
          async () => {
            // Upload completed successfully, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Add document to Firestore
            const pdfDoc = {
              name: file.name,
              url: downloadURL,
              createdAt: Date.now(),
              description: description || undefined
            };
            
            const docRef = await addDoc(collection(db, 'pdfs'), pdfDoc);
            resolve({ ...pdfDoc, id: docRef.id });
          }
        );
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Upload the file with progress tracking
      await uploadPdfDirect(file, (progress) => {
        setUploadProgress(progress);
      });
      
      // Reset form
      setFile(null);
      setDescription('');
      setUploading(false);
      setUploadProgress(100);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#1F1F1F] rounded-lg shadow-md p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6">Upload PDF (Admin Mode)</h2>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Select PDF File</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-[#2a2a2a] text-white"
          disabled={uploading}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Description (Optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-[#2a2a2a] text-white"
          rows={3}
          placeholder="Enter a description for the PDF"
          disabled={uploading}
        />
      </div>
      
      {file && (
        <div className="mb-4">
          <p className="text-sm text-gray-400">Selected file: {file.name}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-white rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-1">Uploading: {Math.round(uploadProgress)}%</p>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
};

export default AdminPdfUpload;
