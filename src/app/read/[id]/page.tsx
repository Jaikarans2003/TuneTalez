'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BookDocument, getBookById } from '@/firebase/services';

export default function ReadBookPage() {
  const { id } = useParams();
  const [book, setBook] = useState<BookDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const bookData = await getBookById(id as string);
        
        if (!bookData) {
          setError('Book not found');
          return;
        }
        
        setBook(bookData);
        setError(null);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error || 'Book not found'}</span>
          </div>
          <div className="mt-4">
            <Link href="/" className="text-orange hover:text-orange-light flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary via-orange to-primary-dark py-6 px-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-white hover:text-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            TuneTalez
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Book Header */}
        <div className="relative h-64 md:h-80 w-full bg-[#1F1F1F] rounded-lg overflow-hidden mb-6">
          <Image
            src={book.thumbnailUrl}
            alt={book.title}
            fill
            className="object-cover"
            quality={100}
            unoptimized={true}
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
            <div className="p-6 text-white w-full">
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <div className="flex justify-between items-center">
                <p className="text-lg text-gray-300">By {book.author}</p>
                
                {/* Tags */}
                {book.tags && book.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-[#333333] text-gray-300 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Book Content */}
        <div className="bg-[#1F1F1F] rounded-lg shadow-md overflow-hidden p-6 md:p-8 lg:p-10">
          {/* Render content as HTML */}
          <div 
            className="prose prose-lg max-w-none prose-invert prose-headings:text-orange prose-a:text-primary-light"
            dangerouslySetInnerHTML={{ 
              __html: book.content && book.content.includes('<') && book.content.includes('>') 
                ? book.content 
                : book.content ? book.content.replace(/\n/g, '<br>') : ''
            }} 
          />
        </div>
      </div>
    </div>
  );
}