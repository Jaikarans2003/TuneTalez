'use client';

import { useEffect, useState } from 'react';
import { PdfDocument, getPdfs, deletePdf, BookDocument, getBooks, deleteBook } from '@/firebase/services';
import PdfCard from '@/components/pdf/PdfCard';
import BookCard from '@/components/book/BookCard';
import Link from 'next/link';

export default function Home() {
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [books, setBooks] = useState<BookDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPdfs = async () => {
    try {
      const pdfDocs = await getPdfs();
      setPdfs(pdfDocs);
      return true;
    } catch (err) {
      console.error('Error fetching PDFs:', err);
      return false;
    }
  };

  const fetchBooks = async () => {
    try {
      const bookDocs = await getBooks();
      setBooks(bookDocs);
      return true;
    } catch (err) {
      console.error('Error fetching books:', err);
      return false;
    }
  };

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const [pdfsSuccess, booksSuccess] = await Promise.all([
        fetchPdfs(),
        fetchBooks()
      ]);
      
      if (!pdfsSuccess && !booksSuccess) {
        setError('Failed to load content. Please try again later.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  const handleDeletePdf = async (pdf: PdfDocument) => {
    if (window.confirm(`Are you sure you want to delete ${pdf.name}?`)) {
      try {
        await deletePdf(pdf);
        // Refresh the list
        fetchPdfs();
      } catch (err) {
        console.error('Error deleting PDF:', err);
        setError('Failed to delete PDF. Please try again.');
      }
    }
  };

  const handleDeleteBook = async (book: BookDocument) => {
    try {
      await deleteBook(book);
      // Refresh the list
      fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1F1F1F] to-[#2D2D2D] text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Tune</span>Talez
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Discover and enjoy a world of stories at your fingertips
            </p>
            <div className="flex justify-center">
              <button className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg">
                Explore Books
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-8 md:ml-0">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            {/* Books Section */}
            <section className="mb-12 py-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-primary flex items-center">
                  <span className="text-primary mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Explore Our Books
                </h2>
              </div>

              {books.length === 0 ? (
                <div className="text-center py-12 bg-[#1F1F1F] rounded-lg">
                  <h3 className="text-xl font-medium text-white mb-2">No books found</h3>
                  <p className="text-gray-400 mb-6">Check back later for new books</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} onDelete={handleDeleteBook} />
                  ))}
                </div>
              )}
            </section>

            {/* PDFs Section */}
            <section className="py-12 bg-[#1F1F1F] rounded-lg">
              <div className="flex justify-between items-center mb-8 px-4">
                <h2 className="text-3xl font-bold text-primary flex items-center">
                  <span className="text-orange mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  PDF Collection
                </h2>
              </div>

              {pdfs.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-white mb-2">No PDFs found</h3>
                  <p className="text-gray-400 mb-6">Check back later for new PDFs</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 px-4">
                  {pdfs.map((pdf) => (
                    <PdfCard key={pdf.id} pdf={pdf} onDelete={handleDeletePdf} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
