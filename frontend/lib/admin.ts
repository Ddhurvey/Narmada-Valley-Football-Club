import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { ROLES, Role, USER_STATUS, UserStatus } from "./roles";

// Super Admin UID - This will be set during initial setup
// In production, this should come from environment variable or Firestore config
export const SUPER_ADMIN_UID_KEY = "lockedSuperAdminUID";

/**
 * User profile interface
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  status: UserStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
}

/**
 * Audit log interface
 */
export interface AuditLog {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  details?: string | Record<string, any>;
  timestamp: Timestamp;
  ipAddress?: string;
}

/**
 * Get the locked Super Admin UID from Firestore
 */
export async function getSuperAdminUID(): Promise<string | null> {
  try {
    const rolesDoc = await getDoc(doc(db, "roles", "config"));
    if (rolesDoc.exists()) {
      return rolesDoc.data()[SUPER_ADMIN_UID_KEY] || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Super Admin UID:", error);
    return null;
  }
}

/**
 * Set the Super Admin UID (can only be done once)
 */
export async function setSuperAdminUID(uid: string): Promise<boolean> {
  try {
    const rolesDoc = await getDoc(doc(db, "roles", "config"));
    
    // If Super Admin already exists, prevent overwrite
    if (rolesDoc.exists() && rolesDoc.data()[SUPER_ADMIN_UID_KEY]) {
      console.error("Super Admin UID already set and cannot be changed");
      return false;
    }
    
    await setDoc(doc(db, "roles", "config"), {
      [SUPER_ADMIN_UID_KEY]: uid,
      createdAt: Timestamp.now(),
    });
    
    return true;
  } catch (error) {
    console.error("Error setting Super Admin UID:", error);
    return false;
  }
}

/**
 * Check if a user is the Super Admin
 */
export async function isSuperAdmin(uid: string): Promise<boolean> {
  const superAdminUID = await getSuperAdminUID();
  return superAdminUID === uid;
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Get all users (Super Admin only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map((doc) => doc.data() as UserProfile);
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

/**
 * Create an admin (Super Admin only)
 */
export async function createAdmin(
  actorUID: string,
  targetUID: string,
  targetEmail: string,
  targetDisplayName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify actor is Super Admin
    const isActorSuperAdmin = await isSuperAdmin(actorUID);
    if (!isActorSuperAdmin) {
      return { success: false, error: "Only Super Admin can create admins" };
    }
    
    // Check if user already exists
    const existingUser = await getUserProfile(targetUID);
    if (existingUser) {
      // Update existing user to admin
      await updateDoc(doc(db, "users", targetUID), {
        role: ROLES.ADMIN,
        updatedAt: Timestamp.now(),
      });
      
      // Log the action
      await logAudit({
        userId: actorUID,
        userName: "Super Admin",
        action: "PROMOTE_TO_ADMIN",
        resource: "user",
        resourceId: targetUID,
        changes: { role: ROLES.ADMIN },
        timestamp: Timestamp.now(),
      });
    } else {
      // Create new admin user
      await setDoc(doc(db, "users", targetUID), {
        uid: targetUID,
        email: targetEmail,
        displayName: targetDisplayName,
        role: ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: actorUID,
      });
      
      // Log the action
      await logAudit({
        userId: actorUID,
        userName: "Super Admin",
        action: "CREATE_ADMIN",
        resource: "user",
        resourceId: targetUID,
        timestamp: Timestamp.now(),
      });
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove admin role (Super Admin only)
 */
export async function removeAdmin(
  actorUID: string,
  targetUID: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify actor is Super Admin
    const isActorSuperAdmin = await isSuperAdmin(actorUID);
    if (!isActorSuperAdmin) {
      return { success: false, error: "Only Super Admin can remove admins" };
    }
    
    // Prevent removing Super Admin
    const isTargetSuperAdmin = await isSuperAdmin(targetUID);
    if (isTargetSuperAdmin) {
      return { success: false, error: "Cannot remove Super Admin role" };
    }
    
    // Downgrade to user
    await updateDoc(doc(db, "users", targetUID), {
      role: ROLES.USER,
      updatedAt: Timestamp.now(),
    });
    
    // Log the action
    await logAudit({
      userId: actorUID,
      userName: "Super Admin",
      action: "REMOVE_ADMIN",
      resource: "user",
      resourceId: targetUID,
      changes: { role: ROLES.USER },
      timestamp: Timestamp.now(),
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error removing admin:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Block a user (Super Admin only)
 */
export async function blockUser(
  actorUID: string,
  targetUID: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify actor is Super Admin
    const isActorSuperAdmin = await isSuperAdmin(actorUID);
    if (!isActorSuperAdmin) {
      return { success: false, error: "Only Super Admin can block users" };
    }
    
    // Prevent blocking Super Admin
    const isTargetSuperAdmin = await isSuperAdmin(targetUID);
    if (isTargetSuperAdmin) {
      return { success: false, error: "Cannot block Super Admin" };
    }
    
    await updateDoc(doc(db, "users", targetUID), {
      status: USER_STATUS.BLOCKED,
      updatedAt: Timestamp.now(),
    });
    
    // Log the action
    await logAudit({
      userId: actorUID,
      userName: "Super Admin",
      action: "BLOCK_USER",
      resource: "user",
      resourceId: targetUID,
      changes: { status: USER_STATUS.BLOCKED },
      timestamp: Timestamp.now(),
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error blocking user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Unblock a user (Super Admin only)
 */
export async function unblockUser(
  actorUID: string,
  targetUID: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify actor is Super Admin
    const isActorSuperAdmin = await isSuperAdmin(actorUID);
    if (!isActorSuperAdmin) {
      return { success: false, error: "Only Super Admin can unblock users" };
    }
    
    await updateDoc(doc(db, "users", targetUID), {
      status: USER_STATUS.ACTIVE,
      updatedAt: Timestamp.now(),
    });
    
    // Log the action
    await logAudit({
      userId: actorUID,
      userName: "Super Admin",
      action: "UNBLOCK_USER",
      resource: "user",
      resourceId: targetUID,
      changes: { status: USER_STATUS.ACTIVE },
      timestamp: Timestamp.now(),
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error unblocking user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Log an audit event
 */
export async function logAudit(log: AuditLog): Promise<void> {
  try {
    await addDoc(collection(db, "auditLogs"), {
      ...log,
      timestamp: log.timestamp || Timestamp.now(),
    });
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
}

/**
 * Get audit logs (Super Admin only)
 */
export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  try {
    const logsQuery = query(
      collection(db, "auditLogs"),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(logsQuery);
    return snapshot.docs.slice(0, limit).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AuditLog[];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}
