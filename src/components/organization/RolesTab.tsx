'use client';

import React, { useState } from 'react';
import { OrganizationPermissions, UserRole } from '@/config/database.types';
import RolePermissionEditor from './RolePermissionEditor';
import PermissionPreview from './PermissionPreview';

interface RolesTabProps {
  permissions: OrganizationPermissions;
  onUpdate: (updates: Partial<OrganizationPermissions>) => void;
  isUpdating: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  counter: 'Counter Staff',
  user: 'User',
  customer: 'Customer',
  restricted: 'Restricted User',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access with all permissions',
  manager: 'Management access with team oversight capabilities',
  counter: 'Point-of-sale access for processing sales and inventory',
  user: 'Standard user access for daily operations',
  customer: 'Customer access for viewing and placing orders',
  restricted: 'Limited access for basic operations only',
};

export default function RolesTab({ permissions, onUpdate, isUpdating }: RolesTabProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const updateRolePermissions = (role: UserRole, updates: any) => {
    const updatedRoles = {
      ...permissions.roles,
      [role]: {
        ...permissions.roles[role],
        ...updates,
      },
    };
    onUpdate({ roles: updatedRoles });
  };

  const resetRoleToDefaults = (role: UserRole) => {
    // This would typically come from a default permissions configuration
    const defaultRolePermissions = {
      admin: {
        module_overrides: {},
        special_permissions: ['system_admin', 'user_management', 'organization_settings'],
        restrictions: {
          max_records_per_query: 10000,
          rate_limit_per_hour: 10000,
          sensitive_data_access: true,
        },
      },
      manager: {
        module_overrides: {},
        special_permissions: ['team_management', 'reports_access'],
        restrictions: {
          max_records_per_query: 5000,
          rate_limit_per_hour: 5000,
          sensitive_data_access: true,
        },
      },
      counter: {
        module_overrides: {
          sales: { create: true, read: true, update: true, delete: false },
          inventory: { create: false, read: true, update: true, delete: false },
          reports: { create: false, read: true, update: false, delete: false },
        },
        special_permissions: ['pos_access', 'process_sales'],
        restrictions: {
          max_records_per_query: 1000,
          rate_limit_per_hour: 2000,
          sensitive_data_access: false,
        },
      },
      user: {
        module_overrides: {},
        special_permissions: [],
        restrictions: {
          max_records_per_query: 1000,
          rate_limit_per_hour: 1000,
          sensitive_data_access: false,
        },
      },
      customer: {
        module_overrides: {
          orders: { create: true, read: true, update: false, delete: false },
          products: { create: false, read: true, update: false, delete: false },
        },
        special_permissions: ['place_orders', 'view_order_history'],
        restrictions: {
          max_records_per_query: 500,
          rate_limit_per_hour: 500,
          sensitive_data_access: false,
        },
      },
      restricted: {
        module_overrides: {},
        special_permissions: [],
        restrictions: {
          max_records_per_query: 100,
          rate_limit_per_hour: 100,
          sensitive_data_access: false,
        },
      },
    };

    updateRolePermissions(role, defaultRolePermissions[role]);
  };

  const getPermissionSummary = (role: UserRole) => {
    const rolePerms = permissions.roles[role];
    const overrideCount = Object.keys(rolePerms.module_overrides || {}).length;
    const specialCount = rolePerms.special_permissions?.length || 0;
    
    return {
      overrides: overrideCount,
      specialPermissions: specialCount,
      hasRestrictions: rolePerms.restrictions?.max_records_per_query < 10000,
    };
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Role Management</h3>
        <p className="text-white/70 text-sm">
          Configure permissions and restrictions for each user role within your organization.
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const userRole = role as UserRole;
          const isSelected = selectedRole === userRole;
          const summary = getPermissionSummary(userRole);

          return (
            <button
              key={role}
              onClick={() => setSelectedRole(userRole)}
              disabled={isUpdating}
              className={`p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-blue-500/20 border-blue-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{label}</h4>
                {summary.overrides > 0 && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                    {summary.overrides} overrides
                  </span>
                )}
              </div>
              <p className="text-xs opacity-70 mb-3">{ROLE_DESCRIPTIONS[userRole]}</p>
              <div className="flex items-center space-x-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${
                  summary.specialPermissions > 0 ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <span>{summary.specialPermissions} special permissions</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-3 py-2 text-sm rounded transition-colors ${
              viewMode === 'edit'
                ? 'bg-blue-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Edit Permissions
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-2 text-sm rounded transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Preview Access
          </button>
        </div>

        <button
          onClick={() => resetRoleToDefaults(selectedRole)}
          disabled={isUpdating}
          className="px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Role Configuration */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-white mb-1">
            {ROLE_LABELS[selectedRole]} Configuration
          </h4>
          <p className="text-white/70 text-sm">
            {ROLE_DESCRIPTIONS[selectedRole]}
          </p>
        </div>

        {viewMode === 'edit' ? (
          <RolePermissionEditor
            role={selectedRole}
            organizationPermissions={permissions}
            onUpdateRole={updateRolePermissions}
            isEditing={isUpdating}
          />
        ) : (
          <PermissionPreview
            organizationPermissions={permissions}
            userRole={selectedRole}
            showFeatures={true}
          />
        )}
      </div>
    </div>
  );
}