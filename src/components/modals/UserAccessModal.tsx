"use client";

import { useState } from "react";
import { useUpdateUser } from "@/hooks/useAdminAPI";

interface UserAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function UserAccessModal({
  isOpen,
  onClose,
  user,
}: UserAccessModalProps) {
  const [formData, setFormData] = useState({
    isActive: user?.isActive || false,
    subscriptionStatus: user?.subscriptionStatus || "pending",
    accessValidTill: user?.accessValidTill
      ? user.accessValidTill.split("T")[0]
      : undefined,
    role: user?.role || "user",
    isTrialUser: user?.isTrialUser || false,
  });

  const updateUser = useUpdateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateUser.mutateAsync({
        userId: user.id,
        updates: {
          ...formData,
          accessValidTill: formData.accessValidTill
            ? new Date(formData.accessValidTill).toISOString()
            : undefined,
        },
        reason: "Admin access control update",
      });

      onClose();
    } catch (error) {
      console.error("Failed to update user access:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Manage User Access</h2>
            <p className="text-sm text-gray-300 mt-1">User: {user?.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                  formData.isActive
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white/10 border-white/30'
                }`}>
                  {formData.isActive && (
                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium text-white">Active Account</span>
                <p className="text-xs text-gray-400 mt-1">
                  Inactive users cannot access the POS system
                </p>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Subscription Status
            </label>
            <select
              value={formData.subscriptionStatus}
              onChange={(e) =>
                setFormData({ ...formData, subscriptionStatus: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            >
              <option value="pending" className="bg-gray-800 text-white">Pending</option>
              <option value="active" className="bg-gray-800 text-white">Active</option>
              <option value="suspended" className="bg-gray-800 text-white">Suspended</option>
              <option value="expired" className="bg-gray-800 text-white">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Access Valid Until
            </label>
            <input
              type="date"
              value={formData.accessValidTill || ""}
              onChange={(e) =>
                setFormData({ ...formData, accessValidTill: e.target.value || undefined })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            />
            <p className="text-xs text-gray-400 mt-1">
              Leave empty for unlimited access
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            >
              <option value="user" className="bg-gray-800 text-white">User</option>
              <option value="manager" className="bg-gray-800 text-white">Manager</option>
              <option value="admin" className="bg-gray-800 text-white">Admin</option>
            </select>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isTrialUser}
                  onChange={(e) =>
                    setFormData({ ...formData, isTrialUser: e.target.checked })
                  }
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                  formData.isTrialUser
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white/10 border-white/30'
                }`}>
                  {formData.isTrialUser && (
                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium text-white">Trial User</span>
                <p className="text-xs text-gray-400 mt-1">
                  Trial users have limited access and features
                </p>
              </div>
            </label>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-sm font-medium text-amber-300">
                Access Summary
              </h4>
            </div>
            <div className="text-xs text-amber-200 space-y-1">
              <p>• Status: {formData.isActive ? "Active" : "Inactive"}</p>
              <p>• Subscription: {formData.subscriptionStatus}</p>
              <p>• Role: {formData.role}</p>
              {formData.accessValidTill && (
                <p>• Valid until: {formData.accessValidTill}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 font-medium backdrop-blur-sm hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateUser.isPending}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {updateUser.isPending ? "Updating..." : "Update Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
