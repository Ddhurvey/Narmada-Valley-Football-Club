"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export default function MediaPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [logo, setLogo] = useState<string>("/logo.png");
  const [heroImage, setHeroImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<"logo" | "hero" | "gallery">("logo");

  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  React.useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      const mediaDoc = await getDoc(doc(db, "settings", "media"));
      if (mediaDoc.exists()) {
        const data = mediaDoc.data();
        if (data.logo) setLogo(data.logo);
        if (data.heroImage) setHeroImage(data.heroImage);
      }
    } catch (error) {
      console.error("Error loading media:", error);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `media/${uploadType}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Save to Firestore
      const mediaDocRef = doc(db, "settings", "media");
      const updateData: any = {};
      updateData[uploadType] = downloadURL;
      updateData[`${uploadType}UpdatedAt`] = new Date();
      updateData[`${uploadType}UpdatedBy`] = user.uid;

      await setDoc(mediaDocRef, updateData, { merge: true });

      // Update local state
      if (uploadType === "logo") setLogo(downloadURL);
      if (uploadType === "hero") setHeroImage(downloadURL);

      alert(`${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} uploaded successfully!`);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Media Manager</h1>
          <p className="text-gray-600">Upload and manage website images</p>
        </motion.div>

        {/* Upload Section */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-nvfc-dark mb-6">Upload New Image</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image Type</label>
            <div className="flex gap-3">
              {["logo", "hero", "gallery"].map((type) => (
                <button
                  key={type}
                  onClick={() => setUploadType(type as any)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize ${
                    uploadType === type
                      ? "bg-nvfc-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-lg font-semibold mb-2">
              Upload {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Image
            </h3>
            <p className="text-gray-600 mb-4">
              Click the button below to select an image
            </p>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Select Image"}
            </Button>
          </div>
        </Card>

        {/* Current Media */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-nvfc-dark mb-4">Current Logo</h3>
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center mb-4">
              {logo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt="Logo" className="max-h-32 object-contain" />
                </>
              ) : (
                <div className="text-gray-400">No logo uploaded</div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setUploadType("logo");
                fileInputRef.current?.click();
              }}
            >
              Change Logo
            </Button>
          </Card>

          {/* Hero Image */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-nvfc-dark mb-4">Hero Background</h3>
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center mb-4 aspect-video">
              {heroImage ? (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={heroImage} 
                    alt="Hero" 
                    className="w-full h-full object-cover rounded" 
                  />
                </div>
              ) : (
                <div className="text-gray-400">No hero image uploaded</div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setUploadType("hero");
                fileInputRef.current?.click();
              }}
            >
              Change Hero Image
            </Button>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-lg mb-3 text-blue-900">📝 Instructions</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Logo:</strong> Used in header navigation (recommended: 200x200px, transparent PNG)</li>
            <li>• <strong>Hero:</strong> Background image for homepage hero section (recommended: 1920x1080px)</li>
            <li>• <strong>Gallery:</strong> Images for the gallery page (any size, will be optimized)</li>
            <li>• All images are stored in Firebase Storage and automatically optimized</li>
            <li>• Changes take effect immediately across the website</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
