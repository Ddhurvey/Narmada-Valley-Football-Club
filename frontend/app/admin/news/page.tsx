"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { NewsArticle, getAllNews, deleteNewsArticle, createNewsArticle, updateNewsArticle, CATEGORIES } from "@/lib/news";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AdminNewsPage() {
  const { isSuperAdmin, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    title: "",
    excerpt: "",
    content: "",
    category: CATEGORIES[0],
    image: "",
    author: "NVFC Media Team",
    isPublished: true
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      loadNews();
    }
  }, [isAdmin]);

  async function loadNews() {
    setLoading(true);
    const data = await getAllNews();
    setArticles(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) return;
    
    await deleteNewsArticle(id);
    loadNews();
  }

  function handleEdit(article: NewsArticle) {
    setFormData({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        image: article.image,
        author: article.author,
        isPublished: article.isPublished
    });
    setEditId(article.id);
    setIsEditing(true);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditId(null);
    setFormData(initialFormState);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    let result;
    if (isEditing && editId) {
        // Update Logic
        result = await updateNewsArticle(editId, formData);
    } else {
        // Create Logic
        result = await createNewsArticle(formData);
    }
    
    if (result.success) {
      alert(isEditing ? "Article updated successfully!" : "Article published successfully!");
      handleCloseModal();
      loadNews();
    } else {
      alert("Failed: " + result.error);
    }
    
    setIsSubmitting(false);
  }

  if (authLoading || loading) {
     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container-custom py-12 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-4xl font-bold text-nvfc-dark">News Management</h1>
           <p className="text-gray-600">Manage club news and announcements</p>
        </div>
        <Button onClick={() => { setFormData(initialFormState); setIsEditing(false); setIsModalOpen(true); }} variant="primary">
            + Write Article
        </Button>
      </div>

      {articles.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
             <div className="text-5xl mb-4">📝</div>
             <p className="text-xl">No articles found.</p>
             <p>Start by writing your first news post.</p>
          </Card>
      ) : (
          <div className="grid grid-cols-1 gap-4">
              {articles.map((article) => (
                  <motion.div 
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                      <Card className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                          {/* Thumbnail */}
                          <div className="w-full md:w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                {article.image ? (
                                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">📰</span>
                                )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">
                                      {article.category}
                                  </span>
                                  <span className="text-xs text-gray-500">{article.date}</span>
                                  {!article.isPublished && (
                                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Draft</span>
                                  )}
                              </div>
                              <h3 className="font-bold text-lg text-nvfc-dark">{article.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-1">{article.excerpt}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                                  Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(article.id)}
                              >
                                  Delete
                              </Button>
                          </div>
                      </Card>
                  </motion.div>
              ))}
          </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                  <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                      <h2 className="text-xl font-bold">{isEditing ? "Edit Article" : "Write New Article"}</h2>
                      <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      {/* Title */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input 
                            required
                            type="text" 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nvfc-primary outline-none"
                            placeholder="e.g. NVFC Wins the League!"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                      </div>

                      {/* Excerpt */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Summary)</label>
                          <textarea 
                            required
                            rows={2}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nvfc-primary outline-none"
                            placeholder="Short summary for the card view..."
                            value={formData.excerpt}
                            onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                          />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Category */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <select 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nvfc-primary outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                              >
                                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                          </div>

                           {/* Author */}
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                              <input 
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nvfc-primary outline-none"
                                value={formData.author}
                                onChange={(e) => setFormData({...formData, author: e.target.value})}
                              />
                          </div>
                      </div>

                      {/* Image URL */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nvfc-primary outline-none"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                          />
                          <p className="text-xs text-gray-400 mt-1">Provide a direct link to an image (e.g. from Imgur, Unsplash, or your own hosting).</p>
                      </div>

                      {/* Content */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Main Content</label>
                          <textarea 
                            required
                            rows={8}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nvfc-primary outline-none font-mono text-sm"
                            placeholder="Write your article here..."
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                          />
                      </div>
                      
                      <div className="flex gap-4 pt-4 border-t mt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-1/3"
                            onClick={handleCloseModal}
                          >
                              Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-2/3"
                            isLoading={isSubmitting}
                          >
                              {isEditing ? "Update Article" : "Publish Article"}
                          </Button>
                      </div>
                  </form>
              </motion.div>
          </div>
      )}
    </div>
  );
}
