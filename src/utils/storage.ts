/**
 * 本地存储工具类
 * 提供 localStorage 的封装，支持 JSON 序列化/反序列化
 */

import logger from './logger';

const STORAGE_PREFIX = 'nextjs_admin_';
const trackedKeys = new Set<string>();

/**
 * 安全的 localStorage 操作
 */
export const Storage = {
  /**
   * 设置存储值
   * @param key 存储键
   * @param value 存储值（会自动序列化）
   */
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedValue);
      trackedKeys.add(key);
    } catch (error) {
      logger.error(`Failed to save to localStorage key "${key}":`, error);
    }
  },

  /**
   * 获取存储值
   * @param key 存储键
   * @param defaultValue 默认值（如果不存在时返回）
   * @returns 存储的值或默认值
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      logger.error(`Failed to read from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * 移除存储值
   * @param key 存储键
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    trackedKeys.delete(key);
  },

  /**
   * 清空所有带前缀的存储值
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    // 兜底：清理通过 Storage.set 记录的键
    trackedKeys.forEach((k) => {
      localStorage.removeItem(`${STORAGE_PREFIX}${k}`);
    });
    trackedKeys.clear();
  },
};

