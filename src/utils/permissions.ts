import { 
  OrganizationPermissions, 
  RolePermissions, 
  ModulePermission, 
  UserRole, 
  PermissionAction, 
  ModuleName 
} from '@/config/database.types';

/**
 * Default organization permissions template
 * Used when creating new organizations or as fallback
 */
export const DEFAULT_ORGANIZATION_PERMISSIONS: OrganizationPermissions = {
  modules: {
    dashboard: {
      enabled: true,
      actions: {
        create: false,
        read: true,
        update: false,
        delete: false,
        export: false,
        import: false,
      },
    },
    users: {
      enabled: true,
      actions: {
        create: false,
        read: true,
        update: false,
        delete: false,
        export: false,
        import: false,
      },
      restrictions: {
        own_data_only: true,
        department_data_only: false,
        approval_required: ['create', 'delete'],
      },
    },
    inventory: {
      enabled: true,
      actions: {
        create: false,
        read: true,
        update: false,
        delete: false,
        export: false,
        import: false,
      },
    },
    sales: {
      enabled: true,
      actions: {
        create: true,
        read: true,
        update: false,
        delete: false,
        export: false,
        import: false,
      },
    },
    reports: {
      enabled: true,
      actions: {
        create: false,
        read: true,
        update: false,
        delete: false,
        export: false,
        import: false,
      },
    },
    settings: {
      enabled: false,
      actions: {
        create: false,
        read: false,
        update: false,
        delete: false,
        export: false,
        import: false,
      },
    },
    billing: {
      enabled: false,
      actions: {
        create: false,
        read: false,
        update: false,
        delete: false,
        export: false,
        import: false,
      },
    },
  },
  roles: {
    restricted: {
      special_permissions: [],
      module_overrides: {
        dashboard: {
          enabled: true,
          actions: {
            create: false,
            read: true,
            update: false,
            delete: false,
            export: false,
            import: false,
          },
        },
      },
      restrictions: {
        max_records_per_query: 10,
        rate_limit_per_hour: 100,
        sensitive_data_access: false,
      },
    },
    user: {
      special_permissions: ['basic_access'],
      module_overrides: {
        users: {
          enabled: true,
          actions: {
            create: false,
            read: true,
            update: false,
            delete: false,
            export: false,
            import: false,
          },
          restrictions: {
            own_data_only: true,
            department_data_only: false,
            approval_required: [],
          },
        },
        inventory: {
          enabled: true,
          actions: {
            create: false,
            read: true,
            update: true,
            delete: false,
            export: false,
            import: false,
          },
        },
      },
      restrictions: {
        max_records_per_query: 100,
        rate_limit_per_hour: 500,
        sensitive_data_access: false,
      },
    },
    counter: {
      inherits_from: 'user',
      special_permissions: ['pos_access', 'process_sales'],
      module_overrides: {
        sales: {
          enabled: true,
          actions: {
            create: true,
            read: true,
            update: true,
            delete: false,
            export: false,
            import: false,
          },
        },
        inventory: {
          enabled: true,
          actions: {
            create: false,
            read: true,
            update: true,
            delete: false,
            export: false,
            import: false,
          },
        },
        reports: {
          enabled: true,
          actions: {
            create: false,
            read: true,
            update: false,
            delete: false,
            export: false,
            import: false,
          },
        },
      },
      restrictions: {
        max_records_per_query: 500,
        rate_limit_per_hour: 1000,
        sensitive_data_access: false,
      },
    },
    customer: {
      inherits_from: 'restricted',
      special_permissions: ['view_own_orders', 'place_orders'],
      module_overrides: {
        sales: {
          enabled: true,
          actions: {
            create: false,
            read: true,
            update: false,
            delete: false,
            export: false,
            import: false,
          },
        },
        inventory: {
          enabled: true,
          actions: {
            create: false,
            read: true,
            update: false,
            delete: false,
            export: false,
            import: false,
          },
        },
        reports: {
          enabled: true,
          actions: {
            create: false,
            read: false,
            update: false,
            delete: false,
            export: false,
            import: false,
          },
        },
      },
      restrictions: {
        max_records_per_query: 50,
        rate_limit_per_hour: 500,
        sensitive_data_access: false,
      },
    },
    manager: {
      inherits_from: 'user',
      special_permissions: ['manage_team', 'approve_transactions'],
      module_overrides: {
        users: {
          enabled: true,
          actions: {
            create: true,
            read: true,
            update: true,
            delete: false,
            export: true,
            import: false,
          },
          restrictions: {
            own_data_only: false,
            department_data_only: true,
            approval_required: ['delete'],
          },
        },
        reports: {
          enabled: true,
          actions: {
            create: true,
            read: true,
            update: true,
            delete: false,
            export: true,
            import: false,
          },
        },
        settings: {
          enabled: true,
          actions: {
            create: false,
            read: true,
            update: true,
            delete: false,
            export: false,
            import: false,
          },
        },
      },
      restrictions: {
        max_records_per_query: 1000,
        rate_limit_per_hour: 2000,
        sensitive_data_access: true,
      },
    },
    admin: {
      inherits_from: 'manager',
      special_permissions: ['full_access', 'system_admin', 'manage_organization'],
      module_overrides: {
        users: {
          enabled: true,
          actions: {
            create: true,
            read: true,
            update: true,
            delete: true,
            export: true,
            import: true,
          },
          restrictions: {
            own_data_only: false,
            department_data_only: false,
            approval_required: [],
          },
        },
        settings: {
          enabled: true,
          actions: {
            create: true,
            read: true,
            update: true,
            delete: true,
            export: true,
            import: true,
          },
        },
        billing: {
          enabled: true,
          actions: {
            create: true,
            read: true,
            update: true,
            delete: false,
            export: true,
            import: false,
          },
        },
      },
      restrictions: {
        max_records_per_query: 10000,
        rate_limit_per_hour: 10000,
        sensitive_data_access: true,
      },
    },
  },
  features: {
    advanced_analytics: false,
    multi_location: false,
    api_access: false,
    custom_reports: false,
    bulk_operations: false,
  },
  policies: {
    session_timeout: 480, // 8 hours
    max_concurrent_sessions: 3,
    ip_restrictions: [],
    time_restrictions: [],
    data_retention_days: 365,
  },
};

