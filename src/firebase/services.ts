import { db, storage } from './config';
import { collection, addDoc, getDocs, getDoc, doc, deleteDoc, query, orderBy, where, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { User } from 'firebase/auth';

// Interface for PDF document
export interface PdfDocument {
  id?: string;
  name: string;
  url: string;
  createdAt: number;
  description?: string;
}

// Upload PDF to Firebase Storage
export const uploadPdf = async (file: File, onProgress?: (progress: number) => void): Promise<PdfDocument> => {
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
          const pdfDoc: PdfDocument = {
            name: file.name,
            url: downloadURL,
            createdAt: Date.now(),
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

// Get all PDFs from Firestore
export const getPdfs = async (): Promise<PdfDocument[]> => {
  try {
    const pdfsQuery = query(collection(db, 'pdfs'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(pdfsQuery);
    
    return querySnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() } as PdfDocument;
    });
  } catch (error) {
    console.error('Error getting PDFs:', error);
    throw error;
  }
};

// Delete PDF from Firestore and Storage
export const deletePdf = async (pdfDoc: PdfDocument): Promise<void> => {
  try {
    if (!pdfDoc.id) throw new Error('Document ID is required');
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'pdfs', pdfDoc.id));
    
    // Delete from Storage
    const storageRef = ref(storage, `pdfs/${pdfDoc.name}`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error;
  }
};

// Interface for User Profile
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'reader' | 'author' | 'admin';
  createdAt: number;
}

// Create or update user profile
export const createUserProfile = async (user: User, role: 'reader' | 'author' | 'admin' = 'reader'): Promise<UserProfile> => {
  try {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: role,
      createdAt: Date.now()
    };

    // Use setDoc with merge option to create or update the document
    await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (uid: string, role: 'reader' | 'author' | 'admin'): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), { role }, { merge: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Set a user as admin (should be used carefully)
export const setUserAsAdmin = async (uid: string): Promise<void> => {
  try {
    await updateUserRole(uid, 'admin');
  } catch (error) {
    console.error('Error setting user as admin:', error);
    throw error;
  }
};

// Interface for Chapter/Episode
export interface Chapter {
  id?: string;
  title: string;
  content: string;
  order: number;
  createdAt: number;
}

// Interface for Book document
export interface BookDocument {
  id?: string;
  title: string;
  content?: string; // Main description/intro content (optional now)
  author: string;
  tags: string[];
  thumbnailUrl: string;
  createdAt: number;
  chapters: Chapter[]; // Array of chapters/episodes
  lastUpdated?: number; // Track when the book was last updated
}

// Upload Book Thumbnail to Firebase Storage
export const uploadBookThumbnail = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    // Create a unique filename
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `books/thumbnails/${fileName}`);
    
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
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    throw error;
  }
};

// Create a new book in Firestore
export const createBook = async (book: Omit<BookDocument, 'id' | 'createdAt' | 'lastUpdated'>): Promise<BookDocument> => {
  try {
    const timestamp = Date.now();
    const bookDoc: Omit<BookDocument, 'id'> = {
      ...book,
      createdAt: timestamp,
      lastUpdated: timestamp,
      // Ensure chapters array exists
      chapters: book.chapters || []
    };
    
    const docRef = await addDoc(collection(db, 'books'), bookDoc);
    return { ...bookDoc, id: docRef.id } as BookDocument;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

// Get all books from Firestore
export const getBooks = async (): Promise<BookDocument[]> => {
  try {
    const booksQuery = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(booksQuery);
    
    return querySnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() } as BookDocument;
    });
  } catch (error) {
    console.error('Error getting books:', error);
    throw error;
  }
};

