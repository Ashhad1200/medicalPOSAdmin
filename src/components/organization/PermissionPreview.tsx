"use client";

import { useMemo } from "react";
import { OrganizationPermissions, UserRole, ModuleName, PermissionAction } from "@/config/database.types";
import { getUserPermissions, hasPermission } from "@/utils/permissions";

interface PermissionPreviewProps {
  organizationPermissions: OrganizationPermissions;
  userRole: UserRole;
  compact?: boolean;
  showFeatures?: boolean;
  className?: string;
}

export default function PermissionPreview({
  organizationPermissions,
  userRole,
  compact = false,
  showFeatures = true,
  className = "",
}: PermissionPreviewProps) {
  const effectivePermissions = useMemo(() => {
    return getUserPermissions(organizationPermissions, userRole);
  }, [organizationPermissions, userRole]);

  const rolePermissions = organizationPermissions.roles[userRole];

  if (!effectivePermissions || !rolePermissions) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-lg p-4 ${className}`}>
        <p className="text-red-400 text-sm">Unable to calculate permissions for role: {userRole}</p>
      </div>
    );
  }

  const modules = Object.entries(effectivePermissions.modules) as [ModuleName, any][];
  const actions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'export', 'import'];

  if (compact) {
    return (
      <div className={`bg-white/5 border border-white/10 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Permission Summary</h4>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium capitalize">
            {userRole}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          {modules.map(([moduleName, modulePermission]) => {
            const enabledActions = actions.filter(action => 
              modulePermission.enabled && modulePermission.actions[action]
            );
            
            return (
              <div key={moduleName} className="flex items-center justify-between">
                <span className="text-white/70 capitalize">{moduleName}</span>
                <div className="flex space-x-1">
                  {enabledActions.length > 0 ? (
                    <span className="text-green-400">{enabledActions.length} actions</span>
                  ) : (
                    <span className="text-red-400">No access</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showFeatures && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Special Permissions</span>
              <span className="text-purple-300">{rolePermissions.special_permissions.length}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Permission Preview</h3>
          <p className="text-white/60 text-sm mt-1">
            Effective permissions for <span className="capitalize font-medium">{userRole}</span> role
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium capitalize">
            {userRole}
          </span>
        </div>
      </div>

      {/* Special Permissions */}
      {rolePermissions.special_permissions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-3">Special Permissions</h4>
          <div className="flex flex-wrap gap-2">
            {rolePermissions.special_permissions.map((permission) => (
              <span
                key={permission}
                className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium"
              >
                {permission.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Module Permissions */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-4">Module Access</h4>
        <div className="space-y-4">
          {modules.map(([moduleName, modulePermission]) => {
            const hasOverrides = rolePermissions.module_overrides[moduleName];
            
            return (
              <div key={moduleName} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h5 className="font-medium text-white capitalize">{moduleName}</h5>
                    {hasOverrides && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    modulePermission.enabled
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {modulePermission.enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>

                {modulePermission.enabled && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {actions.map((action) => {
                      const hasAccess = modulePermission.actions[action];
                      const isOverridden = hasOverrides?.actions?.[action] !== undefined;
                      
                      return (
                        <div key={action} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            hasAccess ? "bg-green-400" : "bg-red-400"
                          }`} />
                          <span className={`text-xs capitalize ${
                            hasAccess ? "text-white" : "text-white/50"
                          }`}>
                            {action}
                          </span>
                          {isOverridden && (
                            <span className="text-orange-300 text-xs">*</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Features */}
      {showFeatures && organizationPermissions?.features && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-4">Available Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(organizationPermissions.features).map(([featureName, enabled]) => (
              <div key={featureName} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                <span className="text-white/70 text-sm capitalize">
                  {featureName.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restrictions */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-4">Role Restrictions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
            <span className="text-white/70">Max Records</span>
            <span className="text-white font-medium">{rolePermissions.restrictions.max_records_per_query}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
            <span className="text-white/70">Rate Limit</span>
            <span className="text-white font-medium">{rolePermissions.restrictions.rate_limit_per_hour}/hour</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
            <span className="text-white/70">Sensitive Data</span>
            <div className={`w-3 h-3 rounded-full ${
              rolePermissions.restrictions.sensitive_data_access ? "bg-green-400" : "bg-red-400"
            }`} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center space-x-6 text-xs text-white/60">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Allowed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span>Denied</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-orange-300">*</span>
            <span>Role Override</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility component for quick permission checks
export function QuickPermissionCheck({
  organizationPermissions,
  userRole,
  module,
  action,
  className = "",
}: {
  organizationPermissions: OrganizationPermissions;
  userRole: UserRole;
  module: ModuleName;
  action: PermissionAction;
  className?: string;
}) {
  const hasAccess = hasPermission(organizationPermissions, userRole, module, action);
  
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        hasAccess ? "bg-green-400" : "bg-red-400"
      }`} />
      <span className={`text-xs ${
        hasAccess ? "text-green-400" : "text-red-400"
      }`}>
        {module}.{action}
      </span>
    </div>
  );
}