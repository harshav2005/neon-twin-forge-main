import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(url: string | undefined | null) {
  if (!url) return "/person.png"; // Default fallback
  if (url.startsWith("http")) return url; // Already absolute (e.g. Cloudinary)
  if (url.startsWith("/default-avatar")) return url; // Default static asset
  if (url === "/person.png") return url; // Default static asset

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
