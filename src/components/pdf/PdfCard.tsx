import React from 'react';
import Link from 'next/link';
import { PdfDocument } from '@/firebase/services';

interface PdfCardProps {
  pdf: PdfDocument;
  onDelete: (pdf: PdfDocument) => void;
}

const PdfCard: React.FC<PdfCardProps> = ({ pdf, onDelete }) => {
  return (
    <div className="bg-[#1F1F1F] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:scale-[1.02]">
      {/* PDF Icon Header */}
      <div className="relative group">
        <div className="h-48 w-full bg-[#333333] flex items-center justify-center">
          <div className="text-orange text-6xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>
          </div>
          {/* Play button overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
            <div className="bg-orange rounded-full p-3 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3">
        <h3 className="text-white font-medium mb-2 truncate" title={pdf.name}>
          {pdf.name}
        </h3>
        
        <div className="flex justify-between items-center">
          <Link 
            href={`/view/${pdf.id}`}
            className="text-orange hover:text-orange-dark font-medium text-sm flex items-center"
          >
            <span className="mr-1">▶</span> View PDF
          </Link>
          <button
            onClick={() => onDelete(pdf)}
            className="text-gray-400 hover:text-red-500 text-sm"
            aria-label="Delete PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfCard;