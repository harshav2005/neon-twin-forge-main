import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  // These are placeholder paths that don't exist as real files — let the component handle fallback
  if (url === "/person.png" || url === "/default-avatar.png") return null;
  if (url.startsWith("http")) return url; // Already absolute (e.g. Cloudinary)
  if (url.startsWith("/default-avatar")) return null; // Default static asset placeholder

  // Normalization for Windows paths and legacy absolute paths
  let cleanUrl = url.replace(/\\/g, '/');

  // If the path contains 'uploads/', extracting everything after it ensures
  // we get a clean relative path like '/uploads/image.png' regardless of what came before
  if (cleanUrl.includes('uploads/')) {
    cleanUrl = '/uploads/' + cleanUrl.split('uploads/').pop();
  }
  // Ensure it starts with / if it doesn't already
  else if (!cleanUrl.startsWith('/')) {
    cleanUrl = `/${cleanUrl}`;
  }

  // It's a relative path from backend uploads
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Remove '/api' if present to get base URL
  const baseUrl = backendUrl.replace(/\/api$/, '');

  return `${baseUrl}${cleanUrl}`;
}
