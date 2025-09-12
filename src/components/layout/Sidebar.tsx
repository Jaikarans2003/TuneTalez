'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user, profile, isAdmin } = useAuth();
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
            
            {/* Admin link - visible to all users */}
            <li>
              <Link href="/admin/auth" className="flex items-center py-2 px-4 rounded-lg hover:bg-[#303030] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Divider */}
        <div className="border-t border-[#303030] my-2"></div>
        
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