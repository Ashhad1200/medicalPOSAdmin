"use client";

import { useOrganizations, useDeleteOrganization } from "@/hooks/useAdminAPI";
import AdminLayout from "@/components/layout/AdminLayout";
import { useState } from "react";
import CreateOrganizationModal from "@/components/modals/CreateOrganizationModal";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { toast } from "sonner";
import { Database } from "@/config/database.types";
import EditOrganizationModal from "@/components/modals/EditOrganizationModal";
import Link from "next/link";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export default function OrganizationsPage() {
  const { data: orgs, isLoading } = useOrganizations();
  const deleteOrganizationMutation = useDeleteOrganization();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    organization: Organization | null;
  }>({ isOpen: false, organization: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    organization: Organization | null;
  }>({ isOpen: false, organization: null });

  const handleDeleteOrganization = async (reason?: string) => {
    if (!deleteModal.organization) return;

    try {
      const result = await deleteOrganizationMutation.mutateAsync({
        organizationId: deleteModal.organization.id,
        reason,
      });

      // Show success message with user count information
      const userCount = result.deletedUserCount || 0;
      const successMessage =
        userCount > 0
          ? `Organization ${
              deleteModal.organization.name
            } deleted successfully. ${userCount} user${
              userCount !== 1 ? "s" : ""
            } ${userCount !== 1 ? "were" : "was"} also deactivated.`
          : `Organization ${deleteModal.organization.name} deleted successfully.`;

      toast.success(successMessage);
      setDeleteModal({ isOpen: false, organization: null });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete organization"
      );
    }
  };

  const openDeleteModal = (organization: Organization) => {
    setDeleteModal({ isOpen: true, organization });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, organization: null });
  };

  const getDeleteMessage = () => {
    if (!deleteModal.organization) return "";

    const userCount = deleteModal.organization.current_users || 0;
    const orgName = deleteModal.organization.name;

    if (userCount === 0) {
      return `Are you sure you want to delete the organization "${orgName}"? This action cannot be undone.`;
    }

    return `Are you sure you want to delete the organization "${orgName}"? This will also PERMANENTLY DELETE ${userCount} user${
      userCount !== 1 ? "s" : ""
    } associated with this organization. All users will lose access to the system and their data will be removed.`;
  };

  const getDeleteItemName = () => {
    if (!deleteModal.organization) return "";

    const userCount = deleteModal.organization.current_users || 0;
    const baseInfo = `${deleteModal.organization.name} (${deleteModal.organization.code})`;

    if (userCount > 0) {
      return `${baseInfo} + ${userCount} user${userCount !== 1 ? "s" : ""}`;
    }

    return baseInfo;
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Organization Management</h1>
            <p className="text-white/70">Manage organizations, subscriptions, and user allocations</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Organization</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading organizations...</p>
        </div>
      )}

      {orgs && orgs.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No organizations found
          </h3>
          <p className="text-white/60 mb-6">
            Get started by creating your first organization.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            Create Organization
          </button>
        </div>
      )}

      {orgs && orgs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orgs.map((org: any) => (
            <div key={org.id} className="glass-card rounded-xl p-6 hover:scale-105 transition-all duration-300 group">
              {/* Organization Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{org.name}</h3>
                  {org.description && (
                    <p className="text-white/60 text-sm">{org.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      org.is_active
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {org.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Organization Code */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white/80 font-mono text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9l14 0M4 15l14 0" />
                  </svg>
                  {org.code}
                </span>
              </div>

              {/* Subscription Tier */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Subscription Plan</span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                      org.subscription_tier === "enterprise"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : org.subscription_tier === "premium"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {org.subscription_tier}
                  </span>
                </div>
              </div>

              {/* User Statistics */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">User Allocation</span>
                  <span
                    className={`text-sm font-medium ${
                      org.current_users >= org.max_users
                        ? "text-red-400"
                        : org.current_users >= org.max_users * 0.8
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {org.current_users}/{org.max_users}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      org.current_users >= org.max_users
                        ? "bg-red-500"
                        : org.current_users >= org.max_users * 0.8
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min((org.current_users / org.max_users) * 100, 100)}%` }}
                  ></div>
                </div>
                {org.current_users > 0 && (
                  <p className="text-white/50 text-xs mt-1">
                    {org.current_users} active user{org.current_users !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Link
                  href={`/organizations/${org.id}`}
                  className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View Details</span>
                </Link>
                <button
                  onClick={() => setEditModal({ isOpen: true, organization: org })}
                  className="px-3 py-2 btn-secondary flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => openDeleteModal(org)}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 flex items-center space-x-1 ${
                    org.current_users > 0
                      ? "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {org.current_users > 0 && (
                    <span className="text-xs font-bold">-{org.current_users}</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteOrganization}
        title="Delete Organization & All Users"
        message={getDeleteMessage()}
        itemName={getDeleteItemName()}
        isDeleting={deleteOrganizationMutation.isPending}
        dangerLevel="high"
      />

      {editModal.isOpen && (
        <EditOrganizationModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, organization: null })}
          organization={editModal.organization}
        />
      )}
    </AdminLayout>
  );
}
