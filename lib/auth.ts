import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { ROLES, Role, USER_STATUS, UserStatus } from "./roles";
import { getSuperAdminUID, setSuperAdminUID, isSuperAdmin, logAudit } from "./admin";
import type { UserProfile } from "./admin";

/**
 * Sign up a new user
 * First user becomes Super Admin automatically
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Check if this is the first user (Super Admin)
  const superAdminUID = await getSuperAdminUID();
  const isFirstUser = !superAdminUID;

  let role: Role = ROLES.USER;

  if (isFirstUser) {
    // First user becomes Super Admin
    role = ROLES.SUPER_ADMIN;
    await setSuperAdminUID(user.uid);
  }

  // Create user profile in Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || "",
    displayName,
    role,
    status: USER_STATUS.ACTIVE,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(doc(db, "users", user.uid), userProfile);

  // Log the signup
  await logAudit({
    userId: user.uid,
    userName: displayName,
    action: isFirstUser ? "SUPER_ADMIN_CREATED" : "USER_SIGNUP",
    resource: "user",
    resourceId: user.uid,
    timestamp: Timestamp.now(),
  });

  return user;
}
/**
 * Sign in an existing user
 * Checks if user is blocked
 */
export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Check if user is blocked
  const profile = await getUserProfile(user.uid);
  if (profile?.status === USER_STATUS.BLOCKED) {
    await signOut(auth);
    throw new Error("Your account has been blocked. Please contact support.");
  }

  // Log the signin
  await logAudit({
    userId: user.uid,
    userName: profile?.displayName || "Unknown",
    action: "USER_SIGNIN",
    resource: "auth",
    resourceId: user.uid,
    timestamp: Timestamp.now(),
  });

  return user;
}

// Sign out
export const logout = async (): Promise<void> => {
  await signOut(auth);
};
/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
}

/**
 * Check if user is admin or super admin
 */
export async function isAdmin(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  return profile?.role === ROLES.ADMIN || profile?.role === ROLES.SUPER_ADMIN;
}

/**
 * Check if user is super admin
 */
export async function checkIsSuperAdmin(uid: string): Promise<boolean> {
  return await isSuperAdmin(uid);
}

// Password reset
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
