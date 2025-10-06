'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import Image from 'next/image';
import { FaBookmark } from 'react-icons/fa';

export default function SavedPage() {
  const { user } = useAuth();
  const [savedBooks, setSavedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedBooks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Query the bookmarks collection for the current user
        const bookmarksQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid)
        );
        
        const bookmarksSnapshot = await getDocs(bookmarksQuery);
        const bookIds = bookmarksSnapshot.docs.map(doc => doc.data().bookId);
        
        // If there are no saved books, set empty array and return
        if (bookIds.length === 0) {
          setSavedBooks([]);
          setLoading(false);
          return;
        }
        
        // Fetch the actual book data for each saved book
        const booksData = [];
        for (const bookId of bookIds) {
          try {
            // First try to get the book directly by ID
            const bookRef = collection(db, 'books');
            const bookSnapshot = await getDocs(bookRef);
            
            // Find the book with matching ID
            const bookDoc = bookSnapshot.docs.find(doc => 
              doc.id === bookId || doc.data().id === bookId
            );
            
            if (bookDoc) {
              booksData.push({
                id: bookId,
                ...bookDoc.data()
              });
            }
          } catch (error) {
            console.error(`Error fetching book with ID ${bookId}:`, error);
          }
        }
        
        setSavedBooks(booksData);
      } catch (error) {
        console.error('Error fetching saved books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedBooks();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Saved Books</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Saved Books</h1>
          <div className="bg-[#1F1F1F] rounded-lg p-8 text-center">
            <p className="text-xl mb-4">Please sign in to view your saved books</p>
            <Link href="/auth/signin" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <section className="mb-16 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 animate-fade-in">
            <div className="mb-6 md:mb-0 animate-slide-up">
              <div className="flex items-center mb-2">
                <div className="w-10 h-1 bg-gradient-to-r from-primary to-orange rounded mr-3"></div>
                <span className="text-primary-light uppercase tracking-wider text-sm font-semibold">Saved</span>
              </div>
              {/* <h2 className="text-4xl font-bold text-white flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-orange-light">Saved Books</span>
              </h2> */}
            </div>
          </div>

          {savedBooks.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-[#1F1F1F] to-[#252525] rounded-2xl border border-[#333333] shadow-xl animate-fade-in">
              <FaBookmark className="h-16 w-16 mx-auto text-orange/60 mb-4 animate-slide-up" />
              <h3 className="text-2xl font-bold text-white mb-2 animate-slide-up stagger-1">You haven't saved any books yet</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto animate-slide-up stagger-2">Explore our collection and save books to find them here.</p>
              <Link 
                href="/"
                className="bg-orange/20 hover:bg-orange/30 text-orange-light font-medium py-2 px-6 rounded-lg transition-all duration-300 animate-slide-up stagger-3 hover:scale-105"
                suppressHydrationWarning
              >
                Explore Books
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
              {savedBooks.map((book, index) => (
                <div key={book.id} className={`animate-fade-in stagger-${Math.min(index % 5 + 1, 5)}`}>
                  <div className="bg-[#1F1F1F] rounded-lg overflow-hidden hover:shadow-lg transition-all hover:shadow-orange/20">
                    <div className="relative pb-[177.78%] bg-[#252525]">
                      {book.thumbnailUrl ? (
                        <img 
                          src={book.thumbnailUrl} 
                          alt={book.title || 'Book cover'} 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#252525]">
                          <span className="text-gray-500 text-4xl font-bold">{book.title?.substring(0, 1) || 'N/A'}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-orange/90 p-1 rounded-full">
                        <FaBookmark className="text-white h-4 w-4" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 truncate">{book.title || 'Untitled Book'}</h3>
                      <p className="text-gray-400 text-sm mb-2">{book.author || 'Unknown Author'}</p>
                      <Link 
                        href={`/book/${book.id}`}
                        className="block w-full text-center bg-primary/10 text-primary-light hover:bg-primary/20 transition-all py-2 rounded mt-2"
                      >
                        View Book
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}