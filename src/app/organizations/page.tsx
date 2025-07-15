"use client";

import { useOrganizations, useDeleteOrganization } from "@/hooks/useAdminAPI";
import AdminLayout from "@/components/layout/AdminLayout";
import { useState } from "react";
import CreateOrganizationModal from "@/components/modals/CreateOrganizationModal";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { toast } from "sonner";
import { Database } from "@/config/database.types";
import EditOrganizationModal from "@/components/modals/EditOrganizationModal";

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Organizations</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create Organization
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading organizations...</p>
        </div>
      )}

      {orgs && orgs.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No organizations found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new organization.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Organization
            </button>
          </div>
        </div>
      )}

      {orgs && orgs.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-900">Name</th>
                <th className="px-4 py-3 font-medium text-gray-900">Code</th>
                <th className="px-4 py-3 font-medium text-gray-900">Plan</th>
                <th className="px-4 py-3 font-medium text-gray-900">Users</th>
                <th className="px-4 py-3 font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {org.name}
                      </div>
                      {org.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {org.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {org.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        org.subscription_tier === "enterprise"
                          ? "bg-purple-100 text-purple-800"
                          : org.subscription_tier === "premium"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {org.subscription_tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-medium ${
                        org.current_users >= org.max_users
                          ? "text-red-600"
                          : org.current_users >= org.max_users * 0.8
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {org.current_users}/{org.max_users}
                    </span>
                    {org.current_users > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {org.current_users} active user
                        {org.current_users !== 1 ? "s" : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        org.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {org.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setEditModal({ isOpen: true, organization: org })
                        }
                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(org)}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-xs font-medium focus:outline-none focus:ring-2 ${
                          org.current_users > 0
                            ? "border-red-400 text-red-800 bg-red-100 hover:bg-red-200 focus:ring-red-500"
                            : "border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500"
                        }`}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
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
                        Delete
                        {org.current_users > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-red-200 text-red-800 rounded text-xs font-bold">
                            -{org.current_users}
                          </span>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
