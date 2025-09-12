'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/firebase/services';

interface HeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isOpen, setIsOpen }) => {
  const { user, profile, logout, updateRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        
        {/* Right section - Sign in button or User profile */}
        <div className="flex items-center space-x-4">
          
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-white hover:text-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium">{user.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="hidden md:block">
                  <span className="block">{user.displayName || user.email?.split('@')[0]}</span>
                  {profile && (
                    <span className="text-xs text-gray-400 capitalize">{profile.role}</span>
                  )}
                </div>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1F1F1F] rounded-md shadow-lg py-1 z-50">
                <Link 
                  href="/profile"
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#303030] transition-colors"
                >
                  View Profile
                </Link>
                {profile && (
                  <div className="px-4 py-2 border-b border-t border-gray-700">
                    <p className="text-sm text-white">Account Type</p>
                    <div className="flex mt-1 space-x-2">
                      <button 
                        onClick={() => updateRole('reader')}
                        className={`text-xs px-2 py-1 rounded ${profile.role === 'reader' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                      >
                        Reader
                      </button>
                      <button 
                        onClick={() => updateRole('author')}
                        className={`text-xs px-2 py-1 rounded ${profile.role === 'author' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                      >
                        Author
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#303030] transition-colors"
                >
                  Sign Out
                </button>
              </div>
              )}
            </div>
          ) : (
            <Link href="/auth/signin" className="bg-primary hover:bg-primary-dark text-white py-1 px-4 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;