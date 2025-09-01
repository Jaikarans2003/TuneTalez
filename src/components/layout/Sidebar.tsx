'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside className={`bg-[#212121] text-white w-64 fixed left-0 top-16 bottom-0 overflow-y-auto transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col h-full">
        {/* Main navigation */}
        <nav className="py-4 px-4">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="flex items-center py-2 px-4 rounded-lg hover:bg-[#303030] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/liked" className="flex items-center py-2 px-4 rounded-lg hover:bg-[#303030] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Liked</span>
              </Link>
            </li>
            <li>
              <Link href="/saved" className="flex items-center py-2 px-4 rounded-lg hover:bg-[#303030] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>Saved</span>
              </Link>
            </li>
            <li>
              <Link href="/orders" className="flex items-center py-2 px-4 rounded-lg hover:bg-[#303030] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Orders</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Divider */}
        <div className="border-t border-[#303030] my-2"></div>
        
        {/* Library section */}
        <div className="px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Library</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/write" className="flex items-center py-2 px-4 rounded-lg hover:bg-[#303030] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Write Book</span>
              </Link>
            </li>
            <li>
              <Link href="/upload" className="flex items-center py-2 px-4 rounded-lg hover:bg-[#303030] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                <span>Upload PDF</span>
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Spacer to push footer to bottom */}
        <div className="flex-grow"></div>
        
        {/* Footer */}
        <div className="mt-auto border-t border-[#303030] py-4 px-6">
          <div className="text-sm text-gray-400">
            <h3 className="font-bold text-primary mb-1">TuneTalez</h3>
            <p className="text-xs mb-2">Write books and upload PDF files with ease</p>
            <p>&copy; {new Date().getFullYear()} TuneTalez</p>
            <p className="text-xs">All rights reserved.</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;