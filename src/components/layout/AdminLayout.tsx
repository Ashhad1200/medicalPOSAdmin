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
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 shadow-sm">
          <h1 className="text-lg font-semibold">POS Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-900 hidden sm:block font-medium">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
