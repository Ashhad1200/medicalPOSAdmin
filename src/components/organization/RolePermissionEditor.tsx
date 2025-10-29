"use client";

import { useState } from "react";
import { OrganizationPermissions, UserRole, ModuleName, PermissionAction } from "@/config/database.types";
import { getUserPermissions } from "@/utils/permissions";

interface RolePermissionEditorProps {
  role: UserRole;
  organizationPermissions: OrganizationPermissions;
  onUpdateRole: (role: UserRole, updates: any) => void;
  isEditing: boolean;
}

export default function RolePermissionEditor({
  role,
  organizationPermissions,
  onUpdateRole,
  isEditing,
}: RolePermissionEditorProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const rolePermissions = organizationPermissions.roles[role];
  const effectivePermissions = getUserPermissions(organizationPermissions, role);

  const toggleModuleExpansion = (module: ModuleName) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const updateSpecialPermission = (permission: string, add: boolean) => {
    if (!isEditing) return;

    const currentPermissions = [...rolePermissions.special_permissions];
    if (add && !currentPermissions.includes(permission)) {
      currentPermissions.push(permission);
    } else if (!add) {
      const index = currentPermissions.indexOf(permission);
      if (index > -1) {
        currentPermissions.splice(index, 1);
      }
    }

    onUpdateRole(role, {
      ...rolePermissions,
      special_permissions: currentPermissions,
    });
  };

  const updateModuleOverride = (module: ModuleName, action: PermissionAction, value: boolean | null) => {
    if (!isEditing) return;

    const currentOverrides = { ...rolePermissions.module_overrides };
    
    if (!currentOverrides[module]) {
      currentOverrides[module] = { 
        enabled: true,
        actions: {
          create: false,
          read: false,
          update: false,
          delete: false,
          export: false,
          import: false,
        }
      };
    }

    if (value === null) {
      // Remove override (inherit from organization)
      if (currentOverrides[module]?.actions) {
        delete currentOverrides[module].actions[action];
        if (Object.keys(currentOverrides[module].actions).length === 0) {
          delete currentOverrides[module];
        }
      }
    } else {
      if (currentOverrides[module]?.actions) {
        currentOverrides[module].actions[action] = value;
      }
    }

    onUpdateRole(role, {
      ...rolePermissions,
      module_overrides: currentOverrides,
    });
  };

  const updateRestriction = (key: string, value: any) => {
    if (!isEditing) return;

    onUpdateRole(role, {
      ...rolePermissions,
      restrictions: {
        ...rolePermissions.restrictions,
        [key]: value,
      },
    });
  };

  const availableSpecialPermissions = [
    "manage_organization",
    "manage_users",
    "view_audit_logs",
    "manage_integrations",
    "access_api",
    "manage_billing",
    "export_data",
    "import_data",
    "manage_backups",
    "system_admin",
  ];

  const modules = Object.entries(organizationPermissions.modules) as [ModuleName, any][];
  const actions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'export', 'import'];

  return (
    <div className="space-y-6">
      {/* Role Header */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white capitalize">{role} Role</h3>
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <span>Special Permissions: {rolePermissions.special_permissions.length}</span>
            <span>Module Overrides: {Object.keys(rolePermissions.module_overrides).length}</span>
          </div>
        </div>

        {/* Role Description */}
        <p className="text-white/70 text-sm mb-4">
          {getRoleDescription(role)}
        </p>
      </div>

      {/* Special Permissions */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Special Permissions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableSpecialPermissions.map((permission) => {
            const hasPermission = rolePermissions.special_permissions.includes(permission);
            return (
              <label key={permission} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPermission}
                  onChange={(e) => updateSpecialPermission(permission, e.target.checked)}
                  disabled={!isEditing}
                  className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50 disabled:opacity-50"
                />
                <span className="text-sm text-white/70 capitalize">
                  {permission.replace(/_/g, ' ')}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Module Permissions */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Module Permissions</h4>
        <div className="space-y-4">
          {modules.map(([moduleName, modulePermission]) => {
            const isExpanded = expandedModules.has(moduleName);
            const hasOverrides = rolePermissions.module_overrides[moduleName];
            
            return (
              <div key={moduleName} className="border border-white/10 rounded-lg">
                {/* Module Header */}
                <button
                  onClick={() => toggleModuleExpansion(moduleName)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium capitalize">{moduleName}</span>
                    {hasOverrides && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        Custom
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${
                      modulePermission.enabled
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {modulePermission.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-white/60 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Module Actions */}
                {isExpanded && (
                  <div className="p-3 border-t border-white/10 bg-white/2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {actions.map((action) => {
                        const orgPermission = modulePermission.actions[action];
                        const roleOverride = hasOverrides?.actions?.[action];
                        const effectiveValue = roleOverride !== undefined ? roleOverride : orgPermission;
                        const isOverridden = roleOverride !== undefined;

                        return (
                          <div key={action} className="space-y-2">
                            <label className="text-sm font-medium text-white/80 capitalize">
                              {action}
                            </label>
                            <div className="space-y-1">
                              {/* Inherit Option */}
                              <label className="flex items-center space-x-2 text-xs">
                                <input
                                  type="radio"
                                  name={`${moduleName}-${action}`}
                                  checked={!isOverridden}
                                  onChange={() => updateModuleOverride(moduleName, action, null)}
                                  disabled={!isEditing}
                                  className="text-purple-500 focus:ring-purple-500/50 disabled:opacity-50"
                                />
                                <span className="text-white/60">
                                  Inherit ({orgPermission ? "✓" : "✗"})
                                </span>
                              </label>
                              
                              {/* Allow Option */}
                              <label className="flex items-center space-x-2 text-xs">
                                <input
                                  type="radio"
                                  name={`${moduleName}-${action}`}
                                  checked={isOverridden && roleOverride === true}
                                  onChange={() => updateModuleOverride(moduleName, action, true)}
                                  disabled={!isEditing}
                                  className="text-green-500 focus:ring-green-500/50 disabled:opacity-50"
                                />
                                <span className="text-green-400">Allow</span>
                              </label>
                              
                              {/* Deny Option */}
                              <label className="flex items-center space-x-2 text-xs">
                                <input
                                  type="radio"
                                  name={`${moduleName}-${action}`}
                                  checked={isOverridden && roleOverride === false}
                                  onChange={() => updateModuleOverride(moduleName, action, false)}
                                  disabled={!isEditing}
                                  className="text-red-500 focus:ring-red-500/50 disabled:opacity-50"
                                />
                                <span className="text-red-400">Deny</span>
                              </label>
                            </div>
                            
                            {/* Effective Permission Indicator */}
                            <div className={`text-center py-1 px-2 rounded text-xs font-medium ${
                              effectiveValue
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}>
                              {effectiveValue ? "✓" : "✗"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Restrictions */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Role Restrictions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Max Records Per Query
            </label>
            {isEditing ? (
              <input
                type="number"
                value={rolePermissions.restrictions.max_records_per_query}
                onChange={(e) => updateRestriction('max_records_per_query', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500/50"
                min="1"
                max="10000"
              />
            ) : (
              <div className="text-white">{rolePermissions.restrictions.max_records_per_query}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Rate Limit (per hour)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={rolePermissions.restrictions.rate_limit_per_hour}
                onChange={(e) => updateRestriction('rate_limit_per_hour', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500/50"
                min="1"
                max="10000"
              />
            ) : (
              <div className="text-white">{rolePermissions.restrictions.rate_limit_per_hour}</div>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rolePermissions.restrictions.sensitive_data_access}
                onChange={(e) => updateRestriction('sensitive_data_access', e.target.checked)}
                disabled={!isEditing}
                className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50 disabled:opacity-50"
              />
              <span className="text-sm text-white/70">Sensitive Data Access</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get role descriptions
function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    admin: "Full system access with ability to manage organization settings, users, and all modules.",
    manager: "Management access with ability to oversee operations, manage users, and access most modules.",
    counter: "Point-of-sale access with permissions to process sales, manage inventory, and view reports.",
    user: "Standard user access with limited permissions based on organization configuration.",
    customer: "Customer access with ability to view orders and place new orders.",
    restricted: "Minimal access with read-only permissions to basic functionality.",
  };
  return descriptions[role] || "Role description not available";
}