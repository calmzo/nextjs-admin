/**
 * 路由缓存管理器
 * 提供路由缓存、权限缓存、菜单缓存等功能
 */

import { useCallback, useMemo } from 'react';
import type { MenuRouteConfig } from './menu-router';
import type { MenuTreeNode } from '@/types';
import logger from '@/utils/logger';

// ==================== 路由缓存类型定义 ====================

/**
 * 路由缓存配置
 */
export interface RouteCacheConfig {
  // 是否启用缓存
  enabled: boolean;
  // 缓存过期时间（毫秒）
  expireTime: number;
  // 最大缓存数量
  maxSize: number;
  // 缓存清理间隔（毫秒）
  cleanupInterval: number;
  // 是否启用持久化
  persistent: boolean;
  // 持久化存储键
  storageKey: string;
}

/**
 * 路由缓存项
 */
export interface RouteCacheItem<T = unknown> {
  // 缓存键
  key: string;
  // 缓存值
  value: T;
  // 创建时间
  createdAt: number;
  // 过期时间
  expiresAt: number;
  // 访问次数
  accessCount: number;
  // 最后访问时间
  lastAccessedAt: number;
  // 缓存大小
  size: number;
}

/**
 * 路由缓存统计
 */
export interface RouteCacheStats {
  // 总缓存数量
  totalItems: number;
  // 有效缓存数量
  validItems: number;
  // 过期缓存数量
  expiredItems: number;
  // 总缓存大小
  totalSize: number;
  // 命中率
  hitRate: number;
  // 命中次数
  hitCount: number;
  // 未命中次数
  missCount: number;
}

/**
 * 路由缓存事件
 */
export interface RouteCacheEvent {
  // 事件类型
  type: 'set' | 'get' | 'delete' | 'clear' | 'expire' | 'cleanup';
  // 缓存键
  key: string;
  // 时间戳
  timestamp: number;
  // 事件数据
  data?: unknown;
}

// ==================== 路由缓存管理器 ====================

/**
 * 路由缓存管理器
 */
