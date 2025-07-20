"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useAdminAPI";
import AdminLayout from "@/components/layout/AdminLayout";
import { useState } from "react";
import UserAccessModal from "@/components/modals/UserAccessModal";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string | undefined;

  const { data: user, isLoading: userLoading } = useUser(userId || "");

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">User Profile</h1>
            <p className="text-white/70">Detailed user information and account management</p>
          </div>
        </div>
      </div>

      {userLoading && (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading user details...</p>
        </div>
      )}
      
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main User Info */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                  {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
                  <p className="text-white/60">{user.email}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsAccessModalOpen(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Manage Access</span>
                </button>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  <span className="text-white/60 text-sm">Role</span>
                </div>
                <p className="text-white font-medium capitalize">{user.role}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-white/60 text-sm">Organization</span>
                </div>
                <p className="text-white font-medium">{user.organization?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  user.isActive ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <h3 className="text-lg font-semibold text-white">Account Status</h3>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  user.isActive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <h3 className="text-lg font-semibold text-white">Subscription</h3>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  user.subscriptionStatus === "active"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                }`}
              >
                {user.subscriptionStatus}
              </span>
            </div>
          </div>
        </div>
      )}



      <UserAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        user={user}
      />
    </AdminLayout>
  );
}
