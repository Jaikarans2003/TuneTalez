'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import { FaHistory } from 'react-icons/fa';

export default function HistoryPage() {
  const { user } = useAuth();
  const [historyBooks, setHistoryBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoryBooks = async () => {
      try {
        // Query books with the "History" tag
        const booksRef = collection(db, 'books');
        const historyBooksQuery = query(
          booksRef,
          where('tags', 'array-contains', 'History')
        );
        
        const historySnapshot = await getDocs(historyBooksQuery);
        
        if (historySnapshot.empty) {
          setHistoryBooks([]);
          setLoading(false);
          return;
        }
        
        // Map the documents to the books array
        const booksData = historySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setHistoryBooks(booksData);
      } catch (error) {
        console.error('Error fetching history books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryBooks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Reading History</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // We don't need to check for user authentication since we're displaying all history books

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <section className="mb-16 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 animate-fade-in">
            <div className="mb-6 md:mb-0 animate-slide-up">
              <div className="flex items-center mb-2">
                <div className="w-10 h-1 bg-gradient-to-r from-primary to-orange rounded mr-3"></div>
                <span className="text-primary-light uppercase tracking-wider text-sm font-semibold">History Collection</span>
              </div>
              {/* <h2 className="text-4xl font-bold text-white flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-orange-light">Historical Books</span>
              </h2> */}
            </div>
          </div>

          {historyBooks.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-[#1F1F1F] to-[#252525] rounded-2xl border border-[#333333] shadow-xl animate-fade-in">
              <FaHistory className="h-16 w-16 mx-auto text-primary/60 mb-4 animate-slide-up" />
              <h3 className="text-2xl font-bold text-white mb-2 animate-slide-up stagger-1">No historical books available</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto animate-slide-up stagger-2">We couldn't find any books tagged as History. Check back later for historical content.</p>
              <Link 
                href="/"
                className="bg-primary/20 hover:bg-primary/30 text-primary-light font-medium py-2 px-6 rounded-lg transition-all duration-300 animate-slide-up stagger-3 hover:scale-105"
                suppressHydrationWarning
              >
                Explore Books
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
              {historyBooks.map((book, index) => (
                <div key={book.id} className={`animate-fade-in stagger-${Math.min(index % 5 + 1, 5)}`}>
                  <div className="bg-[#1F1F1F] rounded-lg overflow-hidden hover:shadow-lg transition-all hover:shadow-primary/20">
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
                      {/* <div className="absolute top-2 right-2 bg-primary/90 p-1 rounded-full">
                        <FaHistory className="text-white h-4 w-4" />
                      </div> */}
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