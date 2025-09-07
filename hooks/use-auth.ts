/**
 * Hook d'authentification sécurisé avec Redux/RTK Query
 * Optimisé selon consigne.md pour performance et mobile-first
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { 
  useAppDispatch,
  useCurrentUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError
} from "./use-redux";
import { 
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery
} from "@/lib/store";
import { logout as logoutAction } from "@/lib/store";
import type { UserRole } from "@/lib/models/user/types";

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (requiredRole: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  requireAuth: () => void;
  requireRole: (requiredRole: UserRole) => void;
  redirectToDashboard: () => void;
}

// Utility functions moved from auth-utils-client
const hasRoleUtil = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const hierarchy: Record<UserRole, UserRole[]> = {
    admin: ['admin', 'manager', 'staff', 'client'],
    manager: ['manager', 'staff', 'client'], 
    staff: ['staff', 'client'],
    client: ['client']
  };
  return hierarchy[userRole]?.includes(requiredRole) || false;
};

const getRedirectPath = (_role: UserRole): string => {
  // Pour l'instant, tous les utilisateurs vont sur la page d'accueil
  return '/';
  
  // Future logique de redirection basée sur le rôle (commentée)
  // switch (role) {
  //   case 'admin': return '/dashboard/admin';
  //   case 'manager': return '/dashboard/manager'; 
  //   case 'staff': return '/dashboard/staff';
  //   case 'client': return '/dashboard';
  //   default: return '/dashboard';
  // }
};

export function useAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Redux state
  const user = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  
  // RTK Query mutations
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  
  // Auto-fetch current user on load (if needed)
  useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated || !!user,
  });

  // Memoized actions for performance
  const authActions: AuthActions = useMemo(() => ({
    login: async (email: string, password: string) => {
      try {
        const result = await loginMutation({ email, password }).unwrap();
        if (result.success) {
          // Token is automatically stored via Redux state
          router.push(getRedirectPath(result.user.role));
        }
      } catch {
        throw new Error('Login failed');
      }
    },

    register: async (firstName: string, lastName: string, email: string, password: string) => {
      try {
        const result = await registerMutation({ 
          firstName,
          lastName,
          email, 
          password
        }).unwrap();
        if (result.success) {
          router.push(getRedirectPath(result.user.role));
        }
      } catch (error) {
        // Handle registration error silently
        throw new Error('Registration failed');
      }
    },

    logout: async () => {
      try {
        await logoutMutation().unwrap();
        dispatch(logoutAction());
        router.push('/login');
      } catch {
        // Logout locally even if server fails
        dispatch(logoutAction());
        router.push('/login');
      }
    },

    hasRole: (requiredRole: UserRole) => {
      if (!user) return false;
      return hasRoleUtil(user.role, requiredRole);
    },

    hasPermission: (permission: string) => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },

    requireAuth: () => {
      if (!isAuthenticated) {
        const currentUrl = window.location.pathname + window.location.search;
        const loginUrl = currentUrl !== "/login" 
          ? `/login?callbackUrl=${encodeURIComponent(currentUrl)}`
          : "/login";
        router.push(loginUrl);
      }
    },

    requireRole: (requiredRole: UserRole) => {
      if (!isAuthenticated) {
        const currentUrl = window.location.pathname + window.location.search;
        router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
        return;
      }

      if (!user || !hasRoleUtil(user.role, requiredRole)) {
        const redirectPath = user ? getRedirectPath(user.role) : "/login";
        router.push(redirectPath);
      }
    },

    redirectToDashboard: () => {
      if (user) {
        router.push(getRedirectPath(user.role));
      } else {
        router.push("/login");
      }
    },
  }), [user, isAuthenticated, loginMutation, registerMutation, logoutMutation, dispatch, router]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    // Actions
    ...authActions
  };
}

/**
 * Hook pour la protection des composants par rôle
 */
export function useRequireRole(requiredRole: UserRole) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading) {
      auth.requireRole(requiredRole);
    }
  }, [auth, requiredRole]);

  return auth;
}

/**
 * Hook pour la protection des composants par authentification
 */
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading) {
      auth.requireAuth();
    }
  }, [auth]);

  return auth;
}
