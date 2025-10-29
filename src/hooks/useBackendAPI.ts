/**
 * Direct Backend API Hooks
 *
 * These hooks call the Express backend API directly (PostgreSQL)
 * Bypassing the Next.js API routes layer
 * Backend URL: http://localhost:4001/api
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";

// ===================== TYPES =====================

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  organizationId: string;
}

interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: "admin" | "manager" | "user";
}

interface UpdateUserPayload {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    organizationId: string;
    isActive: boolean;
  };
}

// ===================== AUTHENTICATION =====================

export function useLogin() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<LoginResponse> => {
      return api.login(email, password);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.logout();
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const user = await api.getCurrentUser();
        return user;
      } catch (error) {
        throw new Error("Not authenticated");
      }
    },
    retry: false,
  });
}

// ===================== USER MANAGEMENT =====================

export function useUsers(filters?: {
  role?: string;
  status?: string;
  search?: string;
}) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);

      const endpoint = params.toString()
        ? `/users?${params.toString()}`
        : "/users";

      const result = await api.apiRequest<{ users: User[] }>(endpoint);
      return result.data?.users || [];
    },
    enabled: !!token, // Only run if authenticated
  });
}

export function useUser(userId: string) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const result = await api.apiRequest<{ user: User }>(`/users/${userId}`);
      return result.data?.user;
    },
    enabled: !!token && !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserPayload) => {
      const result = await api.apiRequest<{ user: User }>("/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return result.data?.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: UpdateUserPayload;
    }) => {
      const result = await api.apiRequest<{ user: User }>(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      return result.data?.user;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", data?.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.apiRequest(`/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) => {
      const result = await api.apiRequest<{ user: User }>(
        `/users/${userId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive }),
        }
      );
      return result.data?.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ===================== MEDICINES =====================

export function useMedicines(filters?: { search?: string; category?: string }) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["medicines", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);

      const endpoint = params.toString()
        ? `/medicines?${params.toString()}`
        : "/medicines";

      const result = await api.apiRequest<any>(endpoint);
      return result.data?.medicines || result.data || [];
    },
    enabled: !!token,
  });
}

export function useMedicine(medicineId: string) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["medicine", medicineId],
    queryFn: async () => {
      const result = await api.apiRequest<any>(`/medicines/${medicineId}`);
      return result.data?.medicine || result.data;
    },
    enabled: !!token && !!medicineId,
  });
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (medicineData: any) => {
      const result = await api.apiRequest<any>("/medicines", {
        method: "POST",
        body: JSON.stringify(medicineData),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      medicineId,
      updates,
    }: {
      medicineId: string;
      updates: any;
    }) => {
      const result = await api.apiRequest<any>(`/medicines/${medicineId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (medicineId: string) => {
      await api.apiRequest(`/medicines/${medicineId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}

// ===================== SUPPLIERS =====================

export function useSuppliers(filters?: { search?: string; status?: string }) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["suppliers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);

      const endpoint = params.toString()
        ? `/suppliers?${params.toString()}`
        : "/suppliers";

      const result = await api.apiRequest<any>(endpoint);
      return result.data?.suppliers || result.data || [];
    },
    enabled: !!token,
  });
}

export function useSupplier(supplierId: string) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: async () => {
      const result = await api.apiRequest<any>(`/suppliers/${supplierId}`);
      return result.data?.supplier || result.data;
    },
    enabled: !!token && !!supplierId,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierData: any) => {
      const result = await api.apiRequest<any>("/suppliers", {
        method: "POST",
        body: JSON.stringify(supplierData),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      supplierId,
      updates,
    }: {
      supplierId: string;
      updates: any;
    }) => {
      const result = await api.apiRequest<any>(`/suppliers/${supplierId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierId: string) => {
      await api.apiRequest(`/suppliers/${supplierId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

// ===================== INVENTORY =====================

export function useInventory(filters?: {
  search?: string;
  lowStock?: boolean;
}) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["inventory", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.lowStock)
        params.append("lowStock", filters.lowStock.toString());

      const endpoint = params.toString()
        ? `/inventory?${params.toString()}`
        : "/inventory";

      const result = await api.apiRequest<any>(endpoint);
      return result.data?.inventory || result.data || [];
    },
    enabled: !!token,
  });
}

export function useInventoryItem(itemId: string) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["inventory-item", itemId],
    queryFn: async () => {
      const result = await api.apiRequest<any>(`/inventory/${itemId}`);
      return result.data;
    },
    enabled: !!token && !!itemId,
  });
}

// ===================== ORDERS =====================

export function useOrders(filters?: {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);

      const endpoint = params.toString()
        ? `/orders?${params.toString()}`
        : "/orders";

      const result = await api.apiRequest<any>(endpoint);
      return result.data?.orders || result.data || [];
    },
    enabled: !!token,
  });
}

export function useOrder(orderId: string) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const result = await api.apiRequest<any>(`/orders/${orderId}`);
      return result.data;
    },
    enabled: !!token && !!orderId,
  });
}

// ===================== PURCHASE ORDERS =====================

export function usePurchaseOrders(filters?: {
  status?: string;
  search?: string;
  supplierId?: string;
}) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["purchase-orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.supplierId) params.append("supplierId", filters.supplierId);

      const endpoint = params.toString()
        ? `/purchase-orders?${params.toString()}`
        : "/purchase-orders";

      const result = await api.apiRequest<any>(endpoint);
      return result.data?.purchaseOrders || result.data || [];
    },
    enabled: !!token,
  });
}

export function usePurchaseOrder(poId: string) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["purchase-order", poId],
    queryFn: async () => {
      const result = await api.apiRequest<any>(`/purchase-orders/${poId}`);
      return result.data;
    },
    enabled: !!token && !!poId,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (poData: any) => {
      const result = await api.apiRequest<any>("/purchase-orders", {
        method: "POST",
        body: JSON.stringify(poData),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ poId, updates }: { poId: string; updates: any }) => {
      const result = await api.apiRequest<any>(`/purchase-orders/${poId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

// ===================== DASHBOARD =====================

export function useDashboardStats() {
  const token = api.getToken();

  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const result = await api.apiRequest<any>("/dashboard");
      return result.data || {};
    },
    enabled: !!token,
  });
}

// ===================== REPORTS =====================

export function useInventoryReport(filters?: {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["inventory-report", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);
      if (filters?.category) params.append("category", filters.category);

      const endpoint = params.toString()
        ? `/reports/inventory?${params.toString()}`
        : "/reports/inventory";

      const result = await api.apiRequest<any>(endpoint);
      return result.data || {};
    },
    enabled: !!token,
  });
}

export function useSalesReport(filters?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const token = api.getToken();

  return useQuery({
    queryKey: ["sales-report", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);

      const endpoint = params.toString()
        ? `/reports/sales?${params.toString()}`
        : "/reports/sales";

      const result = await api.apiRequest<any>(endpoint);
      return result.data || {};
    },
    enabled: !!token,
  });
}

export default {
  // Auth
  useLogin,
  useLogout,
  useCurrentUser,

  // Users
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus,

  // Medicines
  useMedicines,
  useMedicine,
  useCreateMedicine,
  useUpdateMedicine,
  useDeleteMedicine,

  // Suppliers
  useSuppliers,
  useSupplier,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,

  // Inventory
  useInventory,
  useInventoryItem,

  // Orders
  useOrders,
  useOrder,

  // Purchase Orders
  usePurchaseOrders,
  usePurchaseOrder,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,

  // Dashboard
  useDashboardStats,

  // Reports
  useInventoryReport,
  useSalesReport,
};
