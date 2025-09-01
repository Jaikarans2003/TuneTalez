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
    <div className="bg-[#1F1F1F] rounded-lg shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:transform hover:scale-[1.02]">
      {/* Thumbnail with overlay for duration/info */}
      <div className="relative group">
        <div className="relative h-48 w-full">
          <Image
            src={book.thumbnailUrl}
            alt={book.title}
            fill
            className="object-cover"
          />
          {/* Play button overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
            <div className="bg-primary rounded-full p-3 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 flex-grow">
        <h3 className="text-white font-medium mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-sm text-gray-400 mb-1">By {book.author}</p>
        
        {/* Tags */}
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {book.tags.map((tag, index) => (
              <span 
                key={index} 
                className="text-xs bg-[#333333] text-gray-300 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Preview of content - removed for YouTube style */}
      </div>
      
      {/* Actions */}
      <div className="px-3 pb-3 mt-auto">
        <div className="flex justify-between items-center">
          <Link 
            href={`/read/${book.id}`}
            className="text-orange hover:text-orange-dark font-medium text-sm flex items-center"
          >
            <span className="mr-1">▶</span> Read Now
          </Link>
          
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 text-sm"
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