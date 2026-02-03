import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, collections } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: Date;
  photoURL?: string;
}

// Sign up new user
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update profile
  await updateProfile(user, { displayName });

  // Create user document in Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName,
    role: "user",
    createdAt: new Date(),
  };

  await setDoc(doc(db, collections.users, user.uid), userProfile);

  return user;
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign out
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, collections.users, uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
};

// Check if user is admin
export const isAdmin = async (uid: string): Promise<boolean> => {
  const profile = await getUserProfile(uid);
  return profile?.role === "admin";
};

// Password reset
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
