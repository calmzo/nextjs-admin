import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS class names with conditional logic.
 * @example
 * cn("bg-white", isActive && "text-black", "px-4") → "bg-white text-black px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/**
 * 日志工具
 * @example
 * import logger from '@/utils/logger';
 * logger.info('User logged in', user);
 * logger.error('Failed to fetch data', error);
 */
export { default as logger } from './logger';
