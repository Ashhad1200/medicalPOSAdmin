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
      : "",
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
            : null,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Manage User Access</h2>
        <p className="text-sm text-gray-600 mb-4">User: {user?.username}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm font-medium">Active Account</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Inactive users cannot access the POS system
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Subscription Status
            </label>
            <select
              value={formData.subscriptionStatus}
              onChange={(e) =>
                setFormData({ ...formData, subscriptionStatus: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Access Valid Until
            </label>
            <input
              type="date"
              value={formData.accessValidTill}
              onChange={(e) =>
                setFormData({ ...formData, accessValidTill: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited access
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isTrialUser}
                onChange={(e) =>
                  setFormData({ ...formData, isTrialUser: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm font-medium">Trial User</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Trial users have limited access and features
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Access Summary
            </h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>• Status: {formData.isActive ? "Active" : "Inactive"}</p>
              <p>• Subscription: {formData.subscriptionStatus}</p>
              <p>• Role: {formData.role}</p>
              {formData.accessValidTill && (
                <p>• Valid until: {formData.accessValidTill}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateUser.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updateUser.isPending ? "Updating..." : "Update Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
