"use client";

import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/components/auth/LoginPage";
import Dashboard from "@/components/dashboard/Dashboard";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Home() {
  const { user, appUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !appUser) {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute module="dashboard" action="read">
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    </ProtectedRoute>
  );
}
