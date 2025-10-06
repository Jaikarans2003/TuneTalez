'use client';

/**
 * Utility functions for handling audio URLs
 * Ensures we're always using Firebase Storage HTTPS URLs
 */
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/firebase/config";

/**
 * Validates that a URL is a proper Firebase Storage HTTPS URL
 * @param url The URL to validate
 * @returns true if the URL is a valid Firebase Storage URL, false otherwise
 */
export const isValidFirebaseUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // Check if it's a blob URL
  if (url.startsWith('blob:')) {
    console.error('❌ Invalid URL: Blob URLs are not allowed', url);
    return false;
  }
  
  // Check if it's a raw Firebase Storage path
  if (url.startsWith('gs://')) {
    console.error('❌ Invalid URL: Raw Firebase Storage paths are not allowed', url);
    return false;
  }
  
  // Check if it's an HTTPS URL
  if (!url.startsWith('https://')) {
    console.error('❌ Invalid URL: URLs must start with https://', url);
    return false;
  }
  
  // Check if it's a Firebase Storage URL
  if (!url.includes('firebasestorage.googleapis.com')) {
    console.warn('⚠️ URL may not be a Firebase Storage URL', url);
    // Still return true as it might be a valid HTTPS URL from another source
  }
  
  return true;
};

/**
 * Converts a gs:// URI to an HTTPS URL
 * @param gsUri The gs:// URI to convert
 * @returns Promise resolving to the HTTPS URL or null if invalid
 */
export const convertGsUriToHttpsUrl = async (gsUri: string): Promise<string | null> => {
  if (!gsUri) return null;
  
  try {
    // Check if it's already an HTTPS URL
    if (gsUri.startsWith('https://')) {
      return gsUri;
    }
    
    // Check if it's a gs:// URI
    if (!gsUri.startsWith('gs://')) {
      console.error('❌ Not a valid gs:// URI:', gsUri);
      return null;
    }
    
    // Extract the path from the gs:// URI
    // Format: gs://bucket-name/path/to/file.mp3
    const path = gsUri.replace(/^gs:\/\/[^\/]+\//, '');
    
    // Create a reference to the file
    const storageRef = ref(storage, path);
    
    // Get the download URL
    const url = await getDownloadURL(storageRef);
    console.log('✅ Converted gs:// URI to HTTPS URL:', url);
    
    return url;
  } catch (error) {
    console.error('❌ Error converting gs:// URI to HTTPS URL:', error);
    return null;
  }
};

/**
 * Ensures a URL is a valid Firebase Storage HTTPS URL
 * If not, returns null and logs an error
 * @param url The URL to ensure
 * @returns The URL if valid, null otherwise
 */
export const ensureFirebaseUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  if (!isValidFirebaseUrl(url)) {
    console.error('❌ Invalid Firebase Storage URL rejected:', url);
    return null;
  }
  
  return url;
};

/**
 * Ensures a URL or URI is a valid Firebase Storage HTTPS URL
 * Converts gs:// URIs to HTTPS URLs if needed
 * @param urlOrUri The URL or URI to ensure
 * @returns Promise resolving to the HTTPS URL or null if invalid
 */
export const ensureFirebaseHttpsUrl = async (urlOrUri: string | null | undefined): Promise<string | null> => {
  if (!urlOrUri) return null;
  
  // If it's a gs:// URI, convert it to an HTTPS URL
  if (urlOrUri.startsWith('gs://')) {
    return await convertGsUriToHttpsUrl(urlOrUri);
  }
  
  // Otherwise, ensure it's a valid Firebase HTTPS URL
  return ensureFirebaseUrl(urlOrUri);
};

/**
 * Gets the filename from a Firebase Storage URL
 * @param url The Firebase Storage URL
 * @returns The filename or null if not a valid URL
 */
export const getFilenameFromUrl = (url: string | null | undefined): string | null => {
  if (!url || !isValidFirebaseUrl(url)) return null;
  
  try {
    // Extract the path from the URL
    const urlObj = new URL(url);
    const path = decodeURIComponent(urlObj.pathname.split('/o/')[1]?.split('?')[0]);
    
    if (!path) return null;
    
    // Get the filename from the path
    const filename = path.split('/').pop();
    return filename || null;
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return null;
  }
};

/**
 * Simple validation for audio URLs
 * @param url The URL to validate
 * @returns true if the URL is likely a valid audio URL, false otherwise
 */
export const validateAudioUrl = (url: string): boolean => {
  if (!url) return false;
  if (url.startsWith("blob:")) return false;
  if (url.includes("firebasestorage.googleapis.com")) return true; // trust Firebase
  return url.toLowerCase().endsWith(".mp3") || url.toLowerCase().endsWith(".wav");
};

/**
 * Normalizes a Firebase Storage URL to ensure it's treated as an audio file
 * @param url The URL to normalize
 * @returns The normalized URL with .mp3 appended if needed
 */
export const normalizeAudioUrl = (url: string): string => {
  if (!url) return url;
  
  // If it's already a valid audio URL, return as is
  if (validateAudioUrl(url)) return url;
  
  // For Firebase Storage URLs that don't end with a recognized audio extension,
  // append a fake query parameter to help with format detection
  if (url.includes("firebasestorage.googleapis.com") && 
      !url.toLowerCase().endsWith(".mp3") && 
      !url.toLowerCase().endsWith(".wav")) {
    
    // Add a format hint query parameter
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}format=audio/mp3`;
  }
  
  return url;
};