"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { APP_CONFIG } from "@/config/constants";
import { 
  UserRole, 
  OrganizationPermissions, 
  ModuleName, 
  PermissionAction 
} from "@/config/database.types";
import {
  hasPermission,
  hasSpecialPermission,
  getUserPermissions,
  canAssignRole,
  getMaxAssignableRole,
  isFeatureEnabled,
  DEFAULT_ORGANIZATION_PERMISSIONS
} from "@/utils/permissions";
import * as api from "@/services/api";

interface AuthUser {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  organizationPermissions?: OrganizationPermissions;
}

interface AuthContextType {
  user: AuthUser | null;
  appUser: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (requiredRole: UserRole) => boolean;
  hasPermission: (module: ModuleName, action: PermissionAction) => boolean;
  hasSpecialPermission: (permission: string) => boolean;
  canAssignRole: (targetRole: UserRole) => boolean;
  getMaxAssignableRole: () => UserRole;
  isFeatureEnabled: (feature: keyof OrganizationPermissions['features']) => boolean;
  getUserPermissions: () => {
    modules: Record<ModuleName, any>;
    specialPermissions: string[];
    restrictions: any;
  } | null;
  organizationPermissions: OrganizationPermissions | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token and get user profile
        const userData = await api.getCurrentUser();
        
        // Fetch organization permissions
        let organizationPermissions = DEFAULT_ORGANIZATION_PERMISSIONS;
        if (userData.organizationId || userData.organization_id) {
          try {
            const orgId = userData.organizationId || userData.organization_id;
            const orgData = await api.apiRequest(`/admin/organizations/${orgId}/permissions`);
            if (orgData.data) {
              organizationPermissions = orgData.data.permissions || DEFAULT_ORGANIZATION_PERMISSIONS;
            }
          } catch (e) {
            console.warn("Failed to fetch organization permissions, using defaults:", e);
          }
        }

        setUser({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          role: userData.role as UserRole,
          organizationId: userData.organizationId || userData.organization_id,
          isActive: userData.isActive || userData.is_active,
          organizationPermissions,
        });
      } catch (err) {
        console.error("Session validation failed:", err);
        api.removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await api.login(email, password);
      
      // Fetch organization permissions
      let organizationPermissions = DEFAULT_ORGANIZATION_PERMISSIONS;
      if (response.user.organizationId) {
        try {
          const orgData = await api.apiRequest(`/admin/organizations/${response.user.organizationId}/permissions`);
          if (orgData.data) {
            organizationPermissions = orgData.data.permissions || DEFAULT_ORGANIZATION_PERMISSIONS;
          }
        } catch (e) {
          console.warn("Failed to fetch organization permissions, using defaults:", e);
        }
      }

      setUser({
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        role: response.user.role as UserRole,
        organizationId: response.user.organizationId,
        isActive: response.user.isActive,
        organizationPermissions,
      });

      toast.success("Logged in successfully");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      toast.success("Logged out successfully");
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  };

  const hasRole = (requiredRole: UserRole) => {
    if (!user) return false;

    const roleHierarchy = APP_CONFIG.AUTH.ROLE_HIERARCHY;
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  // Organization-level permission methods
  const checkPermission = (module: ModuleName, action: PermissionAction): boolean => {
    if (!user || !user.organizationPermissions) return false;
    return hasPermission(user.organizationPermissions, user.role, module, action);
  };

  const checkSpecialPermission = (permission: string): boolean => {
    if (!user || !user.organizationPermissions) return false;
    return hasSpecialPermission(user.organizationPermissions, user.role, permission);
  };

  const checkCanAssignRole = (targetRole: UserRole): boolean => {
    if (!user || !user.organizationPermissions) return false;
    return canAssignRole(user.organizationPermissions, user.role, targetRole);
  };

  const getMaxRole = (): UserRole => {
    if (!user) return 'restricted';
    return getMaxAssignableRole(user.role);
  };

  const checkFeatureEnabled = (feature: keyof OrganizationPermissions['features']): boolean => {
    if (!user || !user.organizationPermissions) return false;
    return isFeatureEnabled(user.organizationPermissions, feature);
  };

  const getPermissions = () => {
    if (!user || !user.organizationPermissions) return null;
    return getUserPermissions(user.organizationPermissions, user.role);
  };

  const value = {
    user,
    appUser: user,
    loading,
    error,
    login,
    logout,
    signOut: logout,
    hasRole,
    hasPermission: checkPermission,
    hasSpecialPermission: checkSpecialPermission,
    canAssignRole: checkCanAssignRole,
    getMaxAssignableRole: getMaxRole,
    isFeatureEnabled: checkFeatureEnabled,
    getUserPermissions: getPermissions,
    organizationPermissions: user?.organizationPermissions || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
