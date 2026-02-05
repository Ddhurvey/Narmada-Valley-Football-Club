import { Timestamp } from "firebase/firestore";

/**
 * Layout configuration for a page
 */
export interface LayoutConfig {
  id: string;
  page: string; // 'home', 'news', 'fixtures', etc.
  name: string; // Human-readable name
  active: boolean;
  year: number;
  month?: string;
  event?: string; // Event ID if this layout is event-specific
  layoutTemplate: string; // 'hero_v1', 'hero_v2', etc.
  sections: SectionConfig[];
  theme: ThemeConfig;
  scheduledActivation?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

/**
 * Section configuration within a layout
 */
export interface SectionConfig {
  id: string;
  type: SectionType;
  order: number;
  visible: boolean;
  config: Record<string, any>; // Section-specific configuration
}

/**
 * Available section types
 */
export type SectionType =
  | "hero"
  | "news"
  | "fixtures"
  | "players"
  | "gallery"
  | "sponsors"
  | "stats"
  | "countdown"
  | "cta"
  | "custom";

/**
 * Theme configuration
 */
export interface ThemeConfig {
  id?: string;
  name: string;
  colors: ColorScheme;
  typography: Typography;
  animations: AnimationConfig;
  spacing: SpacingConfig;
}

/**
 * Color scheme
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

/**
 * Typography configuration
 */
export interface Typography {
  fontFamily: {
    display: string;
    body: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
    "5xl": string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  style: "smooth" | "energetic" | "minimal" | "festival";
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: string;
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  section: string;
  container: string;
  element: string;
}

/**
 * Event configuration
 */
export interface EventConfig {
  id: string;
  name: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  layoutId?: string; // Associated layout
  active: boolean;
  createdBy: string;
  createdAt: Timestamp;
}

/**
 * Hero section variants
 */
export type HeroVariant =
  | "default" // Full-screen with GSAP animations
  | "minimal" // Simple centered content
  | "split" // Split screen with image
  | "video" // Video background
  | "carousel"; // Multiple slides

/**
 * News section variants
 */
export type NewsVariant =
  | "grid" // Standard grid layout
  | "masonry" // Pinterest-style masonry
  | "featured" // Featured article + list
  | "carousel"; // Horizontal carousel

/**
 * Gallery section variants
 */
export type GalleryVariant =
  | "grid" // Standard grid
  | "masonry" // Masonry layout
  | "lightbox" // Grid with lightbox
  | "slider"; // Full-width slider
