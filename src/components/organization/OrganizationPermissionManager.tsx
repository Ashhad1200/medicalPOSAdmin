"use client";

import { useState, useMemo } from "react";
import { useOrganizationPermissions, useUpdateOrganizationPermissions, useResetOrganizationPermissions } from "@/hooks/useAdminAPI";
import { OrganizationPermissions, UserRole, ModuleName, PermissionAction } from "@/config/database.types";
import { toast } from "sonner";
import { DEFAULT_ORGANIZATION_PERMISSIONS } from "@/utils/permissions";
import { useAuth } from "@/hooks/useAuth";

interface OrganizationPermissionManagerProps {
  organizationId: string;
}

type TabType = "modules" | "roles" | "features" | "policies";

export default function OrganizationPermissionManager({ organizationId }: OrganizationPermissionManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("modules");
  const [isEditing, setIsEditing] = useState(false);
  const [localPermissions, setLocalPermissions] = useState<OrganizationPermissions | null>(null);

  const { appUser } = useAuth();
  const { data: permissions, isLoading } = useOrganizationPermissions(organizationId);
  const updatePermissions = useUpdateOrganizationPermissions();
  const resetPermissions = useResetOrganizationPermissions();

  // Use local state when editing, otherwise use fetched data
  const currentPermissions = isEditing ? localPermissions : permissions;

  const handleStartEdit = () => {
    if (permissions) {
      setLocalPermissions(JSON.parse(JSON.stringify(permissions)));
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setLocalPermissions(null);
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!localPermissions || !appUser?.id) return;

    try {
      await updatePermissions.mutateAsync({
        organizationId,
        permissions: localPermissions,
        updatedBy: appUser.id,
        reason: "Updated via organization permission manager",
      });
      toast.success("Permissions updated successfully");
      setIsEditing(false);
      setLocalPermissions(null);
    } catch (error) {
      toast.error("Failed to update permissions");
      console.error("Error updating permissions:", error);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm("Are you sure you want to reset all permissions to defaults? This action cannot be undone.")) {
      return;
    }

    if (!appUser?.id) {
      toast.error("User authentication required");
      return;
    }

    try {
      await resetPermissions.mutateAsync({
        organizationId,
        resetBy: appUser.id,
        reason: "Reset to defaults via organization permission manager",
      });
      toast.success("Permissions reset to defaults");
      setIsEditing(false);
      setLocalPermissions(null);
    } catch (error) {
      toast.error("Failed to reset permissions");
      console.error("Error resetting permissions:", error);
    }
  };

  const updateModulePermission = (module: ModuleName, action: PermissionAction, value: boolean) => {
    if (!localPermissions) return;

    setLocalPermissions({
      ...localPermissions,
      modules: {
        ...localPermissions.modules,
        [module]: {
          ...localPermissions.modules[module],
          actions: {
            ...localPermissions.modules[module].actions,
            [action]: value,
          },
        },
      },
    });
  };

  const updateModuleEnabled = (module: ModuleName, enabled: boolean) => {
    if (!localPermissions) return;

    setLocalPermissions({
      ...localPermissions,
      modules: {
        ...localPermissions.modules,
        [module]: {
          ...localPermissions.modules[module],
          enabled,
        },
      },
    });
  };

  const updateRolePermission = (role: UserRole, moduleOverrides: any) => {
    if (!localPermissions) return;

    setLocalPermissions({
      ...localPermissions,
      roles: {
        ...localPermissions.roles,
        [role]: {
          ...localPermissions.roles[role],
          module_overrides: moduleOverrides,
        },
      },
    });
  };

  const updateFeature = (feature: keyof OrganizationPermissions['features'], enabled: boolean) => {
    if (!localPermissions) return;

    setLocalPermissions({
      ...localPermissions,
      features: {
        ...localPermissions.features,
        [feature]: enabled,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
        <p className="mt-4 text-white/70 text-center">Loading permissions...</p>
      </div>
    );
  }

  if (!currentPermissions) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-white/70">No permissions found for this organization.</p>
        <button
          onClick={handleResetToDefaults}
          className="mt-4 btn-primary"
        >
          Initialize Default Permissions
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "modules" as TabType, name: "Modules", icon: "🏗️" },
    { id: "roles" as TabType, name: "Roles", icon: "👥" },
    { id: "features" as TabType, name: "Features", icon: "⚡" },
    { id: "policies" as TabType, name: "Policies", icon: "🔒" },
  ];

  return (
    <div className="glass-card rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Organization Permissions</h2>
          <p className="text-white/60">Configure access control and feature availability</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={handleStartEdit}
                className="btn-secondary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
              <button
                onClick={handleResetToDefaults}
                className="btn-danger flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset to Defaults</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={updatePermissions.isPending}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{updatePermissions.isPending ? "Saving..." : "Save Changes"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "modules" && (
          <ModulesTab
            permissions={currentPermissions}
            isEditing={isEditing}
            onUpdateModulePermission={updateModulePermission}
            onUpdateModuleEnabled={updateModuleEnabled}
          />
        )}
        {activeTab === "roles" && (
          <RolesTab
            permissions={currentPermissions}
            isEditing={isEditing}
            onUpdateRolePermission={updateRolePermission}
          />
        )}
        {activeTab === "features" && (
          <FeaturesTab
            permissions={currentPermissions}
            isEditing={isEditing}
            onUpdateFeature={updateFeature}
          />
        )}
        {activeTab === "policies" && (
          <PoliciesTab
            permissions={currentPermissions}
            isEditing={isEditing}
          />
        )}
      </div>
    </div>
  );
}

