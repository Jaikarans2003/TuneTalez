'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { FaHome, FaHeart, FaBookmark, FaUpload, FaBars, FaTimes } from 'react-icons/fa';

interface LandingSidebarProps {
  isOpen?: boolean;
}

const LandingSidebar: React.FC<LandingSidebarProps> = ({ isOpen = true }) => {
  const { user, profile, isAdmin } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Determine if sidebar should be visible
  const isSidebarVisible = isOpen || mobileOpen;
  
  return (
    <>
      {/* Mobile toggle button - only visible on small screens */}
      <button 
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 bottom-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg md:hidden"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      
      <div className={`bg-gradient-to-b from-[#1A1A1A] to-[#212121] text-white w-20 h-[calc(100vh-4rem)] fixed left-0 top-15 overflow-y-auto z-40 border-r border-gray-800 transition-transform duration-300 ${!isSidebarVisible ? '-translate-x-full' : 'translate-x-0'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* No logo needed since we already have one in the header */}
          
          {/* Main navigation */}
          <nav className="pt-4">
            <ul className="space-y-8 flex flex-col items-center">
              <li>
                <Link 
                  href="/" 
                  className="flex flex-col items-center justify-center transition-all duration-300 group"
                >
                  <div className={`${isActive('/') ? 'bg-primary/20 text-primary' : 'bg-gray-800/50 text-gray-400 group-hover:bg-gray-700/70 group-hover:text-gray-200'} p-3 rounded-lg transition-all duration-300 flex items-center justify-center w-12 h-12`}>
                    <FaHome className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1 text-gray-400 group-hover:text-white">Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/liked" 
                  className="flex flex-col items-center justify-center transition-all duration-300 group"
                >
                  <div className={`${isActive('/liked') ? 'bg-primary/20 text-primary' : 'bg-gray-800/50 text-gray-400 group-hover:bg-gray-700/70 group-hover:text-gray-200'} p-3 rounded-lg transition-all duration-300 flex items-center justify-center w-12 h-12`}>
                    <FaHeart className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1 text-gray-400 group-hover:text-white">Liked</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/saved" 
                  className="flex flex-col items-center justify-center transition-all duration-300 group"
                >
                  <div className={`${isActive('/saved') ? 'bg-primary/20 text-primary' : 'bg-gray-800/50 text-gray-400 group-hover:bg-gray-700/70 group-hover:text-gray-200'} p-3 rounded-lg transition-all duration-300 flex items-center justify-center w-12 h-12`}>
                    <FaBookmark className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1 text-gray-400 group-hover:text-white">Saved</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/upload" 
                  className="flex flex-col items-center justify-center transition-all duration-300 group"
                >
                  <div className={`${isActive('/upload') ? 'bg-primary/20 text-primary' : 'bg-gray-800/50 text-gray-400 group-hover:bg-gray-700/70 group-hover:text-gray-200'} p-3 rounded-lg transition-all duration-300 flex items-center justify-center w-12 h-12`}>
                    <FaUpload className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1 text-gray-400 group-hover:text-white">Upload</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Spacer to push footer to bottom */}
          <div className="flex-grow"></div>
          
          {/* Footer - simplified */}
          <div className="mt-auto border-t border-gray-800/50 py-4 flex justify-center">
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
              <span className="text-primary font-bold text-xs">TT</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingSidebar;