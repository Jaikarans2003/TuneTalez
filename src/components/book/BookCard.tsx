import Link from 'next/link';
import Image from 'next/image';
import { BookDocument } from '@/firebase/services';

interface BookCardProps {
  book: BookDocument;
  onDelete?: (book: BookDocument) => void;
}

const BookCard = ({ book, onDelete }: BookCardProps) => {
  const handleDelete = () => {
    if (onDelete) {
      if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
        onDelete(book);
      }
    }
  };

  return (
    <div className="bg-[#1F1F1F] rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-red-500/30 hover:shadow-xl group">
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={book.thumbnailUrl || '/placeholder-book.png'}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4">
          <Link 
            href={`/read/${book.id}`} 
            className="w-full text-center text-white font-bold py-3 px-4 rounded-lg bg-primary hover:bg-red-700 transition-colors duration-300 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg"
          >
            Read Now
          </Link>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-primary transition-colors duration-300">{book.title}</h3>
            <p className="text-gray-400 text-sm mb-2">{book.author}</p>
            <div className="flex flex-wrap gap-1">
              {book.tags?.map((tag, index) => (
                <span key={index} className="inline-block bg-gray-800 rounded-full px-2 py-1 text-xs font-semibold text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 text-sm ml-2"
              aria-label="Delete book"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;