export class RouteCacheManager {
  private cache: Map<string, RouteCacheItem> = new Map();
  private config: RouteCacheConfig;
  private stats: RouteCacheStats;
  private eventListeners: Map<string, (event: RouteCacheEvent) => void> = new Map();
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<RouteCacheConfig> = {}) {
    this.config = {
      enabled: true,
      expireTime: 30 * 60 * 1000, // 30分钟
      maxSize: 1000,
      cleanupInterval: 5 * 60 * 1000, // 5分钟
      persistent: false,
      storageKey: 'route_cache',
      ...config
    };

    this.stats = {
      totalItems: 0,
      validItems: 0,
      expiredItems: 0,
      totalSize: 0,
      hitRate: 0,
      hitCount: 0,
      missCount: 0
    };

    this.initializeCache();
  }

  /**
   * 初始化缓存
   */
  private initializeCache(): void {
    if (this.config.persistent) {
      this.loadFromStorage();
    }

    if (this.config.enabled) {
      this.startCleanupTimer();
    }
  }

  /**
   * 设置缓存
   */
  setCache<T>(key: string, value: T, expireTime?: number): void {
    if (!this.config.enabled) return;

    const now = Date.now();
    const expiresAt = now + (expireTime || this.config.expireTime);
    const size = this.calculateSize(value);

    const cacheItem: RouteCacheItem<T> = {
      key,
      value,
      createdAt: now,
      expiresAt,
      accessCount: 0,
      lastAccessedAt: now,
      size
    };

    this.cache.set(key, cacheItem);
    this.updateStats();
    this.emitEvent('set', key, { value, expiresAt });

    // 检查缓存大小限制
    if (this.cache.size > this.config.maxSize) {
      this.cleanupOldestItems();
    }

    // 持久化缓存
    if (this.config.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * 获取缓存
   */
  getCache<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const cacheItem = this.cache.get(key);
    if (!cacheItem) {
      this.stats.missCount++;
      this.updateHitRate();
      return null;
    }

    const now = Date.now();
    if (now > cacheItem.expiresAt) {
      this.cache.delete(key);
      this.stats.missCount++;
      this.updateHitRate();
      this.emitEvent('expire', key);
      return null;
    }

    // 更新访问信息
    cacheItem.accessCount++;
    cacheItem.lastAccessedAt = now;
    this.cache.set(key, cacheItem);
    this.stats.hitCount++;
    this.updateHitRate();
    this.emitEvent('get', key);

    return cacheItem.value as T;
  }

  /**
   * 删除缓存
   */
  deleteCache(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
      this.emitEvent('delete', key);
      
      if (this.config.persistent) {
        this.saveToStorage();
      }
    }
    return deleted;
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.updateStats();
    this.emitEvent('clear', 'all');
    
    if (this.config.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * 检查缓存是否存在
   */
  hasCache(key: string): boolean {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return false;
    
    const now = Date.now();
    if (now > cacheItem.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): RouteCacheStats {
    return { ...this.stats };
  }

  /**
   * 清理过期缓存
   */
  cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache) {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.emitEvent('expire', key);
    });

    this.updateStats();
    this.emitEvent('cleanup', 'expired', { count: expiredKeys.length });
  }

  /**
   * 清理最旧的缓存项
   */
  private cleanupOldestItems(): void {
    const items = Array.from(this.cache.values())
      .sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

    const itemsToRemove = items.slice(0, Math.floor(this.config.maxSize * 0.1));
    itemsToRemove.forEach(item => {
      this.cache.delete(item.key);
    });

    this.updateStats();
  }

  /**
   * 计算缓存项大小
   */
  private calculateSize(value: unknown): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    let totalSize = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expiredItems++;
      } else {
        validItems++;
        totalSize += item.size;
      }
    }

    this.stats = {
      ...this.stats,
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      totalSize
    };
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate = total > 0 ? this.stats.hitCount / total : 0;
  }

  /**
   * 开始清理定时器
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredCache();
    }, this.config.cleanupInterval);
  }

  /**
   * 停止清理定时器
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * 从存储加载缓存
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
        this.updateStats();
      }
    } catch (error) {
      logger.error('从存储加载缓存失败:', error);
    }
  }

  /**
   * 保存到存储
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      logger.error('保存缓存到存储失败:', error);
    }
  }

  /**
   * 发送事件
   */
  private emitEvent(type: RouteCacheEvent['type'], key: string, data?: unknown): void {
    const event: RouteCacheEvent = {
      type,
      key,
      timestamp: Date.now(),
      data
    };

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('缓存事件监听器执行失败:', error);
      }
    });
  }

  /**
   * 添加事件监听器
   */
  addEventListener(id: string, listener: (event: RouteCacheEvent) => void): void {
    this.eventListeners.set(id, listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(id: string): void {
    this.eventListeners.delete(id);
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.cache.clear();
    this.eventListeners.clear();
  }
}

// ==================== 路由缓存Hook ====================

/**
 * 路由缓存Hook
 */
export const useRouteCache = (config?: Partial<RouteCacheConfig>) => {
  const cacheManager = useMemo(() => new RouteCacheManager(config), [config]);

  /**
   * 设置缓存
   */
  const setCache = useCallback(<T>(key: string, value: T, expireTime?: number) => {
    cacheManager.setCache(key, value, expireTime);
  }, [cacheManager]);

  /**
   * 获取缓存
   */
  const getCache = useCallback(<T>(key: string): T | null => {
    return cacheManager.getCache<T>(key);
  }, [cacheManager]);

  /**
   * 删除缓存
   */
  const deleteCache = useCallback((key: string) => {
    return cacheManager.deleteCache(key);
  }, [cacheManager]);

  /**
   * 清空缓存
   */
  const clearCache = useCallback(() => {
    cacheManager.clearCache();
  }, [cacheManager]);

  /**
   * 检查缓存是否存在
   */
  const hasCache = useCallback((key: string) => {
    return cacheManager.hasCache(key);
  }, [cacheManager]);

  /**
   * 获取缓存统计
   */
  const getCacheStats = useCallback(() => {
    return cacheManager.getCacheStats();
  }, [cacheManager]);

  /**
   * 清理过期缓存
   */
  const cleanupExpiredCache = useCallback(() => {
    cacheManager.cleanupExpiredCache();
  }, [cacheManager]);

  return {
    setCache,
    getCache,
    deleteCache,
    clearCache,
    hasCache,
    getCacheStats,
    cleanupExpiredCache
  };
};

// ==================== 菜单缓存管理器 ====================

/**
 * 菜单缓存管理器
 */
export class MenuCacheManager extends RouteCacheManager {
  constructor(config?: Partial<RouteCacheConfig>) {
    super({
      expireTime: 30 * 60 * 1000, // 30分钟
      maxSize: 100,
      cleanupInterval: 10 * 60 * 1000, // 10分钟
      persistent: true,
      storageKey: 'menu_cache',
      ...config
    });
  }

  /**
   * 缓存菜单数据
   */
  cacheMenuData(userId: number, menus: MenuRouteConfig[]): void {
    const key = `menu_${userId}`;
    this.setCache(key, menus);
  }

  /**
   * 获取菜单数据
   */
  getMenuData(userId: number): MenuRouteConfig[] | null {
    const key = `menu_${userId}`;
    return this.getCache<MenuRouteConfig[]>(key);
  }

  /**
   * 缓存菜单树
   */
  cacheMenuTree(userId: number, menuTree: MenuTreeNode[]): void {
    const key = `menu_tree_${userId}`;
    this.setCache(key, menuTree);
  }

  /**
   * 获取菜单树
   */
  getMenuTree(userId: number): MenuTreeNode[] | null {
    const key = `menu_tree_${userId}`;
    return this.getCache<MenuTreeNode[]>(key);
  }

  /**
   * 清除用户菜单缓存
   */
  clearUserMenuCache(userId: number): void {
    const menuKey = `menu_${userId}`;
    const treeKey = `menu_tree_${userId}`;
    this.deleteCache(menuKey);
    this.deleteCache(treeKey);
  }
}

// ==================== 权限缓存管理器 ====================

/**
 * 权限缓存管理器
 */
export class PermissionCacheManager extends RouteCacheManager {
  constructor(config?: Partial<RouteCacheConfig>) {
    super({
      expireTime: 15 * 60 * 1000, // 15分钟
      maxSize: 500,
      cleanupInterval: 5 * 60 * 1000, // 5分钟
      persistent: false,
      storageKey: 'permission_cache',
      ...config
    });
  }

  /**
   * 缓存用户权限
   */
  cacheUserPermission(userId: number, permission: unknown): void {
    const key = `user_permission_${userId}`;
    this.setCache(key, permission);
  }

  /**
   * 获取用户权限
   */
  getUserPermission(userId: number): unknown | null {
    const key = `user_permission_${userId}`;
    return this.getCache(key);
  }

  /**
   * 缓存角色权限
   */
  cacheRolePermission(roleId: number, permission: unknown): void {
    const key = `role_permission_${roleId}`;
    this.setCache(key, permission);
  }

  /**
   * 获取角色权限
   */
  getRolePermission(roleId: number): unknown | null {
    const key = `role_permission_${roleId}`;
    return this.getCache(key);
  }

  /**
   * 清除用户权限缓存
   */
  clearUserPermissionCache(userId: number): void {
    const key = `user_permission_${userId}`;
    this.deleteCache(key);
  }

  /**
   * 清除角色权限缓存
   */
  clearRolePermissionCache(roleId: number): void {
    const key = `role_permission_${roleId}`;
    this.deleteCache(key);
  }
}

// ==================== 导出实例 ====================

export const routeCacheManager = new RouteCacheManager();
export const menuCacheManager = new MenuCacheManager();
export const permissionCacheManager = new PermissionCacheManager();
