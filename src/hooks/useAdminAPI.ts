/**
 * Admin API Hooks - Using Backend API Service
 * All queries and mutations go through the unified backend API service
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/api';

// ==================== ORGANIZATIONS ====================

export function useOrganizations(filters?: {
  search?: string;
  subscriptionTier?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ['organizations', filters],
    queryFn: () => api.getOrganizations(filters),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => api.getOrganization(id),
    enabled: !!id,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

// ==================== USERS ====================

export function useUsers(filters?: {
  search?: string;
  role?: string;
  organizationId?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => api.getUsers(filters),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
    enabled: !!userId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useExtendUserAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      api.extendUserAccess(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userIds, updates }: { userIds: string[]; updates: any }) =>
      api.bulkUpdateUsers(userIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ==================== PERMISSIONS ====================

export function useOrganizationPermissions(organizationId: string) {
  return useQuery({
    queryKey: ['organization-permissions', organizationId],
    queryFn: () => api.getOrganizationPermissions(organizationId),
    enabled: !!organizationId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateOrganizationPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, permissions }: { organizationId: string; permissions: any }) =>
      api.updateOrganizationPermissions(organizationId, permissions),
    onSuccess: (_data, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ['organization-permissions', organizationId] });
    },
  });
}

export function useResetOrganizationPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (organizationId: string) =>
      api.resetOrganizationPermissions(organizationId),
    onSuccess: (_data, organizationId) => {
      queryClient.invalidateQueries({ queryKey: ['organization-permissions', organizationId] });
    },
  });
}

// ==================== STATISTICS ====================

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== AUDIT LOGS ====================

export function useAuditLogs(filters?: {
  organizationId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => api.getAuditLogs(filters),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== LEDGER ====================

export function useUserLedger(userId: string, filters?: any) {
  return useQuery({
    queryKey: ['user-ledger', userId, filters],
    queryFn: () => api.getUserLedger(userId, filters),
    enabled: !!userId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      api.addLedgerEntry(userId, data),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-ledger', userId] });
    },
  });
}

export function useOrganizationLedger(organizationId: string, filters?: any) {
  return useQuery({
    queryKey: ['org-ledger', organizationId, filters],
    queryFn: () => api.getOrganizationLedger(organizationId, filters),
    enabled: !!organizationId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddOrganizationLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: string; data: any }) =>
      api.addOrganizationLedgerEntry(organizationId, data),
    onSuccess: (_data, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ['org-ledger', organizationId] });
    },
  });
}
