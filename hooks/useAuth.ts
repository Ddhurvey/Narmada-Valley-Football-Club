"use client";

import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, checkIsSuperAdmin } from "@/lib/auth";
import { ROLES, Role, hasPermission, Permission, getRolePermissions } from "@/lib/roles";
import type { UserProfile } from "@/lib/admin";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  permissions: Permission[];
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isSuperAdmin: false,
    isAdmin: false,
    permissions: [],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user profile and role
        const profile = await getUserProfile(user.uid);
        const isSuperAdmin = await checkIsSuperAdmin(user.uid);
        const isAdmin = profile?.role === ROLES.ADMIN || profile?.role === ROLES.SUPER_ADMIN;
        const permissions = profile?.role ? getRolePermissions(profile.role) : [];

        setAuthState({
          user,
          profile,
          loading: false,
          isSuperAdmin,
          isAdmin,
          permissions,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          isSuperAdmin: false,
          isAdmin: false,
          permissions: [],
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
