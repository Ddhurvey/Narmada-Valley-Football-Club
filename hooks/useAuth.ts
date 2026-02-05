"use client";

import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, checkIsSuperAdmin } from "@/lib/auth";
import { ROLES, Role, hasPermission, Permission, getRolePermissions, SUPER_ADMIN_EMAILS } from "@/lib/roles";
import type { UserProfile } from "@/lib/admin";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  permissions: Permission[];
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isSuperAdmin: false,
    isAdmin: false,
    permissions: [],
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile and role
          const profile = await getUserProfile(user.uid);
          
          // Whitelist Check (Fast Path)
          const isWhitelisted = user.email && SUPER_ADMIN_EMAILS.includes(user.email);
          
          const isSuperAdmin = isWhitelisted || await checkIsSuperAdmin(user.uid);
          const isAdmin = isWhitelisted || profile?.role === ROLES.ADMIN || profile?.role === ROLES.SUPER_ADMIN;
          
          // Determine permissions: Use explicit role or assume Super Admin perms if whitelisted
          let permissions: Permission[] = [];
          if (profile?.role) {
             permissions = getRolePermissions(profile.role);
          } else if (isWhitelisted) {
             permissions = getRolePermissions(ROLES.SUPER_ADMIN);
          }

          setAuthState({
            user,
            profile,
            loading: false,
            isSuperAdmin: !!isSuperAdmin,
            isAdmin: !!isAdmin,
            permissions,
            error: null,
          });
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          
          // Fallback whitelist check even on error
          const isWhitelisted = user.email && SUPER_ADMIN_EMAILS.includes(user.email);
          let permissions: Permission[] = [];
          if (isWhitelisted) {
             permissions = getRolePermissions(ROLES.SUPER_ADMIN);
          }

          setAuthState({
            user,
            profile: null,
            loading: false,
            isSuperAdmin: !!isWhitelisted,
            isAdmin: !!isWhitelisted,
            permissions,
            error: error.message || "Failed to load user profile",
          });
        }
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          isSuperAdmin: false,
          isAdmin: false,
          permissions: [],
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Check if user has a specific permission
   */
  const can = (permission: Permission): boolean => {
    if (!authState.profile) return false;
    return hasPermission(authState.profile.role, permission);
  };

  /**
   * Check if user has all specified permissions
   */
  const canAll = (permissions: Permission[]): boolean => {
    if (!authState.profile) return false;
    return permissions.every((permission) => hasPermission(authState.profile!.role, permission));
  };

  /**
   * Check if user has any of the specified permissions
   */
  const canAny = (permissions: Permission[]): boolean => {
    if (!authState.profile) return false;
    return permissions.some((permission) => hasPermission(authState.profile!.role, permission));
  };

  return {
    ...authState,
    can,
    canAll,
    canAny,
  };
}
