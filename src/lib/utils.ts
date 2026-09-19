import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate an SEO-friendly slug supporting Thai and English characters.
 * - Converts to lowercase
 * - Replaces spaces and underscores with hyphens
 * - Removes special characters except Thai, English, numbers, and hyphens
 * - Removes consecutive hyphens and trims hyphens from ends
 */
export function generateSeoSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\u0E00-\u0E7F-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}
