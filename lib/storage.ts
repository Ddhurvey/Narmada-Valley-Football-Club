import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload a profile picture to Firebase Storage
 * @param userId - The user's UID
 * @param file - The image file to upload
 * @returns The download URL of the uploaded image
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPG, PNG, or WebP image.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size too large. Please upload an image smaller than 5MB.");
  }

  try {
    // Create a reference to the file location
    const fileExtension = file.name.split(".").pop();
    const fileName = `profile-picture.${fileExtension}`;
    const storageRef = ref(storage, `users/${userId}/${fileName}`);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading profile picture:", error);
    throw new Error("Failed to upload profile picture. Please try again.");
  }
}

/**
 * Delete a profile picture from Firebase Storage
 * @param userId - The user's UID
 */
export async function deleteProfilePicture(userId: string): Promise<void> {
  try {
    const storageRef = ref(storage, `users/${userId}/profile-picture.jpg`);
    await deleteObject(storageRef);
  } catch (error: any) {
    // Ignore errors if file doesn't exist
    if (error.code !== "storage/object-not-found") {
      console.error("Error deleting profile picture:", error);
    }
  }
}

/**
 * Compress and resize an image file
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - JPEG quality (0-1)
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}
