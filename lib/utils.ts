import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Basic XSS sanitization that strips HTML tags.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input.replace(/<[^>]*>?/gm, "");
}
