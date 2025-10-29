'use client';

import React, { useState } from 'react';
import { OrganizationPermissions, ModuleName, PermissionAction } from '@/config/database.types';

interface ModulesTabProps {
  permissions: OrganizationPermissions;
  onUpdate: (updates: Partial<OrganizationPermissions>) => void;
  isUpdating: boolean;
}

const MODULE_LABELS: Record<ModuleName, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  inventory: 'Inventory Management',
  sales: 'Sales & Orders',
  reports: 'Reports & Analytics',
  settings: 'System Settings',
  billing: 'Billing & Payments',
};

const ACTION_LABELS: Record<PermissionAction, string> = {
  create: 'Create',
  read: 'View',
  update: 'Edit',
  delete: 'Delete',
  export: 'Export',
  import: 'Import',
};

export default function ModulesTab({ permissions, onUpdate, isUpdating }: ModulesTabProps) {
  const [expandedModules, setExpandedModules] = useState<Set<ModuleName>>(new Set());

  const toggleModule = (module: ModuleName) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const updateModuleEnabled = (module: ModuleName, enabled: boolean) => {
    const updatedModules = {
      ...permissions.modules,
      [module]: {
        ...permissions.modules[module],
        enabled,
      },
    };
    onUpdate({ modules: updatedModules });
  };

  const updateModuleAction = (module: ModuleName, action: PermissionAction, enabled: boolean) => {
    const updatedModules = {
      ...permissions.modules,
      [module]: {
        ...permissions.modules[module],
        actions: {
          ...permissions.modules[module].actions,
          [action]: enabled,
        },
      },
    };
    onUpdate({ modules: updatedModules });
  };

  const toggleAllActions = (module: ModuleName, enabled: boolean) => {
    const updatedActions = Object.keys(permissions.modules[module].actions).reduce(
      (acc, action) => ({ ...acc, [action]: enabled }),
      {}
    );
    
    const updatedModules = {
      ...permissions.modules,
      [module]: {
        ...permissions.modules[module],
        actions: updatedActions,
      },
    };
    onUpdate({ modules: updatedModules });
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Module Permissions</h3>
        <p className="text-white/70 text-sm">
          Configure which modules are available and what actions can be performed within each module.
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(permissions.modules).map(([moduleName, modulePermission]) => {
          const module = moduleName as ModuleName;
          const isExpanded = expandedModules.has(module);
          const allActionsEnabled = Object.values(modulePermission.actions).every(Boolean);
          const someActionsEnabled = Object.values(modulePermission.actions).some(Boolean);

          return (
            <div key={module} className="bg-white/5 border border-white/10 rounded-lg">
              {/* Module Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleModule(module)}
                    className="text-white/70 hover:text-white transition-colors"
                    disabled={isUpdating}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modulePermission.enabled}
                        onChange={(e) => updateModuleEnabled(module, e.target.checked)}
                        disabled={isUpdating}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-white font-medium">{MODULE_LABELS[module]}</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {modulePermission.enabled && (
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        allActionsEnabled
                          ? 'bg-green-500/20 text-green-400'
                          : someActionsEnabled
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {allActionsEnabled
                          ? 'Full Access'
                          : someActionsEnabled
                          ? 'Partial Access'
                          : 'No Access'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Module Actions */}
              {isExpanded && modulePermission.enabled && (
                <div className="px-4 pb-4 border-t border-white/10">
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white/80">Actions</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleAllActions(module, true)}
                          disabled={isUpdating || allActionsEnabled}
                          className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Enable All
                        </button>
                        <button
                          onClick={() => toggleAllActions(module, false)}
                          disabled={isUpdating || !someActionsEnabled}
                          className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Disable All
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(modulePermission.actions).map(([actionName, enabled]) => {
                        const action = actionName as PermissionAction;
                        return (
                          <label key={action} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => updateModuleAction(module, action, e.target.checked)}
                              disabled={isUpdating}
                              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-white/70 text-sm">{ACTION_LABELS[action]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}