/**
 * Calculate effective permissions for a user based on their role and organization permissions
 */
export function calculateEffectivePermissions(
  organizationPermissions: OrganizationPermissions,
  userRole: UserRole
): OrganizationPermissions {
  const rolePermissions = organizationPermissions.roles[userRole];
  const effectivePermissions = JSON.parse(JSON.stringify(organizationPermissions)) as OrganizationPermissions;

  // Apply role-specific overrides
  if (rolePermissions.module_overrides) {
    Object.entries(rolePermissions.module_overrides).forEach(([moduleName, moduleOverride]) => {
      if (moduleOverride && effectivePermissions.modules[moduleName as ModuleName]) {
        effectivePermissions.modules[moduleName as ModuleName] = {
          ...effectivePermissions.modules[moduleName as ModuleName],
          ...moduleOverride,
        };
      }
    });
  }

  // Apply inheritance if specified
  if (rolePermissions.inherits_from) {
    const parentRole = rolePermissions.inherits_from as UserRole;
    const parentPermissions = calculateEffectivePermissions(organizationPermissions, parentRole);
    
    // Merge parent permissions with current role (current role takes precedence)
    Object.keys(effectivePermissions.modules).forEach((moduleName) => {
      const module = moduleName as ModuleName;
      if (!rolePermissions.module_overrides?.[module]) {
        effectivePermissions.modules[module] = parentPermissions.modules[module];
      }
    });
  }

  return effectivePermissions;
}

/**
 * Check if a user has permission to perform a specific action on a module
 */
export function hasPermission(
  organizationPermissions: OrganizationPermissions,
  userRole: UserRole,
  module: ModuleName,
  action: PermissionAction
): boolean {
  const effectivePermissions = calculateEffectivePermissions(organizationPermissions, userRole);
  const modulePermissions = effectivePermissions.modules[module];

  if (!modulePermissions || !modulePermissions.enabled) {
    return false;
  }

  return modulePermissions.actions[action] || false;
}

/**
 * Check if a user has a specific special permission
 */
export function hasSpecialPermission(
  organizationPermissions: OrganizationPermissions,
  userRole: UserRole,
  permission: string
): boolean {
  const rolePermissions = organizationPermissions.roles[userRole];
  return rolePermissions.special_permissions.includes(permission);
}

/**
 * Get all available permissions for a user role
 */
