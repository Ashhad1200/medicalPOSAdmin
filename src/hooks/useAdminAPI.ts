import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Organization, AuditLog } from "@/config/supabase";
import { useAuth } from "./useAuth";

// ===================== USER MANAGEMENT =====================

export function useUsers(
  organizationId?: string,
  filters?: {
    role?: string;
    status?: string;
    search?: string;
  }
) {
  return useQuery({
    queryKey: ["users", organizationId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (organizationId) params.append("organizationId", organizationId);
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);

      const response = await fetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json() as Promise<User[]>;
    },
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json() as Promise<User>;
    },
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { appUser } = useAuth();

  return useMutation({
    mutationFn: async (userData: {
      // Required fields
      email: string;
      password: string;
      username: string;
      organization_id: string;

      // Basic information
      full_name?: string;
      phone?: string;
      avatar_url?: string;

      // Role & Permissions
      role?: "admin" | "manager" | "user";
      role_in_pos?: string;
      permissions?: string[];

      // Access Control
      subscription_status?: "pending" | "active" | "suspended" | "expired";
      access_valid_till?: string;
      trial_ends_at?: string;
      is_trial_user?: boolean;
      is_active?: boolean;
      is_email_verified?: boolean;

      // Security
      two_factor_enabled?: boolean;

      // Preferences
      theme?: "light" | "dark" | "auto";
      language?: string;
      timezone?: string;
      notification_settings?: Record<string, any>;
      preferences?: Record<string, any>;

      // Management
      created_by?: string;
      approved_by?: string;
      approved_at?: string;
      deactivation_reason?: string;
    }) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          created_by: userData.created_by || appUser?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { appUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
      reason,
    }: {
      userId: string;
      updates: Partial<User>;
      reason?: string;
    }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updates,
          reason,
          updatedBy: appUser?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useExtendUserAccess() {
  const queryClient = useQueryClient();
  const { appUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      extensionDays,
      reason,
    }: {
      userId: string;
      extensionDays: number;
      reason?: string;
    }) => {
      const response = await fetch(`/api/admin/users/${userId}/extend-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extensionDays,
          reason,
          extendedBy: appUser?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to extend user access");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { appUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason?: string;
    }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reason || "User deleted via admin panel",
          deletedBy: appUser?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ===================== ORGANIZATION MANAGEMENT =====================

export function useOrganizations(filters?: {
  subscriptionTier?: string;
  search?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ["organizations", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.subscriptionTier)
        params.append("subscriptionTier", filters.subscriptionTier);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());

      const response = await fetch(`/api/admin/organizations?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }

      return response.json();
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orgData: {
      name: string;
      code: string;
      description?: string;
      address?: string;
      phone?: string;
      email?: string;
      subscriptionTier?: string;
      maxUsers?: number;
    }) => {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orgData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create organization");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { appUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      organizationId,
      updates,
      reason,
    }: {
      organizationId: string;
      updates: Partial<Organization>;
      reason?: string;
    }) => {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            updates,
            reason,
            updatedBy: appUser?.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update organization");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const { appUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      organizationId,
      reason,
    }: {
      organizationId: string;
      reason?: string;
    }) => {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: reason || "Organization deleted via admin panel",
            deletedBy: appUser?.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete organization");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ===================== AUDIT LOGS =====================

export function useAuditLogs(filters?: {
  organizationId?: string;
  userId?: string;
  action?: string;
  entity?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.organizationId)
        params.append("organizationId", filters.organizationId);
      if (filters?.userId) params.append("userId", filters.userId);
      if (filters?.action) params.append("action", filters.action);
      if (filters?.entity) params.append("entity", filters.entity);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/admin/audit-logs?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      return response.json() as Promise<AuditLog[]>;
    },
  });
}

// ===================== DASHBOARD STATS =====================

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      return response.json() as Promise<{
        totalUsers: number;
        totalOrganizations: number;
        activeUsers: number;
        expiredUsers: number;
        recentUsers: number;
      }>;
    },
  });
}

// ===================== BULK OPERATIONS =====================

export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();
  const { appUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      userIds,
      updates,
      reason,
    }: {
      userIds: string[];
      updates: Partial<User>;
      reason?: string;
    }) => {
      const response = await fetch("/api/admin/users/bulk-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds,
          updates,
          reason,
          updatedBy: appUser?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to bulk update users");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ===================== USER LEDGER =====================

export function useUserLedger(userId?: string) {
  return useQuery({
    queryKey: ["user-ledger", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const response = await fetch(`/api/admin/ledger?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user ledger");
      }

      return response.json();
    },
    enabled: !!userId,
  });
}
