"use client";

import { ReactNode } from "react";
import { usePermissionCheck } from "@/hooks/useOrganizationPermissions";
import { ModuleName, PermissionAction } from "@/config/database.types";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  module?: ModuleName;
  action?: PermissionAction;
  requiredRole?: 'admin' | 'manager';
  specialPermission?: string;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export default function ProtectedRoute({
  children,
  module,
  action = 'read',
  requiredRole,
  specialPermission,
  fallback,
  showFallback = true,
}: ProtectedRouteProps) {
  const { user, appUser, loading } = useAuth();
  const { canAccess, hasSpecialAccess, isAdmin, isManager } = usePermissionCheck();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!user || !appUser) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-white/60">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole === 'admin' && !isAdmin()) {
    return showFallback ? (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
            <p className="text-white/60">You need administrator privileges to access this page.</p>
          </div>
        </div>
      )
    ) : null;
  }

  if (requiredRole === 'manager' && !isManager()) {
    return showFallback ? (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Manager Access Required</h2>
            <p className="text-white/60">You need manager privileges or higher to access this page.</p>
          </div>
        </div>
      )
    ) : null;
  }

  // Check special permissions
  if (specialPermission && !hasSpecialAccess(specialPermission)) {
    return showFallback ? (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-white/60">You don't have the required special permissions to access this page.</p>
            <p className="text-white/40 text-sm mt-2">Required: {specialPermission}</p>
          </div>
        </div>
      )
    ) : null;
  }

  // Check module permissions
  if (module && !canAccess(module, action)) {
    return showFallback ? (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Module Access Denied</h2>
            <p className="text-white/60">You don't have permission to {action} in the {module} module.</p>
            <p className="text-white/40 text-sm mt-2">Contact your administrator to request access.</p>
          </div>
        </div>
      )
    ) : null;
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Convenience wrapper for common permission patterns
export function AdminOnlyRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function ManagerRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="manager" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function ModuleRoute({ 
  children, 
  module, 
  action = 'read', 
  fallback 
}: { 
  children: ReactNode; 
  module: ModuleName; 
  action?: PermissionAction; 
  fallback?: ReactNode; 
}) {
  return (
    <ProtectedRoute module={module} action={action} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}