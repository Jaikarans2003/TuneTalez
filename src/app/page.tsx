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
      {/* Mobile-friendly action buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 md:hidden z-30">
        <Link 
          href="/write"
          className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
          aria-label="Write Book"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
        <Link 
          href="/upload"
          className="p-3 bg-orange text-white rounded-full shadow-lg hover:bg-orange-dark transition-colors flex items-center justify-center"
          aria-label="Upload PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
          </svg>
        </Link>
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
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <span className="text-primary mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Featured Books
                </h2>
                <Link href="/write" className="text-sm text-primary hover:text-primary-light hidden md:block">Write Book</Link>
              </div>

              {books.length === 0 ? (
                <div className="text-center py-12 bg-[#1F1F1F] rounded-lg">
                  <h3 className="text-xl font-medium text-white mb-2">No books found</h3>
                  <p className="text-gray-400 mb-6">Write your first book to get started</p>
                  <Link 
                    href="/write"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Write Book
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} onDelete={handleDeleteBook} />
                  ))}
                </div>
              )}
            </section>

            {/* PDFs Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <span className="text-orange mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  PDF Documents
                </h2>
                <Link href="/upload" className="text-sm text-orange hover:text-orange-light hidden md:block">Upload PDF</Link>
              </div>

              {pdfs.length === 0 ? (
                <div className="text-center py-12 bg-[#1F1F1F] rounded-lg">
                  <h3 className="text-xl font-medium text-white mb-2">No PDF documents found</h3>
                  <p className="text-gray-400 mb-6">Upload your first PDF to get started</p>
                  <Link 
                    href="/upload"
                    className="px-4 py-2 bg-orange text-white rounded-md hover:bg-orange-dark transition-colors"
                  >
                    Upload PDF
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4">
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
