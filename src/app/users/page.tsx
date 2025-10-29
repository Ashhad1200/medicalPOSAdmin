"use client";

import { useUsers, useDeleteUser } from "@/hooks/useBackendAPI";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { useState } from "react";
import CreateUserModal from "@/components/modals/CreateUserModal";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  organizationId: string;
}

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });

  const deleteUser = useDeleteUser();

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;

    try {
      await deleteUser.mutateAsync(deleteModal.user.id);

      toast.success(
        `User ${deleteModal.user.username} has been deleted successfully`
      );
      setDeleteModal({ isOpen: false, user: null });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    }
  };

  const openDeleteModal = (user: User) => {
    setDeleteModal({ isOpen: true, user });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  return (
    <ProtectedRoute module="users" action="read">
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="glass-card rounded-2xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  <span className="gradient-text">User Management</span>
                </h1>
                <p className="text-white/70">
                  Manage user accounts, roles, and permissions across your
                  organization.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="glass rounded-xl px-6 py-3 text-white font-medium hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create User</span>
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-4"></div>
              <p className="text-white/70 text-lg">Loading users...</p>
            </div>
          )}

          {error && (
            <div className="glass-card rounded-2xl p-6 border border-red-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-white font-medium">
                  {(error as Error).message}
                </p>
              </div>
            </div>
          )}

          {users && users.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No users found
              </h3>
              <p className="text-white/70 mb-8">
                Get started by creating your first user account.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="glass rounded-xl px-8 py-4 text-white font-medium hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create First User</span>
              </button>
            </div>
          )}

          {users && users.length > 0 && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Total Users</p>
                      <p className="text-white text-xl font-bold">
                        {users.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Active Users</p>
                      <p className="text-white text-xl font-bold">
                        {users.filter((u) => u.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Admin Users</p>
                      <p className="text-white text-xl font-bold">
                        {users.filter((u) => u.role === "admin").length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Grid */}
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  All Users
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="glass rounded-xl p-6 hover:scale-105 transition-all duration-300"
                    >
                      {/* User Header */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          {u.username?.charAt(0).toUpperCase() ||
                            u.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/users/${u.id}`}
                            className="text-white font-semibold hover:text-purple-300 transition-colors block truncate"
                          >
                            {u.username}
                          </Link>
                          <p className="text-white/60 text-sm truncate">
                            {u.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              u.isActive
                                ? "bg-green-400 animate-pulse"
                                : "bg-red-400"
                            }`}
                          ></div>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="space-y-3 mb-4">
                        {u.fullName && (
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4 text-white/60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span className="text-white/80 text-sm">
                              {u.fullName}
                            </span>
                          </div>
                        )}
                        {u.phone && (
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4 text-white/60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span className="text-white/80 text-sm">
                              {u.phone}
                            </span>
                          </div>
                        )}
                        {u.lastLogin && (
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4 text-white/60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-white/80 text-sm">
                              {new Date(u.lastLogin).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30">
                          {u.role || "user"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.isActive
                              ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30"
                              : "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {u.isActive ? "active" : "inactive"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Link
                          href={`/users/${u.id}`}
                          className="flex-1 glass rounded-lg px-3 py-2 text-center text-white text-sm font-medium hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span>View</span>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(u)}
                          className="glass rounded-lg px-3 py-2 text-red-300 text-sm font-medium hover:scale-105 transition-all duration-300 flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />

          <DeleteConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteUser}
            title="Delete User"
            message="Are you sure you want to delete this user? This will deactivate the user account and they will no longer be able to access the system."
            itemName={
              deleteModal.user
                ? `${deleteModal.user.username} (${deleteModal.user.email})`
                : ""
            }
            isDeleting={deleteUser.isPending}
            dangerLevel="high"
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
