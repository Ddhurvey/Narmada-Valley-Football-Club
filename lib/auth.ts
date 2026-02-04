import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { ROLES, Role, USER_STATUS } from "./roles";
import { getSuperAdminUID, setSuperAdminUID, isSuperAdmin, logAudit } from "./admin";
import type { UserProfile } from "./admin";

/**
 * Sign up a new user with email/password
 * First user becomes Super Admin automatically
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign in with email/password
 */
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user is blocked
    const profile = await getUserProfile(user.uid);
    if (profile?.status === USER_STATUS.BLOCKED) {
      await firebaseSignOut(auth);
      return { success: false, error: "Your account has been blocked. Please contact support." };
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

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // Check if this is the first user
      const superAdminUID = await getSuperAdminUID();
      const isFirstUser = !superAdminUID;

      let role: Role = ROLES.USER;

      if (isFirstUser) {
        role = ROLES.SUPER_ADMIN;
        await setSuperAdminUID(user.uid);
      }

      // Create user document for new Google users
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "Google User",
        photoURL: user.photoURL,
        role,
        status: USER_STATUS.ACTIVE,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "users", user.uid), userProfile);

      await logAudit({
        userId: user.uid,
        userName: user.displayName || "Google User",
        action: isFirstUser ? "SUPER_ADMIN_CREATED" : "USER_SIGNUP",
        resource: "user",
        resourceId: user.uid,
        timestamp: Timestamp.now(),
      });
    } else {
      // Check if user is blocked
      const profile = userDoc.data() as UserProfile;
      if (profile.status === USER_STATUS.BLOCKED) {
        await firebaseSignOut(auth);
        return { success: false, error: "Your account has been blocked. Please contact support." };
      }

      await logAudit({
        userId: user.uid,
        userName: profile.displayName,
        action: "USER_SIGNIN",
        resource: "auth",
        resourceId: user.uid,
        timestamp: Timestamp.now(),
      });
    }

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign in anonymously
 */
export async function signInAnonymouslyUser() {
  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    // Create anonymous user document
    const userProfile: UserProfile = {
      uid: user.uid,
      email: "",
      displayName: "Anonymous User",
      role: ROLES.USER,
      status: USER_STATUS.ACTIVE,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);

    await logAudit({
      userId: user.uid,
      userName: "Anonymous User",
      action: "ANONYMOUS_SIGNIN",
      resource: "auth",
      resourceId: user.uid,
      timestamp: Timestamp.now(),
    });

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

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

/**
 * Password reset
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Auth state observer
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
