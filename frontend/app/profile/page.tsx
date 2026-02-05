"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/auth";
import { uploadProfilePicture, compressImage } from "@/lib/storage";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

interface UserProfile {
  displayName: string;
  email: string;
  role: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: string;
  status: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            setProfile(profileData);
            
            // Initialize form fields
            setDisplayName(profileData.displayName || "");
            setPhoneNumber(profileData.phoneNumber || "");
            setAddress(profileData.address || "");
            setPhotoURL(profileData.photoURL || "");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setMessage({ type: "error", text: "Failed to load profile data" });
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Please upload a JPG, PNG, or WebP image" });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be smaller than 5MB" });
      return;
    }

    try {
      // Compress image
      const compressedFile = await compressImage(file);
      setPhotoFile(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      setMessage({ type: "error", text: "Failed to process image" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      let newPhotoURL = photoURL;

      // Upload photo if changed
      if (photoFile) {
        try {
          newPhotoURL = await uploadProfilePicture(user.uid, photoFile);
        } catch (error: any) {
          setMessage({ type: "error", text: error.message });
          setSaving(false);
          return;
        }
      }

      // Update profile
      const result = await updateUserProfile(user.uid, {
        displayName,
        phoneNumber,
        address,
        photoURL: newPhotoURL,
      });

      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setPhotoURL(newPhotoURL);
        setPhotoFile(null);
        setPhotoPreview(null);
        
        // Refresh profile data
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update profile" });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setPhoneNumber(profile.phoneNumber || "");
      setAddress(profile.address || "");
      setPhotoFile(null);
      setPhotoPreview(null);
    }
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  const currentPhotoURL = photoPreview || photoURL || profile?.photoURL;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

            {message && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Profile Picture */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-nvfc-primary rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                    {currentPhotoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentPhotoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      displayName?.charAt(0) || user?.email?.charAt(0) || "U"
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG or WebP. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="mb-6">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-nvfc-primary focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-md border border-gray-200 text-gray-600">
                  {user?.email}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-nvfc-primary focus:border-transparent"
                  placeholder="+91 1234567890"
                />
              </div>

              {/* Address */}
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-nvfc-primary focus:border-transparent"
                  placeholder="Enter your address"
                />
              </div>

              {/* Account Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex gap-2 mb-2">
                  <span className="px-3 py-1 bg-nvfc-secondary/20 text-nvfc-dark rounded-full text-sm font-semibold">
                    {profile?.role || "User"}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {profile?.status || "Active"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  User ID: <span className="font-mono">{user?.uid}</span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
