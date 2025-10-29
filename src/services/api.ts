/**
 * API Service for Admin Panel
 *
 * This service handles all communication with the Express backend API.
 * It replaces direct Supabase Auth calls with backend API calls.
 * Backend: PostgreSQL with JWT authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Get stored JWT token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

/**
 * Store JWT token in localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
};

/**
 * Login user via Express backend
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || "Login failed");
  }

  // Backend returns response wrapped in 'data' object: { success, data: { user, token } }
  const userData = responseData.data?.user;
  const token = responseData.data?.token;

  if (!userData || !token) {
    console.error("Invalid response structure:", responseData);
    throw new Error("Invalid response from server");
  }

  // Check if user has admin or manager role (role_in_pos is the field from backend)
  const userRole = userData.role_in_pos || userData.roleInPos || userData.role;
  if (userRole !== "admin" && userRole !== "manager") {
    throw new Error(
      "Insufficient permissions. Admin panel access requires admin or manager role."
    );
  }

  // Store the token
  setToken(token);

  return {
    success: true,
    token: token,
    user: {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userRole,
      organizationId: userData.organizationId,
      isActive: true,
    },
  };
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  const token = getToken();

  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
  }

  // Clear token regardless of API call success
  removeToken();

  // Clear all storage
  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<any> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // If token is invalid, clear it
    if (response.status === 401) {
      removeToken();
    }
    throw new Error(data.message || "Failed to fetch user profile");
  }

  // Backend returns data wrapped in user object, extract it properly
  const userProfileData = data.data?.user || data.user || data;
  const userRole =
    userProfileData.role_in_pos ||
    userProfileData.roleInPos ||
    userProfileData.role;

  // Check role again
  if (userRole !== "admin" && userRole !== "manager") {
    throw new Error("Insufficient permissions");
  }

  return userProfileData;
};

/**
 * Generic API request helper with authentication
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle session invalidation
    if (response.status === 401 && data.code === "SESSION_INVALIDATED") {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    throw new Error(data.message || data.error || "API request failed");
  }

  return data;
};

/**
 * Verify token is still valid
 */
export const verifyToken = async (): Promise<boolean> => {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
};

// ==================== ORGANIZATIONS ====================

/**
 * Get all organizations with optional filters
 */
export const getOrganizations = async (filters?: any): Promise<any[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.subscriptionTier)
    params.append("subscriptionTier", filters.subscriptionTier);
  if (filters?.isActive !== undefined)
    params.append("isActive", String(filters.isActive));

  const response = await apiRequest<any[]>(
    `/admin/organizations?${params.toString()}`
  );
  return response.data || [];
};

/**
 * Get single organization by ID
 */
export const getOrganization = async (id: string): Promise<any> => {
  const response = await apiRequest<any>(`/admin/organizations/${id}`);
  return response.data;
};

/**
 * Create new organization
 */