// Modules Tab Component
function ModulesTab({
  permissions,
  isEditing,
  onUpdateModulePermission,
  onUpdateModuleEnabled,
}: {
  permissions: OrganizationPermissions;
  isEditing: boolean;
  onUpdateModulePermission: (module: ModuleName, action: PermissionAction, value: boolean) => void;
  onUpdateModuleEnabled: (module: ModuleName, enabled: boolean) => void;
}) {
  const modules = Object.entries(permissions.modules) as [ModuleName, any][];
  const actions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'export', 'import'];

  return (
    <div className="space-y-6">
      {modules.map(([moduleName, modulePermission]) => (
        <div key={moduleName} className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-white capitalize">{moduleName}</h3>
              {isEditing && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={modulePermission.enabled}
                    onChange={(e) => onUpdateModuleEnabled(moduleName, e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                  />
                  <span className="text-sm text-white/70">Enabled</span>
                </label>
              )}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              modulePermission.enabled
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {modulePermission.enabled ? "Enabled" : "Disabled"}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {actions.map((action) => (
              <div key={action} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={modulePermission.actions[action]}
                  onChange={(e) => isEditing && onUpdateModulePermission(moduleName, action, e.target.checked)}
                  disabled={!isEditing || !modulePermission.enabled}
                  className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50 disabled:opacity-50"
                />
                <span className={`text-sm capitalize ${
                  modulePermission.enabled ? "text-white/70" : "text-white/40"
                }`}>
                  {action}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Roles Tab Component
function RolesTab({
  permissions,
  isEditing,
  onUpdateRolePermission,
}: {
  permissions: OrganizationPermissions;
  isEditing: boolean;
  onUpdateRolePermission: (role: UserRole, moduleOverrides: any) => void;
}) {
  const roles = Object.entries(permissions.roles) as [UserRole, any][];

  return (
    <div className="space-y-6">
      {roles.map(([roleName, rolePermission]) => (
        <div key={roleName} className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white capitalize">{roleName}</h3>
            <div className="flex items-center space-x-4 text-sm text-white/60">
              <span>Special Permissions: {rolePermission.special_permissions.length}</span>
              <span>Module Overrides: {Object.keys(rolePermission.module_overrides).length}</span>
            </div>
          </div>

          {/* Special Permissions */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white/80 mb-2">Special Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {rolePermission.special_permissions.map((permission: string) => (
                <span
                  key={permission}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">Restrictions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-white/60">Max Records:</span>
                <span className="text-white">{rolePermission.restrictions.max_records_per_query}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/60">Rate Limit:</span>
                <span className="text-white">{rolePermission.restrictions.rate_limit_per_hour}/hour</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/60">Sensitive Data:</span>
                <span className={rolePermission.restrictions.sensitive_data_access ? "text-green-400" : "text-red-400"}>
                  {rolePermission.restrictions.sensitive_data_access ? "Allowed" : "Denied"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Features Tab Component
function FeaturesTab({
  permissions,
  isEditing,
  onUpdateFeature,
}: {
  permissions: OrganizationPermissions;
  isEditing: boolean;
  onUpdateFeature: (feature: keyof OrganizationPermissions['features'], enabled: boolean) => void;
}) {
  const features = Object.entries(permissions.features);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map(([featureName, enabled]) => (
        <div key={featureName} className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white capitalize">
                {featureName.replace(/_/g, ' ')}
              </h3>
              <p className="text-sm text-white/60 mt-1">
                {getFeatureDescription(featureName)}
              </p>
            </div>
            {isEditing ? (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => onUpdateFeature(featureName as keyof OrganizationPermissions['features'], e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                />
                <span className="text-sm text-white/70">Enabled</span>
              </label>
            ) : (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                enabled
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                {enabled ? "Enabled" : "Disabled"}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Policies Tab Component
function PoliciesTab({
  permissions,
  isEditing,
}: {
  permissions: OrganizationPermissions;
  isEditing: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Security Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Session Timeout (minutes)</label>
            <div className="text-white">{permissions.policies.session_timeout}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Max Concurrent Sessions</label>
            <div className="text-white">{permissions.policies.max_concurrent_sessions}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Data Retention (days)</label>
            <div className="text-white">{permissions.policies.data_retention_days}</div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">IP Restrictions</h3>
        {permissions.policies.ip_restrictions.length > 0 ? (
          <div className="space-y-2">
            {permissions.policies.ip_restrictions.map((ip, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-white/70 font-mono">{ip}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/60">No IP restrictions configured</p>
        )}
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Time Restrictions</h3>
        {permissions.policies.time_restrictions.length > 0 ? (
          <div className="space-y-2">
            {permissions.policies.time_restrictions.map((restriction, index) => (
              <div key={index} className="flex items-center space-x-4 text-sm">
                <span className="text-white/70">{restriction.start_time} - {restriction.end_time}</span>
                <span className="text-white/60">{restriction.days.join(", ")}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/60">No time restrictions configured</p>
        )}
      </div>
    </div>
  );
}

// Helper function to get feature descriptions
function getFeatureDescription(featureName: string): string {
  const descriptions: Record<string, string> = {
    advanced_analytics: "Access to detailed analytics and reporting features",
    multi_location: "Support for multiple store locations and inventory management",
    api_access: "Access to REST API for third-party integrations",
    custom_reports: "Ability to create and customize reports",
    bulk_operations: "Perform bulk operations on data (import/export/update)",
  };
  return descriptions[featureName] || "Feature description not available";
}