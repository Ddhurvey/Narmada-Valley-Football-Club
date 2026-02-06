"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { compressImage } from "@/lib/storage";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

interface TeamItem {
  id: string;
  slug: string;
  label: string;
  order?: number;
}

interface GalleryRow {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  type: "image" | "youtube" | "live";
  teamSlug?: string;
  event?: string;
  date?: string;
  description?: string;
  createdAt?: Timestamp;
}

const emptyForm: GalleryRow = {
  id: "",
  title: "",
  url: "",
  thumbnail: "",
  type: "image",
  teamSlug: "",
  event: "",
  date: "",
  description: "",
};

const getYouTubeId = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    // ignore
  }
  return null;
};

const getYouTubeThumbnail = (url: string) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : "";
};

export default function AdminGalleryPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<GalleryRow[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [form, setForm] = useState<GalleryRow>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const galleryQuery = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(galleryQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<GalleryRow, "id">),
      }));
      setItems(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function loadTeams() {
      const teamsQuery = query(collection(db, "teams"), orderBy("order", "asc"));
      const snapshot = await getDocs(teamsQuery);
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TeamItem, "id">),
      }));
      setTeams(rows);
    }
    loadTeams();
  }, []);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.url) return;

    const derivedThumbnail =
      form.thumbnail || (form.type !== "image" ? getYouTubeThumbnail(form.url) : "");

    const payload = {
      title: form.title.trim(),
      url: form.url.trim(),
      thumbnail: derivedThumbnail || "",
      type: form.type,
      teamSlug: form.teamSlug || "",
      event: form.event || "",
      date: form.date || "",
      description: form.description || "",
      updatedAt: Timestamp.now(),
    };

    if (editingId) {
      await updateDoc(doc(db, "gallery", editingId), payload);
    } else {
      await addDoc(collection(db, "gallery"), {
        ...payload,
        createdAt: Timestamp.now(),
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (row: GalleryRow) => {
    setForm({ ...row });
    setEditingId(row.id);
    setShowForm(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this gallery item?")) return;
    await deleteDoc(doc(db, "gallery", id));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const maxSize = 8 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Image too large. Please upload under 8MB.");
        setUploading(false);
        return;
      }

      let optimizedFile = file;
      try {
        optimizedFile = await compressImage(file, 1600, 1600, 0.8);
      } catch (error) {
        console.warn("Compression failed, uploading original", error);
      }

      const storageRef = ref(storage, `media/gallery/${Date.now()}_${optimizedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, optimizedFile);

      const downloadURL = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      setForm((prev) => ({
        ...prev,
        url: downloadURL,
        title: prev.title || optimizedFile.name.replace(/\.[^/.]+$/, ""),
      }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setBulkStatus(`Uploading 0/${files.length}`);

    try {
      let completed = 0;
      for (const file of files) {
        const maxSize = 8 * 1024 * 1024;
        if (file.size > maxSize) {
          continue;
        }

        let optimizedFile = file;
        try {
          optimizedFile = await compressImage(file, 1600, 1600, 0.8);
        } catch (error) {
          console.warn("Compression failed, uploading original", error);
        }

        const storageRef = ref(storage, `media/gallery/${Date.now()}_${optimizedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, optimizedFile);

        const downloadURL = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });

        await addDoc(collection(db, "gallery"), {
          title: optimizedFile.name.replace(/\.[^/.]+$/, ""),
          url: downloadURL,
          type: "image",
          teamSlug: form.teamSlug || "",
          event: form.event || "",
          date: form.date || "",
          description: form.description || "",
          createdAt: Timestamp.now(),
        });

        completed += 1;
        setBulkStatus(`Uploading ${completed}/${files.length}`);
      }
    } catch (error) {
      console.error("Bulk upload failed", error);
      alert("Bulk upload failed. Please try again.");
    } finally {
      setUploading(false);
      setBulkStatus("");
      if (bulkInputRef.current) bulkInputRef.current.value = "";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-nvfc-dark">Gallery Manager</h1>
            <p className="text-gray-600">Team/event wise gallery images</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "Add Image"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={form.teamSlug}
                onChange={(e) => setForm({ ...form, teamSlug: e.target.value })}
              >
                <option value="">Select Team (optional)</option>
                {teams.map((team) => (
                  <option key={team.slug} value={team.slug}>
                    {team.label}
                  </option>
                ))}
              </select>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Event (optional)"
                value={form.event}
                onChange={(e) => setForm({ ...form, event: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as GalleryRow["type"] })}
              >
                <option value="image">Image</option>
                <option value="youtube">YouTube</option>
                <option value="live">Live</option>
              </select>
              <input
                className="border rounded-lg px-3 py-2 md:col-span-2"
                placeholder="Image/Video URL"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 md:col-span-3"
                placeholder="Thumbnail URL (optional for YouTube/live)"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              />
              <div className="md:col-span-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                <input
                  ref={bulkInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkUpload}
                  className="hidden"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="ml-3"
                  onClick={() => bulkInputRef.current?.click()}
                  disabled={uploading}
                >
                  Bulk Upload Images
                </Button>
                {uploading && <span className="ml-3 text-sm text-gray-600">{uploadProgress}%</span>}
                {bulkStatus && <span className="ml-3 text-sm text-gray-600">{bulkStatus}</span>}
              </div>
              <textarea
                className="border rounded-lg px-3 py-2 md:col-span-3"
                placeholder="Description (optional)"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="md:col-span-3 flex gap-3">
                <Button type="submit" variant="secondary">
                  {isEditing ? "Update" : "Save"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Preview</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Team</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Event</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={7}>
                      Loading gallery...
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={7}>
                      No gallery items found.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {item.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt={item.title} className="w-12 h-12 object-cover rounded" />
                      ) : item.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbnail} alt={item.title} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                          {item.type}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.title}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {teams.find((team) => team.slug === item.teamSlug)?.label || item.teamSlug || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.event || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{item.date || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{item.type}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteItem(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
