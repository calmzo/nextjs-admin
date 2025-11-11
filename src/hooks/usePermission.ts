/**
 * 权限验证Hook
 * 提供权限验证、权限检查、权限管理等功能
 */

import { useState, useEffect, useCallback } from 'react';
import { PermissionAPI } from '@/api/permission.api';
import logger from '@/utils/logger';
import type {
  UserPermissionCheckRequest,
  UserPermissionCheckResult,
  RolePermissionCheckRequest,
  RolePermissionCheckResult,
  MenuPermissionCheckRequest,
  MenuPermissionCheckResult,
  ButtonPermissionCheckRequest,
  ButtonPermissionCheckResult,
  PermissionValidationContext,
  PermissionValidationResult
} from '@/types';

// ==================== 权限验证Hook ====================

/**
 * 权限验证Hook配置
 */
export interface UsePermissionConfig {
  // 是否启用权限缓存
  enableCache?: boolean;
  // 权限缓存过期时间（毫秒）
  cacheExpireTime?: number;
  // 是否启用权限预加载
  enablePreload?: boolean;
  // 权限验证超时时间（毫秒）
  timeout?: number;
  // 是否启用权限日志
  enableLogging?: boolean;
}

/**
 * 权限验证Hook返回值
 */
export interface UsePermissionReturn {
  // 权限验证状态
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // 权限验证方法
  checkUserPermission: (request: UserPermissionCheckRequest) => Promise<UserPermissionCheckResult>;
  checkRolePermission: (request: RolePermissionCheckRequest) => Promise<RolePermissionCheckResult>;
  checkMenuPermission: (request: MenuPermissionCheckRequest) => Promise<MenuPermissionCheckResult>;
  checkButtonPermission: (request: ButtonPermissionCheckRequest) => Promise<ButtonPermissionCheckResult>;
  batchCheckPermissions: (contexts: PermissionValidationContext[]) => Promise<PermissionValidationResult[]>;
  
  // 权限缓存管理
  clearCache: () => void;
  clearUserCache: (userId: number) => void;
  clearRoleCache: (roleId: number) => void;
  
  // 权限同步
  syncUserPermissions: (userId: number) => Promise<void>;
  syncRolePermissions: (roleId: number) => Promise<void>;
  syncAllPermissions: () => Promise<void>;
  
  // 权限统计
  getPermissionStats: () => Promise<Record<string, unknown>>;
  getUserPermissionStats: (userId: number) => Promise<Record<string, unknown>>;
  getRolePermissionStats: (roleId: number) => Promise<Record<string, unknown>>;
}

/**
 * 权限验证Hook
 */