// Get a single book by ID
export const getBookById = async (id: string): Promise<BookDocument | null> => {
  try {
    const docRef = doc(db, 'books', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BookDocument;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting book:', error);
    throw error;
  }
};

// Delete book from Firestore and Storage
export const deleteBook = async (book: BookDocument): Promise<void> => {
  try {
    if (!book.id) throw new Error('Document ID is required');
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'books', book.id));
    
    // Delete thumbnail from Storage if it exists
    if (book.thumbnailUrl) {
      try {
        // Extract the path from the URL
        const thumbnailPath = book.thumbnailUrl.split('books/thumbnails/').pop();
        if (thumbnailPath) {
          const storageRef = ref(storage, `books/thumbnails/${thumbnailPath}`);
          await deleteObject(storageRef);
        }
      } catch (storageError) {
        console.error('Error deleting thumbnail:', storageError);
        // Continue with deletion even if thumbnail deletion fails
      }
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

// Add a new chapter to a book
export const addChapter = async (bookId: string, chapter: Omit<Chapter, 'id' | 'createdAt'>): Promise<Chapter> => {
  try {
    if (!bookId) throw new Error('Book ID is required');
    
    // Get the current book
    const bookRef = doc(db, 'books', bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (!bookSnap.exists()) {
      throw new Error('Book not found');
    }
    
    const bookData = bookSnap.data() as BookDocument;
    const chapters = bookData.chapters || [];
    
    // Create new chapter with ID and timestamp
    const newChapter: Chapter = {
      ...chapter,
      id: `chapter_${Date.now()}`, // Generate a unique ID
      createdAt: Date.now(),
    };
    
    // Add chapter to the book
    const updatedChapters = [...chapters, newChapter];
    
    // Update the book document
    await setDoc(bookRef, { 
      chapters: updatedChapters,
      lastUpdated: Date.now()
    }, { merge: true });
    
    return newChapter;
  } catch (error) {
    console.error('Error adding chapter:', error);
    throw error;
  }
};

// Update an existing chapter
export const updateChapter = async (bookId: string, chapterId: string, updates: Partial<Omit<Chapter, 'id' | 'createdAt'>>): Promise<Chapter> => {
  try {
    if (!bookId) throw new Error('Book ID is required');
    if (!chapterId) throw new Error('Chapter ID is required');
    
    // Get the current book
    const bookRef = doc(db, 'books', bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (!bookSnap.exists()) {
      throw new Error('Book not found');
    }
    
    const bookData = bookSnap.data() as BookDocument;
    const chapters = bookData.chapters || [];
    
    // Find the chapter to update
    const chapterIndex = chapters.findIndex(ch => ch.id === chapterId);
    if (chapterIndex === -1) {
      throw new Error('Chapter not found');
    }
    
    // Update the chapter
    const updatedChapter = {
      ...chapters[chapterIndex],
      ...updates
    };
    
    // Replace the chapter in the array
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex] = updatedChapter;
    
    // Update the book document
    await setDoc(bookRef, { 
      chapters: updatedChapters,
      lastUpdated: Date.now()
    }, { merge: true });
    
    return updatedChapter;
  } catch (error) {
    console.error('Error updating chapter:', error);
    throw error;
  }
};

// Delete a chapter
export const deleteChapter = async (bookId: string, chapterId: string): Promise<void> => {
  try {
    if (!bookId) throw new Error('Book ID is required');
    if (!chapterId) throw new Error('Chapter ID is required');
    
    // Get the current book
    const bookRef = doc(db, 'books', bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (!bookSnap.exists()) {
      throw new Error('Book not found');
    }
    
    const bookData = bookSnap.data() as BookDocument;
    const chapters = bookData.chapters || [];
    
    // Filter out the chapter to delete
    const updatedChapters = chapters.filter(ch => ch.id !== chapterId);
    
    // Update the book document
    await setDoc(bookRef, { 
      chapters: updatedChapters,
      lastUpdated: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    throw error;
  }
};

// Reorder chapters
export const reorderChapters = async (bookId: string, newOrder: string[]): Promise<void> => {
  try {
    if (!bookId) throw new Error('Book ID is required');
    
    // Get the current book
    const bookRef = doc(db, 'books', bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (!bookSnap.exists()) {
      throw new Error('Book not found');
    }
    
    const bookData = bookSnap.data() as BookDocument;
    const chapters = bookData.chapters || [];
    
    // Create a map of chapters by ID for quick lookup
    const chaptersMap = new Map(chapters.map(chapter => [chapter.id, chapter]));
    
    // Create the new ordered array
    const reorderedChapters = newOrder
      .map((id, index) => {
        const chapter = chaptersMap.get(id);
        if (!chapter) return null;
        
        // Update the order property
        return {
          ...chapter,
          order: index
        };
      })
      .filter((chapter): chapter is Chapter => chapter !== null);
    
    // Update the book document
    await setDoc(bookRef, { 
      chapters: reorderedChapters,
      lastUpdated: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error('Error reordering chapters:', error);
    throw error;
  }
};