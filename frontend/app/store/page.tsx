"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProductRow {
  id: string;
  name: string;
  price: string;
  category: string;
  imageUrl?: string;
  status: "active" | "out_of_stock";
}

export default function StorePage() {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Jerseys", "Accessories", "Training", "Equipment"];

  useEffect(() => {
    async function loadProducts() {
      const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(productsQuery);
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ProductRow, "id">),
      }));
      setProducts(rows.filter((p) => p.status === "active"));
      setLoading(false);
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">Official NVFC Store</h1>
          <p className="text-xl">Get your official merchandise and support the club</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Category Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-nvfc-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <div className="col-span-full text-center text-gray-500">Loading products...</div>
          )}
          {!loading && filteredProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No products available.</div>
          )}
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="overflow-hidden h-full">
                <div className="aspect-square bg-gradient-to-br from-nvfc-primary to-nvfc-accent flex items-center justify-center text-8xl overflow-hidden">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    "🛍️"
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs text-gray-500">{product.category}</span>
                  <h3 className="text-xl font-bold text-nvfc-dark mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-nvfc-primary">
                      ₹{product.price}
                    </span>
                    <Button variant="primary" size="sm" onClick={() => addToCart(product)}>
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Card className="p-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🛒</div>
                <div>
                  <div className="font-bold">{cart.length} items in cart</div>
                  <div className="text-sm text-gray-600">
                    Total: ₹{cart.reduce((sum, item) => sum + item.price, 0)}
                  </div>
                </div>
                <Button variant="primary">Checkout</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
