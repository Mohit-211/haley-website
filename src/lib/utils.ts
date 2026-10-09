import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True for images served from /public; remote (admin-entered) URLs skip the optimizer. */
export const isLocal = (src: string) => src.startsWith("/");