export function usePermission(config: UsePermissionConfig = {}): UsePermissionReturn {
  const {
    enableCache = true,
    cacheExpireTime = 30 * 60 * 1000, // 30分钟
    enablePreload = false,
    enableLogging = false
  } = config;

  // ==================== 状态管理 ====================
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 权限缓存
  const [permissionCache, setPermissionCache] = useState<Map<string, unknown>>(new Map());
  const [cacheTimestamps, setCacheTimestamps] = useState<Map<string, number>>(new Map());

  // ==================== 权限缓存管理 ====================
  
  /**
   * 生成缓存键
   */
  const generateCacheKey = useCallback((type: string, params: unknown): string => {
    return `${type}:${JSON.stringify(params)}`;
  }, []);

  /**
   * 检查缓存是否有效
   */
  const isCacheValid = useCallback((key: string): boolean => {
    if (!enableCache) return false;
    
    const timestamp = cacheTimestamps.get(key);
    if (!timestamp) return false;
    
    return Date.now() - timestamp < cacheExpireTime;
  }, [enableCache, cacheExpireTime, cacheTimestamps]);

  /**
   * 设置缓存
   */
  const setCache = useCallback((key: string, value: unknown): void => {
    if (!enableCache) return;
    
    setPermissionCache(prev => new Map(prev).set(key, value));
    setCacheTimestamps(prev => new Map(prev).set(key, Date.now()));
  }, [enableCache]);

  /**
   * 获取缓存
   */
  const getCache = useCallback((key: string): unknown => {
    if (!enableCache) return null;
    
    if (isCacheValid(key)) {
      return permissionCache.get(key);
    }
    
    return null;
  }, [enableCache, isCacheValid, permissionCache]);

  /**
   * 清除缓存
   */
  const clearCache = useCallback((): void => {
    setPermissionCache(new Map());
    setCacheTimestamps(new Map());
  }, []);

  /**
   * 清除用户缓存
   */
  const clearUserCache = useCallback((userId: number): void => {
    const keysToDelete = Array.from(permissionCache.keys()).filter(key => 
      key.includes(`user:${userId}`)
    );
    
    setPermissionCache(prev => {
      const newCache = new Map(prev);
      keysToDelete.forEach(key => newCache.delete(key));
      return newCache;
    });
    
    setCacheTimestamps(prev => {
      const newTimestamps = new Map(prev);
      keysToDelete.forEach(key => newTimestamps.delete(key));
      return newTimestamps;
    });
  }, [permissionCache]);

  /**
   * 清除角色缓存
   */
  const clearRoleCache = useCallback((roleId: number): void => {
    const keysToDelete = Array.from(permissionCache.keys()).filter(key => 
      key.includes(`role:${roleId}`)
    );
    
    setPermissionCache(prev => {
      const newCache = new Map(prev);
      keysToDelete.forEach(key => newCache.delete(key));
      return newCache;
    });
    
    setCacheTimestamps(prev => {
      const newTimestamps = new Map(prev);
      keysToDelete.forEach(key => newTimestamps.delete(key));
      return newTimestamps;
    });
  }, [permissionCache]);

  // ==================== 权限验证方法 ====================

  /**
   * 验证用户权限
   */
  const checkUserPermission = useCallback(async (request: UserPermissionCheckRequest): Promise<UserPermissionCheckResult> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const cacheKey = generateCacheKey('user', request);
      const cachedResult = getCache(cacheKey);
      
      if (cachedResult) {
        return cachedResult as UserPermissionCheckResult;
      }

      const result = await PermissionAPI.checkUserPermission(request);
      setCache(cacheKey, result);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('用户权限验证失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateCacheKey, getCache, setCache, enableLogging]);

  /**
   * 验证角色权限
   */
  const checkRolePermission = useCallback(async (request: RolePermissionCheckRequest): Promise<RolePermissionCheckResult> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const cacheKey = generateCacheKey('role', request);
      const cachedResult = getCache(cacheKey);
      
      if (cachedResult) {
        return cachedResult as RolePermissionCheckResult;
      }

      const result = await PermissionAPI.checkRolePermission(request);
      setCache(cacheKey, result);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('角色权限验证失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateCacheKey, getCache, setCache, enableLogging]);

  /**
   * 验证菜单权限
   */
  const checkMenuPermission = useCallback(async (request: MenuPermissionCheckRequest): Promise<MenuPermissionCheckResult> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const cacheKey = generateCacheKey('menu', request);
      const cachedResult = getCache(cacheKey);
      
      if (cachedResult) {
        return cachedResult as MenuPermissionCheckResult;
      }

      const result = await PermissionAPI.checkMenuPermission(request);
      setCache(cacheKey, result);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('菜单权限验证失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateCacheKey, getCache, setCache, enableLogging]);

  /**
   * 验证按钮权限
   */
  const checkButtonPermission = useCallback(async (request: ButtonPermissionCheckRequest): Promise<ButtonPermissionCheckResult> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const cacheKey = generateCacheKey('button', request);
      const cachedResult = getCache(cacheKey);
      
      if (cachedResult) {
        return cachedResult as ButtonPermissionCheckResult;
      }

      const result = await PermissionAPI.checkButtonPermission(request);
      setCache(cacheKey, result);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('按钮权限验证失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateCacheKey, getCache, setCache, enableLogging]);

  /**
   * 批量验证权限
   */
  const batchCheckPermissions = useCallback(async (contexts: PermissionValidationContext[]): Promise<PermissionValidationResult[]> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const cacheKey = generateCacheKey('batch', contexts);
      const cachedResult = getCache(cacheKey);
      
      if (cachedResult) {
        return cachedResult as PermissionValidationResult[];
      }

      const result = await PermissionAPI.batchCheckPermissions(contexts);
      setCache(cacheKey, result);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('批量权限验证失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateCacheKey, getCache, setCache, enableLogging]);

  // ==================== 权限同步方法 ====================

  /**
   * 同步用户权限
   */
  const syncUserPermissions = useCallback(async (userId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      await PermissionAPI.syncUserPermissions(userId);
      clearUserCache(userId);
      
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('用户权限同步失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserCache, enableLogging]);

  /**
   * 同步角色权限
   */
  const syncRolePermissions = useCallback(async (roleId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      await PermissionAPI.syncRolePermissions(roleId);
      clearRoleCache(roleId);
      
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('角色权限同步失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearRoleCache, enableLogging]);

  /**
   * 同步所有权限
   */
  const syncAllPermissions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      await PermissionAPI.syncAllPermissions();
      clearCache();
      
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('所有权限同步失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearCache, enableLogging]);

  // ==================== 权限统计方法 ====================

  /**
   * 获取权限统计
   */
  const getPermissionStats = useCallback(async (): Promise<Record<string, unknown>> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const result = await PermissionAPI.getPermissionCacheStats();
      
      return result;
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('获取权限统计失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [enableLogging]);

  /**
   * 获取用户权限统计
   */
  const getUserPermissionStats = useCallback(async (userId: number): Promise<Record<string, unknown>> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const result = await PermissionAPI.getUserPermissionStats(userId);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('获取用户权限统计失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [enableLogging]);

  /**
   * 获取角色权限统计
   */
  const getRolePermissionStats = useCallback(async (roleId: number): Promise<Record<string, unknown>> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const result = await PermissionAPI.getRolePermissionStats(roleId);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setError(error);
      
      if (enableLogging) {
        logger.error('获取角色权限统计失败:', error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [enableLogging]);

  // ==================== 权限预加载 ====================

  useEffect(() => {
    if (enablePreload) {
      // 预加载常用权限
      const preloadPermissions = async () => {
        try {
          // 这里可以预加载一些常用权限
        } catch (err) {
          if (enableLogging) {
            logger.error('权限预加载失败:', err);
          }
        }
      };

      preloadPermissions();
    }
  }, [enablePreload, enableLogging]);

  // ==================== 返回Hook接口 ====================

  return {
    // 权限验证状态
    isLoading,
    isError,
    error,
    
    // 权限验证方法
    checkUserPermission,
    checkRolePermission,
    checkMenuPermission,
    checkButtonPermission,
    batchCheckPermissions,
    
    // 权限缓存管理
    clearCache,
    clearUserCache,
    clearRoleCache,
    
    // 权限同步
    syncUserPermissions,
    syncRolePermissions,
    syncAllPermissions,
    
    // 权限统计
    getPermissionStats,
    getUserPermissionStats,
    getRolePermissionStats
  };
}
