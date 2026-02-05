import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import type { LayoutConfig, EventConfig, ThemeConfig } from "@/types/layout";

/**
 * Get active layout for a specific page
 */
export async function getActiveLayout(page: string): Promise<LayoutConfig | null> {
  try {
    // First, check if there's an active event with a layout
    const eventLayout = await getEventLayout(page);
    if (eventLayout) return eventLayout;

    // Otherwise, get the active layout for this page
    const layoutsQuery = query(
      collection(db, "layouts"),
      where("page", "==", page),
      where("active", "==", true),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(layoutsQuery);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as LayoutConfig;
    }

    return null;
  } catch (error) {
    console.error("Error fetching active layout:", error);
    return null;
  }
}

/**
 * Get layout for current active event
 */
async function getEventLayout(page: string): Promise<LayoutConfig | null> {
  try {
    const now = Timestamp.now();

    // Find active event
    const eventsQuery = query(
      collection(db, "events"),
      where("active", "==", true),
      where("startDate", "<=", now),
      where("endDate", ">=", now)
    );

    const eventsSnapshot = await getDocs(eventsQuery);
    if (eventsSnapshot.empty) return null;

    const event = eventsSnapshot.docs[0].data() as EventConfig;
    if (!event.layoutId) return null;

    // Get the event's layout
    const layoutDoc = await getDoc(doc(db, "layouts", event.layoutId));
    if (layoutDoc.exists() && layoutDoc.data().page === page) {
      return { id: layoutDoc.id, ...layoutDoc.data() } as LayoutConfig;
    }

    return null;
  } catch (error) {
    console.error("Error fetching event layout:", error);
    return null;
  }
}

/**
 * Get layout by ID
 */
export async function getLayoutById(layoutId: string): Promise<LayoutConfig | null> {
  try {
    const layoutDoc = await getDoc(doc(db, "layouts", layoutId));
    if (layoutDoc.exists()) {
      return { id: layoutDoc.id, ...layoutDoc.data() } as LayoutConfig;
    }
    return null;
  } catch (error) {
    console.error("Error fetching layout by ID:", error);
    return null;
  }
}

/**
 * Get all layouts for a page
 */
export async function getPageLayouts(page: string): Promise<LayoutConfig[]> {
  try {
    const layoutsQuery = query(
      collection(db, "layouts"),
      where("page", "==", page),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(layoutsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LayoutConfig));
  } catch (error) {
    console.error("Error fetching page layouts:", error);
    return [];
  }
}

/**
 * Create a new layout
 */
export async function createLayout(
  layout: Omit<LayoutConfig, "id" | "createdAt" | "updatedAt" | "version">
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const newLayout = {
      ...layout,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      version: 1,
    };

    const docRef = await addDoc(collection(db, "layouts"), newLayout);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error creating layout:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing layout
 */
export async function updateLayout(
  layoutId: string,
  updates: Partial<LayoutConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    const layoutRef = doc(db, "layouts", layoutId);
    const layoutDoc = await getDoc(layoutRef);

    if (!layoutDoc.exists()) {
      return { success: false, error: "Layout not found" };
    }

    const currentVersion = layoutDoc.data().version || 1;

    await updateDoc(layoutRef, {
      ...updates,
      updatedAt: Timestamp.now(),
      version: currentVersion + 1,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating layout:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Activate a layout (deactivates others for the same page)
 */
export async function activateLayout(
  layoutId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const layoutDoc = await getDoc(doc(db, "layouts", layoutId));
    if (!layoutDoc.exists()) {
      return { success: false, error: "Layout not found" };
    }

    const layout = layoutDoc.data() as LayoutConfig;

    // Deactivate all other layouts for this page
    const layoutsQuery = query(
      collection(db, "layouts"),
      where("page", "==", layout.page),
      where("active", "==", true)
    );

    const snapshot = await getDocs(layoutsQuery);
    const deactivatePromises = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { active: false, updatedAt: Timestamp.now() })
    );

    await Promise.all(deactivatePromises);

    // Activate the selected layout
    await updateDoc(doc(db, "layouts", layoutId), {
      active: true,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error activating layout:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get current active event
 */
export async function getActiveEvent(): Promise<EventConfig | null> {
  try {
    const now = Timestamp.now();

    const eventsQuery = query(
      collection(db, "events"),
      where("active", "==", true),
      where("startDate", "<=", now),
      where("endDate", ">=", now),
      limit(1)
    );

    const snapshot = await getDocs(eventsQuery);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as EventConfig;
    }

    return null;
  } catch (error) {
    console.error("Error fetching active event:", error);
    return null;
  }
}

/**
 * Create a new event
 */
export async function createEvent(
  event: Omit<EventConfig, "id" | "createdAt">
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const newEvent = {
      ...event,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "events"), newEvent);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all themes
 */
export async function getThemes(): Promise<ThemeConfig[]> {
  try {
    const themesQuery = query(collection(db, "themes"), orderBy("name", "asc"));
    const snapshot = await getDocs(themesQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ThemeConfig));
  } catch (error) {
    console.error("Error fetching themes:", error);
    return [];
  }
}

/**
 * Apply theme to CSS variables
 */
export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;

  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (typeof value === "string") {
      root.style.setProperty(`--color-${key}`, value);
    } else if (typeof value === "object") {
      Object.entries(value).forEach(([subKey, subValue]) => {
        root.style.setProperty(`--color-${key}-${subKey}`, String(subValue));
      });
    }
  });

  // Apply typography
  root.style.setProperty("--font-display", theme.typography.fontFamily.display);
  root.style.setProperty("--font-body", theme.typography.fontFamily.body);
  root.style.setProperty("--font-mono", theme.typography.fontFamily.mono);

  // Apply animation settings
  root.style.setProperty("--animation-duration-fast", `${theme.animations.duration.fast}ms`);
  root.style.setProperty("--animation-duration-normal", `${theme.animations.duration.normal}ms`);
  root.style.setProperty("--animation-duration-slow", `${theme.animations.duration.slow}ms`);
  root.style.setProperty("--animation-easing", theme.animations.easing);
}