export const createOrganization = async (data: any): Promise<any> => {
  const response = await apiRequest<any>("/admin/organizations", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Update organization
 */
export const updateOrganization = async (
  id: string,
  data: any
): Promise<any> => {
  const response = await apiRequest<any>(`/admin/organizations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Delete organization
 */
export const deleteOrganization = async (id: string): Promise<void> => {
  await apiRequest(`/admin/organizations/${id}`, {
    method: "DELETE",
  });
};

// ==================== USERS ====================

/**
 * Get all users with optional filters
 */
export const getUsers = async (filters?: any): Promise<any[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.role) params.append("role", filters.role);
  if (filters?.organizationId)
    params.append("organizationId", filters.organizationId);
  if (filters?.isActive !== undefined)
    params.append("isActive", String(filters.isActive));

  const response = await apiRequest<any[]>(`/admin/users?${params.toString()}`);
  return response.data || [];
};

/**
 * Get single user by ID
 */
export const getUser = async (userId: string): Promise<any> => {
  const response = await apiRequest<any>(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Create new user
 */
export const createUser = async (data: any): Promise<any> => {
  const response = await apiRequest<any>("/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Update user
 */
export const updateUser = async (id: string, data: any): Promise<any> => {
  const response = await apiRequest<any>(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Update user role
 */
export const updateUserRole = async (
  id: string,
  role: string
): Promise<any> => {
  return updateUser(id, { role });
};

/**
 * Extend user access
 */
export const extendUserAccess = async (
  id: string,
  days: number
): Promise<any> => {
  const response = await apiRequest<any>(`/admin/users/${id}/extend-access`, {
    method: "POST",
    body: JSON.stringify({ days }),
  });
  return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<void> => {
  await apiRequest(`/admin/users/${id}`, {
    method: "DELETE",
  });
};

/**
 * Bulk update users
 */
export const bulkUpdateUsers = async (
  userIds: string[],
  updates: any
): Promise<any> => {
  const response = await apiRequest<any>("/admin/users/bulk-update", {
    method: "POST",
    body: JSON.stringify({ userIds, updates }),
  });
  return response.data;
};

// ==================== PERMISSIONS ====================

/**
 * Get organization permissions
 */
export const getOrganizationPermissions = async (
  organizationId: string
): Promise<any> => {
  const response = await apiRequest<any>(
    `/admin/organizations/${organizationId}/permissions`
  );
  return response.data;
};

/**
 * Update organization permissions
 */
export const updateOrganizationPermissions = async (
  organizationId: string,
  permissions: any
): Promise<any> => {
  const response = await apiRequest<any>(
    `/admin/organizations/${organizationId}/permissions`,
    {
      method: "PUT",
      body: JSON.stringify(permissions),
    }
  );
  return response.data;
};

/**
 * Reset organization permissions to defaults
 */
export const resetOrganizationPermissions = async (
  organizationId: string
): Promise<any> => {
  const response = await apiRequest<any>(
    `/admin/organizations/${organizationId}/permissions/reset`,
    {
      method: "POST",
    }
  );
  return response.data;
};

// ==================== STATISTICS ====================

/**
 * Get admin statistics dashboard data
 */
export const getAdminStats = async (): Promise<any> => {
  const response = await apiRequest<any>("/admin/stats");
  return response.data;
};

// ==================== AUDIT LOGS ====================

/**
 * Get audit logs with optional filters
 */
export const getAuditLogs = async (filters?: any): Promise<any[]> => {
  const params = new URLSearchParams();
  if (filters?.organizationId)
    params.append("organizationId", filters.organizationId);
  if (filters?.userId) params.append("userId", filters.userId);
  if (filters?.action) params.append("action", filters.action);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const response = await apiRequest<any[]>(
    `/admin/audit-logs?${params.toString()}`
  );
  return response.data || [];
};

// ==================== LEDGER ====================

/**
 * Get user ledger entries
 */
export const getUserLedger = async (
  userId: string,
  filters?: any
): Promise<any[]> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.type) params.append("type", filters.type);

  const response = await apiRequest<any[]>(
    `/admin/users/${userId}/ledger?${params.toString()}`
  );
  return response.data || [];
};

/**
 * Add ledger entry for user
 */
export const addLedgerEntry = async (
  userId: string,
  data: any
): Promise<any> => {
  const response = await apiRequest<any>(`/admin/users/${userId}/ledger`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Get organization ledger entries
 */
export const getOrganizationLedger = async (
  organizationId: string,
  filters?: any
): Promise<any[]> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.type) params.append("type", filters.type);

  const response = await apiRequest<any[]>(
    `/admin/organizations/${organizationId}/ledger?${params.toString()}`
  );
  return response.data || [];
};

/**
 * Add ledger entry for organization
 */
export const addOrganizationLedgerEntry = async (
  organizationId: string,
  data: any
): Promise<any> => {
  const response = await apiRequest<any>(
    `/admin/organizations/${organizationId}/ledger`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return response.data;
};

export default {
  login,
  logout,
  getCurrentUser,
  apiRequest,
  verifyToken,
  getToken,
  setToken,
  removeToken,
  // Organizations
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  // Users
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserRole,
  extendUserAccess,
  deleteUser,
  bulkUpdateUsers,
  // Permissions
  getOrganizationPermissions,
  updateOrganizationPermissions,
  resetOrganizationPermissions,
  // Statistics
  getAdminStats,
  // Audit logs
  getAuditLogs,
  // Ledger
  getUserLedger,
  addLedgerEntry,
  getOrganizationLedger,
  addOrganizationLedgerEntry,
};
