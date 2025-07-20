"use client";

import { useState } from "react";
import { useCreateOrganization } from "@/hooks/useAdminAPI";

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateOrganizationModal({
  isOpen,
  onClose,
}: CreateOrganizationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    subscriptionTier: "basic" as const,
    maxUsers: 5,
    accessValidTill: "",
  });

  const createOrganization = useCreateOrganization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createOrganization.mutateAsync(formData);

      onClose();
      setFormData({
        name: "",
        code: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        subscriptionTier: "basic",
        maxUsers: 5,
        accessValidTill: "",
      });
    } catch (error) {
      console.error("Failed to create organization:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Create New Organization</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
              placeholder="e.g., ORG001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Subscription Tier
            </label>
            <select
              value={formData.subscriptionTier}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subscriptionTier: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            >
              <option value="basic" className="bg-gray-800 text-white">Basic</option>
              <option value="premium" className="bg-gray-800 text-white">Premium</option>
              <option value="enterprise" className="bg-gray-800 text-white">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Max Users</label>
            <input
              type="number"
              min="1"
              value={formData.maxUsers}
              onChange={(e) =>
                setFormData({ ...formData, maxUsers: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Access Valid Till</label>
            <input
              type="datetime-local"
              value={formData.accessValidTill}
              onChange={(e) =>
                setFormData({ ...formData, accessValidTill: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
              placeholder="Select access expiry date and time"
            />
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
              disabled={createOrganization.isPending}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {createOrganization.isPending
                ? "Creating..."
                : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
