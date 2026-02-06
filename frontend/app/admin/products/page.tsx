"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProductRow {
  id: string;
  name: string;
  price: string;
  category: string;
  imageUrl?: string;
  stock: number;
  status: "active" | "out_of_stock";
}

const emptyForm: ProductRow = {
  id: "",
  name: "",
  price: "",
  category: "Jerseys",
  imageUrl: "",
  stock: 0,
  status: "active",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductRow>(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(productsQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ProductRow, "id">),
      }));
      setProducts(rows);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const payload = {
      name: form.name,
      price: form.price,
      category: form.category,
      imageUrl: form.imageUrl || "",
      stock: form.stock,
      status: form.status,
      updatedAt: Timestamp.now(),
    };

    if (editingId) {
      await updateDoc(doc(db, "products", editingId), payload);
    } else {
      await addDoc(collection(db, "products"), {
        ...payload,
        createdAt: Timestamp.now(),
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (row: ProductRow) => {
    setForm({ ...row });
    setEditingId(row.id);
    setShowForm(true);
  };

  const updateStatus = async (id: string, status: ProductRow["status"]) => {
    await updateDoc(doc(db, "products", id), { status, updatedAt: Timestamp.now() });
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
  };

  return (
    <div className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-nvfc-dark">Product Management</h1>
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "Add Product"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleSubmit}>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Stock"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Jerseys">Jerseys</option>
                <option value="Accessories">Accessories</option>
                <option value="Training">Training</option>
                <option value="Equipment">Equipment</option>
              </select>
              <input
                className="border rounded-lg px-3 py-2 md:col-span-2"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProductRow["status"] })}
              >
                <option value="active">Active</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <div className="md:col-span-4 flex gap-3">
                <Button type="submit" variant="secondary">
                  {isEditing ? "Update Product" : "Save Product"}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={6}>
                      Loading products...
                    </td>
                  </tr>
                )}
                {!loading && products.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={6}>
                      No products found.
                    </td>
                  </tr>
                )}
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-gray-700">{p.category}</td>
                    <td className="px-6 py-4 text-gray-700">₹{p.price}</td>
                    <td className="px-6 py-4 text-gray-700">{p.stock}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          p.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status === "active" ? "active" : "out of stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(p.id, "active")}
                        >
                          Active
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(p.id, "out_of_stock")}
                        >
                          Out of Stock
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteProduct(p.id)}
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
