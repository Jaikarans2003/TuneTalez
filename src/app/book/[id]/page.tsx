'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBookById, BookDocument, Chapter } from '@/firebase/services';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import LandingSidebar from '@/components/layout/LandingSidebar';
import { useAuth } from '@/context/AuthContext';

export default function ViewBookPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [book, setBook] = useState<BookDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      if (!params.id) {
        setError('Book ID is missing');
        setLoading(false);
        return;
      }

      try {
        const bookData = await getBookById(params.id as string);

        if (bookData) {
          // Sort chapters by order
          if (bookData.chapters) {
            bookData.chapters = bookData.chapters.sort((a, b) => a.order - b.order);
          }
          setBook(bookData);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [params.id]);

  const selectedChapter = book?.chapters?.[selectedChapterIndex];

  // Function to determine if current user is the author
  const isAuthor = () => {
    // This is a simple check, you might want to enhance this with proper author verification
    return user && book?.author === user.displayName;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/"
          className="text-primary hover:text-primary-dark transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Books
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <div className="mt-4">
            <Link 
              href="/"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      ) : book ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar with book info and chapters list */}
          <div className="md:col-span-3">
            <div className="bg-[#1F1F1F] rounded-lg shadow-md p-4 sticky top-4">
              <div className="mb-4">
                <img 
                  src={book.thumbnailUrl} 
                  alt={book.title}
                  className="w-full h-auto rounded-md object-cover"
                />
              </div>
              
              <h1 className="text-xl font-bold text-white mb-2">{book.title}</h1>
              <p className="text-gray-300 mb-4">By {book.author}</p>
              
              <div className="mb-4">
                {book.tags?.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-[#333333] text-gray-300 px-2 py-1 rounded-md text-sm mr-2 mb-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Author actions */}
              {isAuthor() && (
                <div className="mb-4 pt-4 border-t border-gray-700">
                  <Link
                    href={`/manage-episodes/${book.id}`}
                    className="block w-full bg-primary text-white py-2 px-4 rounded text-center hover:bg-primary-dark transition-colors"
                  >
                    Manage Episodes
                  </Link>
                </div>
              )}
              
              {/* Episodes list */}
              <div className="mt-6">
                <h2 className="text-lg font-bold text-white mb-3">Episodes</h2>
                {book.chapters && book.chapters.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {book.chapters.map((chapter, index) => (
                      <button
                        key={chapter.id}
                        onClick={() => setSelectedChapterIndex(index)}
                        className={`w-full text-left p-2 rounded-md ${
                          selectedChapterIndex === index
                            ? 'bg-primary text-white'
                            : 'bg-[#333333] text-gray-300 hover:bg-[#444444]'
                        }`}
                      >
                        <span className="block truncate">{chapter.title}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No episodes available</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-9">
            <div className="bg-[#1F1F1F] rounded-lg shadow-md p-6">
              {selectedChapter ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {selectedChapter.title}
                  </h2>
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedChapter.content }}
                  />
                </>
              ) : book.content ? (
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: book.content }}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No content available for this book.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
