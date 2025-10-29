import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  OrganizationPermissions, 
  UserRole, 
  ModuleName, 
  PermissionAction 
} from '@/config/database.types';
import {
  DEFAULT_ORGANIZATION_PERMISSIONS,
  mergePermissions,
  validatePermissions,
  calculateEffectivePermissions
} from '@/utils/permissions';
import { useAuth } from './useAuth';

interface UseOrganizationPermissionsReturn {
  permissions: OrganizationPermissions | null;
  loading: boolean;
  error: string | null;
  updatePermissions: (updates: Partial<OrganizationPermissions>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  validateAndSave: (permissions: Partial<OrganizationPermissions>) => Promise<boolean>;
  getEffectivePermissions: (role: UserRole) => OrganizationPermissions | null;
  isUpdating: boolean;
}

/**
 * Hook for managing organization-level permissions
 * Provides CRUD operations and validation for organization permissions
 */
export function useOrganizationPermissions(
  organizationId?: string
): UseOrganizationPermissionsReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const targetOrgId = organizationId || user?.organizationId;

  // Fetch organization permissions
  const {
    data: permissions,
    isLoading: loading,
    error: queryError
  } = useQuery<OrganizationPermissions>({
    queryKey: ['organization-permissions', targetOrgId],
    queryFn: async (): Promise<OrganizationPermissions> => {
      if (!targetOrgId) {
        throw new Error('No organization ID provided');
      }

      const response = await fetch(`/api/admin/organizations/${targetOrgId}/permissions`);
      if (!response.ok) {
        throw new Error('Failed to fetch organization permissions');
      }

      const data = await response.json();
      return data.permissions || DEFAULT_ORGANIZATION_PERMISSIONS;
    },
    enabled: !!targetOrgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });

  // Update organization permissions
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<OrganizationPermissions>) => {
      if (!targetOrgId) {
        throw new Error('No organization ID provided');
      }

      const response = await fetch(`/api/admin/organizations/${targetOrgId}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions: updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update permissions');
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-permissions', targetOrgId] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] }); // Refresh user auth state
      toast.success('Organization permissions updated successfully');
      setError(null);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to update permissions';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Reset to default permissions
  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!targetOrgId) {
        throw new Error('No organization ID provided');
      }

      const response = await fetch(`/api/admin/organizations/${targetOrgId}/permissions/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset permissions');
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-permissions', targetOrgId] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      toast.success('Permissions reset to defaults successfully');
      setError(null);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to reset permissions';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const updatePermissions = useCallback(
    async (updates: Partial<OrganizationPermissions>) => {
      if (!permissions) {
        throw new Error('No current permissions to update');
      }

      const mergedPermissions = mergePermissions(permissions, updates);
      const validation = validatePermissions(mergedPermissions);

      if (!validation.isValid) {
        const errorMessage = `Invalid permissions: ${validation.errors.join(', ')}`;
        setError(errorMessage);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      await updateMutation.mutateAsync(updates);
    },
    [permissions, updateMutation]
  );

  const resetToDefaults = useCallback(async () => {
    await resetMutation.mutateAsync();
  }, [resetMutation]);

  const validateAndSave = useCallback(
    async (permissionUpdates: Partial<OrganizationPermissions>): Promise<boolean> => {
      try {
        if (!permissions) {
          throw new Error('No current permissions available');
        }

        const mergedPermissions = mergePermissions(permissions, permissionUpdates);
        const validation = validatePermissions(mergedPermissions);

        if (!validation.isValid) {
          setError(`Validation failed: ${validation.errors.join(', ')}`);
          return false;
        }

        await updatePermissions(permissionUpdates);
        return true;
      } catch (error) {
        console.error('Validation and save error:', error);
        return false;
      }
    },
    [permissions, updatePermissions]
  );

  const getEffectivePermissions = useCallback(
    (role: UserRole): OrganizationPermissions | null => {
      if (!permissions) return null;
      return calculateEffectivePermissions(permissions, role);
    },
    [permissions]
  );

  return {
    permissions: permissions || null,
    loading,
    error: error || (queryError as Error)?.message || null,
    updatePermissions,
    resetToDefaults,
    validateAndSave,
    getEffectivePermissions,
    isUpdating: updateMutation.isPending || resetMutation.isPending,
  };
}

/**
 * Hook for checking specific permissions without managing the full permission set
 * Useful for components that only need to check access
 */
export function usePermissionCheck() {
  const { hasPermission, hasSpecialPermission, isFeatureEnabled, user } = useAuth();

  const canAccess = useCallback(
    (module: ModuleName, action: PermissionAction): boolean => {
      return hasPermission(module, action);
    },
    [hasPermission]
  );

  const hasSpecialAccess = useCallback(
    (permission: string): boolean => {
      return hasSpecialPermission(permission);
    },
    [hasSpecialPermission]
  );

  const canUseFeature = useCallback(
    (feature: keyof OrganizationPermissions['features']): boolean => {
      return isFeatureEnabled(feature);
    },
    [isFeatureEnabled]
  );

  const isAdmin = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  const isManager = useCallback((): boolean => {
    return user?.role === 'manager' || user?.role === 'admin';
  }, [user?.role]);

  return {
    canAccess,
    hasSpecialAccess,
    canUseFeature,
    isAdmin,
    isManager,
    userRole: user?.role || 'restricted',
    organizationId: user?.organizationId,
  };
}

/**
 * Hook for role management within an organization
 */
export function useRoleManagement() {
  const { canAssignRole, getMaxAssignableRole, user } = useAuth();
  const queryClient = useQueryClient();

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign role');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['organization-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });

  const assignRole = useCallback(
    async (userId: string, newRole: UserRole) => {
      if (!canAssignRole(newRole)) {
        throw new Error(`You don't have permission to assign the role: ${newRole}`);
      }

      await assignRoleMutation.mutateAsync({ userId, newRole });
    },
    [canAssignRole, assignRoleMutation]
  );

  const getAssignableRoles = useCallback((): UserRole[] => {
    const maxRole = getMaxAssignableRole();
    const roles: UserRole[] = ['restricted', 'customer', 'user', 'counter', 'manager', 'admin'];
    const maxIndex = roles.indexOf(maxRole);
    return roles.slice(0, maxIndex + 1);
  }, [getMaxAssignableRole]);

  return {
    assignRole,
    canAssignRole,
    getMaxAssignableRole,
    getAssignableRoles,
    isAssigning: assignRoleMutation.isPending,
    currentUserRole: user?.role || 'restricted',
  };
}