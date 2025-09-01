'use client';

import { useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

// Metadata is handled in a separate metadata.ts file when using 'use client'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-background`}>
        <Header isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex flex-1 pt-16"> {/* pt-16 to account for fixed header height */}
          <Sidebar isOpen={sidebarOpen} />
          <main className="flex-grow md:ml-64 px-4 py-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </body>
    </html>
  );
}
