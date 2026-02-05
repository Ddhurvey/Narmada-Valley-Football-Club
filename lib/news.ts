import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  Timestamp,
  addDoc
} from "firebase/firestore";
import { db } from "./firebase";

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  category: string;
  author: string;
  isPublished: boolean;
  createdAt: Timestamp;
}

export const CATEGORIES = ["Transfers", "Match Preview", "Academy", "Community", "Interviews", "Commercial", "Club News"];

/**
 * Fetch all news articles from Firestore
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

/**
 * Create a new news article
 */
export async function createNewsArticle(article: Omit<NewsArticle, "id" | "createdAt" | "date">): Promise<{ success: boolean; error?: string }> {
  try {
    const slug = article.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newArticle = {
      ...article,
      slug,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, "news"), newArticle);
    return { success: true };
  } catch (error: any) {
    console.error("Error creating news article:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a news article
 */
export async function deleteNewsArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "news", id));
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting news article:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a news article
 */
export async function updateNewsArticle(id: string, updates: Partial<NewsArticle>): Promise<{ success: boolean; error?: string }> {
    try {
        await updateDoc(doc(db, "news", id), updates);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating news article:", error);
        return { success: false, error: error.message };
    }
}
