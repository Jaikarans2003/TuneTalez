'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isOpen, setIsOpen }) => {
  return (
    <header className="bg-[#212121] text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left section - Menu toggle and Logo */}
        <div className="flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="mr-3 text-white md:hidden"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary mr-1">Tune</span>
            <span className="text-2xl font-bold text-white">Talez</span>
          </Link>
        </div>
        
        {/* Middle section - Search bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search books and PDFs..."
              className="w-full bg-[#121212] border border-[#303030] rounded-l-full py-2 px-4 text-white focus:outline-none focus:border-[#404040]"
            />
            <button className="absolute right-0 top-0 h-full bg-[#303030] px-4 rounded-r-full flex items-center justify-center hover:bg-[#404040]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Right section - Sign in button */}
        <div className="flex items-center space-x-4">
          <Link href="/write" className="hidden sm:flex items-center text-white hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Write</span>
          </Link>
          <Link href="/upload" className="hidden sm:flex items-center text-white hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            <span>Upload</span>
          </Link>
          <button className="bg-primary hover:bg-primary-dark text-white py-1 px-4 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;