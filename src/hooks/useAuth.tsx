"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { APP_CONFIG } from "@/config/constants";
import { supabase } from "@/config/supabase";

type UserRole = "admin" | "manager" | "user" | "restricted";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  appUser: AuthUser | null; // detailed profile (alias of user for now)
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>; // alias for convenience
  hasRole: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async (session: Session | null) => {
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("Fetching profile for user:", session.user.id);
      try {
        const res = await fetch(`/api/auth/me?supabaseUid=${session.user.id}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          toast.error("Session invalid. Logging out.");
          logout(); // This will trigger a reload, so no need to await.
          return;
        }

        const profile = await res.json();
        setUser({
          id: profile.id,
          email: profile.email,
          role: profile.role as UserRole,
          organizationId: profile.organizationId,
          isActive: profile.isActive,
        });
      } catch (e) {
        console.error("Profile fetch error:", e);
        toast.error("An error occurred while fetching your profile.");
        await logout();
      } finally {
        setLoading(false);
      }
    };

    // onAuthStateChange is the single source of truth.
    // It fires once on load with the initial session, and then on every auth event.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchUserProfile(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login Error Details:", error);
        toast.error(error.message || "Invalid login credentials");
        throw error;
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("Login failed");
      throw err;
    }
  };

  const logout = async () => {
    // Clear storage first, synchronously. This is the most important part.
    console.log("Performing aggressive logout: clearing all local and session storage.");
    localStorage.clear();
    sessionStorage.clear();
    setUser(null); // Update state immediately.

    try {
      // Then sign out from supabase.
      await supabase.auth.signOut();
      toast.success("Logged out successfully. Please log in again.");
    } catch (err) {
      console.error("Logout Error:", err);
      toast.error("Logout failed");
    } finally {
      // Force a reload to ensure the application starts fresh without any cached data.
      window.location.reload();
    }
  };

  const hasRole = (requiredRole: UserRole) => {
    if (!user) return false;

    const roleHierarchy = APP_CONFIG.AUTH.ROLE_HIERARCHY;
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
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
