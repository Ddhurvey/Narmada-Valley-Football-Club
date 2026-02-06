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
import { doc, setDoc, getDoc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { ROLES, Role, USER_STATUS, SUPER_ADMIN_EMAILS } from "./roles";
import { setSuperAdminUID, isSuperAdmin, logAudit } from "./admin";
import type { UserProfile } from "./admin";

export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  try {
    const existing = await getDoc(doc(db, "users", user.uid));
    if (existing.exists()) {
      return existing.data() as UserProfile;
    }

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "User",
      photoURL: user.photoURL || undefined,
      role: ROLES.USER,
      status: USER_STATUS.ACTIVE,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", user.uid), profile);
    return profile;
  } catch (error) {
    console.warn("Could not ensure user profile:", error);
    return null;
  }
}

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

    let role: Role = ROLES.USER;
    const superAdminSet = await setSuperAdminUID(user.uid);
    if (superAdminSet) {
      role = ROLES.SUPER_ADMIN;
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
      action: superAdminSet ? "SUPER_ADMIN_CREATED" : "USER_SIGNUP",
      resource: "user",
      resourceId: user.uid,
      timestamp: Timestamp.now(),
    });

    return { success: true, user };
  } catch (error: any) {
    // Provide more user-friendly error messages
    let errorMessage = "Failed to create account";
    
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak. Use at least 6 characters";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
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
    let profile: UserProfile | null = null;
    try {
      profile = await getUserProfile(user.uid);
    } catch (error) {
      console.warn("Could not fetch user profile (likely offline)", error);
      // Proceed without profile check if offline
    }

    if (profile?.status === USER_STATUS.BLOCKED) {
      await firebaseSignOut(auth);
      return { success: false, error: "Your account has been blocked. Please contact support." };
    }

    // Log the signin
    try {
      await logAudit({
        userId: user.uid,
        userName: profile?.displayName || "Unknown",
        action: "USER_SIGNIN",
        resource: "auth",
        resourceId: user.uid,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.warn("Could not log audit (likely offline)", error);
    }

    return { success: true, user };
  } catch (error: any) {
    // Provide more user-friendly error messages
    let errorMessage = "Failed to sign in";
    
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      errorMessage = "Invalid email or password";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (error.code === "auth/user-disabled") {
      errorMessage = "This account has been disabled";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed attempts. Please try again later";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Sign in with Google
 */
// Helper to timeout promises (prevent hanging on blocked connections)
async function withTimeout<T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Operation timed out after ${ms}ms. Using fallback.`);
      resolve(fallbackValue);
    }, ms);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    // 1. Auth Step (Google Popup) - This usually works even if DB is blocked
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // 2. Database Step (Risk of hanging if blocked) -> Wrap in Timeout
    try {
        // Try to fetching profile with 2.5s timeout only
        const userDocSnapshot = await withTimeout(
            getDoc(doc(db, "users", user.uid)),
            2500, // 2.5 seconds max wait
            null  // Fallback if timeout
        );

        if (!userDocSnapshot) {
             console.warn("Firestore timed out/blocked. Proceeding with basic auth.");
             // If we can't read DB, we assume standard user or check whitelist locally
             let role: Role = ROLES.USER;
             if (user.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
                 role = ROLES.SUPER_ADMIN;
             }
             return { success: true, user: { ...user, role } }; // Return extended user object if possible, or just user
        }
        
        const userDoc = userDocSnapshot; // Now strictly a DocumentSnapshot

        // 3. Normal Logic if DB connects
        if (userDoc.exists()) {
             // User exists
             const profile = userDoc.data() as UserProfile;
             if (profile.status === USER_STATUS.BLOCKED) {
                await firebaseSignOut(auth);
                return { success: false, error: "Account blocked." };
             }
             // Auto-upgrade check
             if (user.email && SUPER_ADMIN_EMAILS.includes(user.email) && profile.role !== ROLES.SUPER_ADMIN) {
                 // Fire and forget upgrade
                 setDoc(doc(db, "users", user.uid), { role: ROLES.SUPER_ADMIN }, { merge: true }).catch(console.warn);
             }
             return { success: true, user };
        } else {
             // New User (Create Profile)
             let role: Role = ROLES.USER;
             if (user.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
                role = ROLES.SUPER_ADMIN;
             }
             
             const newUserProfile: UserProfile = {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "Google User",
                photoURL: user.photoURL || undefined,
                role,
                status: USER_STATUS.ACTIVE,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
             };
             
             // Fire and forget creation
             setDoc(doc(db, "users", user.uid), newUserProfile).catch(console.warn);
             return { success: true, user };
        }

    } catch (dbError) {
        console.warn("Database Error (Ignored to allow login):", dbError);
        // Fallback success
        return { success: true, user };
    }

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

    try {
      await setDoc(doc(db, "users", user.uid), userProfile);
    } catch (e) {
       console.warn("Could not create anonymous profile", e);
    }

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
  try {
    const userDoc = await withTimeout(
      getDoc(doc(db, "users", uid)),
      2000, 
      null
    );
    if (userDoc && userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    console.warn("Error fetching user profile:", error);
    return null;
  }
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

/**
 * Update user profile information
 */
export interface AuditLog {
  id?: string;
  userId: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  timestamp: Timestamp;
  details?: string | Record<string, any>;
}
export async function updateUserProfile(
  userId: string,
  updates: {
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    address?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, "users", userId);
    
    // Prepare update data
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (updates.displayName !== undefined) {
      updateData.displayName = updates.displayName.trim();
    }
    if (updates.photoURL !== undefined) {
      updateData.photoURL = updates.photoURL;
    }
    if (updates.phoneNumber !== undefined) {
      updateData.phoneNumber = updates.phoneNumber.trim();
    }
    if (updates.address !== undefined) {
      updateData.address = updates.address.trim();
    }

    // Update Firestore
    await updateDoc(userRef, updateData);

    // Log the update
    try {
      await logAudit({
        userId,
        userName: updates.displayName || "Unknown",
        action: "PROFILE_UPDATE",
        resource: "user",
        resourceId: userId,
        timestamp: Timestamp.now(),
        changes: { summary: "Updated profile" },
      });
    } catch (error) {
      console.warn("Could not log audit (likely offline)", error);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    
    // Handle offline/blocked Firestore
    if (error.code === "unavailable" || error.message?.includes("offline")) {
      return { 
        success: false, 
        error: "Unable to update profile while offline. Please check your connection." 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to update profile. Please try again." 
    };
  }
}

