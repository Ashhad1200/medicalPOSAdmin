"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-full animated-bg">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 glass-card border-b border-white/10 flex items-center justify-between px-8 backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold gradient-text">POS Admin Panel</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></span>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3 glass rounded-full px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-white/90 hidden sm:block font-medium">
                {user?.email}
              </span>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Floating Background Elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl floating"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-500/10 rounded-full blur-xl floating" style={{animationDelay: '2s'}}></div>
          
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