export function getUserPermissions(
  organizationPermissions: OrganizationPermissions,
  userRole: UserRole
): {
  modules: Record<ModuleName, ModulePermission>;
  specialPermissions: string[];
  restrictions: RolePermissions['restrictions'];
} {
  const effectivePermissions = calculateEffectivePermissions(organizationPermissions, userRole);
  const rolePermissions = organizationPermissions.roles[userRole];

  return {
    modules: effectivePermissions.modules,
    specialPermissions: rolePermissions.special_permissions,
    restrictions: rolePermissions.restrictions,
  };
}

/**
 * Validate if a role can be assigned within an organization
 */
export function canAssignRole(
  organizationPermissions: OrganizationPermissions,
  assignerRole: UserRole,
  targetRole: UserRole
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    restricted: 1,
    customer: 1,
    user: 2,
    counter: 2,
    manager: 3,
    admin: 4,
  };

  // Admins can assign any role
  if (assignerRole === 'admin') {
    return true;
  }

  // Managers can assign roles below their level
  if (assignerRole === 'manager') {
    return roleHierarchy[targetRole] <= roleHierarchy.manager;
  }

  // Users, counter staff, and restricted users cannot assign roles
  return false;
}

/**
 * Get the maximum role a user can assign
 */
export function getMaxAssignableRole(userRole: UserRole): UserRole {
  switch (userRole) {
    case 'admin':
      return 'admin';
    case 'manager':
      return 'manager';
    case 'counter':
      return 'user';
    case 'user':
      return 'customer';
    case 'customer':
      return 'restricted';
    default:
      return 'restricted';
  }
}

/**
 * Check if an organization feature is enabled
 */
export function isFeatureEnabled(
  organizationPermissions: OrganizationPermissions,
  feature: keyof OrganizationPermissions['features']
): boolean {
  return organizationPermissions.features[feature] || false;
}

/**
 * Merge organization permissions with updates (for permission management)
 */
export function mergePermissions(
  basePermissions: OrganizationPermissions,
  updates: Partial<OrganizationPermissions>
): OrganizationPermissions {
  return {
    ...basePermissions,
    ...updates,
    modules: {
      ...basePermissions.modules,
      ...updates.modules,
    },
    roles: {
      ...basePermissions.roles,
      ...updates.roles,
    },
    features: {
      ...basePermissions.features,
      ...updates.features,
    },
    policies: {
      ...basePermissions.policies,
      ...updates.policies,
    },
  };
}

/**
 * Validate organization permissions structure
 */
export function validatePermissions(permissions: Partial<OrganizationPermissions>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate modules
  if (permissions.modules) {
    Object.entries(permissions.modules).forEach(([moduleName, modulePermission]) => {
      if (!modulePermission.actions) {
        errors.push(`Module ${moduleName} is missing actions`);
      }
    });
  }

  // Validate roles
  if (permissions.roles) {
    Object.entries(permissions.roles).forEach(([roleName, rolePermission]) => {
      if (!rolePermission.restrictions) {
        errors.push(`Role ${roleName} is missing restrictions`);
      }
      if (!Array.isArray(rolePermission.special_permissions)) {
        errors.push(`Role ${roleName} special_permissions must be an array`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create a permission summary for display purposes
 */
export function createPermissionSummary(
  organizationPermissions: OrganizationPermissions,
  userRole: UserRole
): {
  enabledModules: string[];
  totalPermissions: number;
  specialPermissions: string[];
  restrictions: string[];
} {
  const effectivePermissions = calculateEffectivePermissions(organizationPermissions, userRole);
  const rolePermissions = organizationPermissions.roles[userRole];

  const enabledModules = Object.entries(effectivePermissions.modules)
    .filter(([_, module]) => module.enabled)
    .map(([name]) => name);

  const totalPermissions = Object.values(effectivePermissions.modules)
    .reduce((total, module) => {
      return total + Object.values(module.actions).filter(Boolean).length;
    }, 0);

  const restrictions = [
    `Max ${rolePermissions.restrictions.max_records_per_query} records per query`,
    `${rolePermissions.restrictions.rate_limit_per_hour} requests per hour`,
    rolePermissions.restrictions.sensitive_data_access ? 'Sensitive data access' : 'No sensitive data access',
  ];

  return {
    enabledModules,
    totalPermissions,
    specialPermissions: rolePermissions.special_permissions,
    restrictions,
  };
}