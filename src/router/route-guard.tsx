/**
 * 路由守卫组件
 * 提供路由访问控制、权限验证、路由重定向等功能
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { usePermission } from '@/hooks/usePermission';
import { RoutePermissionValidator } from './dynamic-route';
import type { RoutePermissionResult } from './dynamic-route';
import logger from '@/utils/logger';

// ==================== 路由守卫类型定义 ====================

/**
 * 路由守卫配置
 */
export interface RouteGuardConfig {
  // 是否需要认证
  requireAuth?: boolean;
  // 是否需要权限验证
  requirePermission?: boolean;
  // 权限验证动作
  permissionAction?: string;
  // 权限验证资源
  permissionResource?: string;
  // 重定向路径
  redirectTo?: string;
  // 权限验证失败回调
  onPermissionDenied?: (result: RoutePermissionResult) => void;
  // 权限验证成功回调
  onPermissionGranted?: (result: RoutePermissionResult) => void;
  // 加载状态回调
  onLoading?: (loading: boolean) => void;
  // 错误处理回调
  onError?: (error: Error) => void;
}

/**
 * 路由守卫Props
 */
export interface RouteGuardProps {
  children: React.ReactNode;
  config?: RouteGuardConfig;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  error?: React.ReactNode;
}

/**
 * 路由守卫状态
 */
export interface RouteGuardState {
  // 是否加载中
  isLoading: boolean;
  // 是否有权限
  hasPermission: boolean;
  // 权限验证结果
  permissionResult?: RoutePermissionResult;
  // 错误信息
  error?: string;
  // 是否已验证
  isVerified: boolean;
}

// ==================== 路由守卫组件 ====================

/**
 * 路由守卫组件
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  config = {},
  fallback = null,
  loading = <div>权限验证中...</div>,
  error = <div>权限验证失败</div>
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userInfo, loading: authLoading } = useAuthStore();
  const permissionHook = usePermission();
  const { isLoading: permissionLoading } = permissionHook;
  
  // 创建路由权限验证器实例
  const routePermissionValidator = useMemo(() => new RoutePermissionValidator(permissionHook), [permissionHook]);

  // 默认配置
  const defaultConfig: RouteGuardConfig = useMemo(() => ({
    requireAuth: true,
    requirePermission: true,
    permissionAction: 'read',
    permissionResource: pathname,
    redirectTo: '/signin',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPermissionDenied: (_result) => {
      // 权限验证失败处理
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPermissionGranted: (_result) => {
      // 权限验证成功处理
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onLoading: (_loading) => {
      // 权限验证加载状态处理
    },
    onError: (error) => {
      logger.error('权限验证错误:', error);
    }
  }), [pathname]);

  const finalConfig = useMemo(() => ({ ...defaultConfig, ...config }), [defaultConfig, config]);

  // 状态管理
  const [state, setState] = useState<RouteGuardState>({
    isLoading: true,
    hasPermission: false,
    isVerified: false
  });

  // ==================== 权限验证方法 ====================

  /**
   * 验证路由权限
   */
  const verifyRoutePermission = useCallback(async (): Promise<RoutePermissionResult> => {
    try {
      const result = await routePermissionValidator.validateRoutePermission(
        finalConfig.permissionResource || pathname,
        finalConfig.permissionAction || 'read'
      );
      return result;
    } catch (error) {
      logger.error('路由权限验证失败:', error);
      throw error;
    }
  }, [routePermissionValidator, pathname, finalConfig.permissionResource, finalConfig.permissionAction]);

  /**
   * 检查认证状态
   */
  const checkAuthStatus = useCallback((): boolean => {
    if (!finalConfig.requireAuth) return true;
    
    // SSR 兼容性检查
    if (typeof window === 'undefined') return false;
    
    const hasToken = !!localStorage.getItem('access_token');
    const isLoggedIn = isAuthenticated && hasToken && !!userInfo;
    
    return isLoggedIn;
  }, [isAuthenticated, userInfo, finalConfig.requireAuth]);

  /**
   * 执行权限验证
   */
  const executePermissionCheck = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      if (finalConfig.onLoading) {
        finalConfig.onLoading(true);
      }

      // 检查认证状态
      const isAuthenticated = checkAuthStatus();
      if (!isAuthenticated) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: false,
          isVerified: true,
          error: '用户未认证'
        }));
        
        if (finalConfig.onPermissionDenied) {
          finalConfig.onPermissionDenied({
            hasPermission: false,
            permissionResult: {
              user: false,
              role: false,
              menu: false,
              button: false
            },
            error: '用户未认证',
            timestamp: Date.now()
          });
        }
        return;
      }

      // 检查权限验证
      if (finalConfig.requirePermission) {
        const permissionResult = await verifyRoutePermission();
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: permissionResult.hasPermission,
          permissionResult,
          isVerified: true,
          error: permissionResult.error
        }));

        if (permissionResult.hasPermission) {
          if (finalConfig.onPermissionGranted) {
            finalConfig.onPermissionGranted(permissionResult);
          }
        } else {
          if (finalConfig.onPermissionDenied) {
            finalConfig.onPermissionDenied(permissionResult);
          }
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: true,
          isVerified: true
        }));
      }
    } catch (error) {
      const errorObj = error as Error;
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasPermission: false,
        isVerified: true,
        error: errorObj.message
      }));

      if (finalConfig.onError) {
        finalConfig.onError(errorObj);
      }
    } finally {
      if (finalConfig.onLoading) {
        finalConfig.onLoading(false);
      }
    }
  }, [checkAuthStatus, verifyRoutePermission, finalConfig]);

  // ==================== 路由重定向处理 ====================

  /**
   * 处理路由重定向
   */
  const handleRouteRedirect = useCallback(() => {
    if (!state.hasPermission && state.isVerified) {
      const redirectPath = finalConfig.redirectTo || '/signin';
      const currentPath = pathname;
      
      // 构建重定向URL
      const redirectUrl = currentPath === '/' 
        ? redirectPath 
        : `${redirectPath}?redirect=${encodeURIComponent(currentPath)}`;
      
      router.push(redirectUrl);
    }
  }, [state.hasPermission, state.isVerified, finalConfig.redirectTo, pathname, router]);

  // ==================== 生命周期处理 ====================

  useEffect(() => {
    executePermissionCheck();
  }, [executePermissionCheck]);

  useEffect(() => {
    handleRouteRedirect();
  }, [handleRouteRedirect]);

  // ==================== 渲染逻辑 ====================

  /**
   * 渲染内容
   */
  const renderContent = (): React.ReactNode => {
    // 加载状态
    if (state.isLoading || authLoading || permissionLoading) {
      return loading;
    }

    // 错误状态
    if (state.error) {
      return error;
    }

    // 权限验证结果
    if (state.isVerified && !state.hasPermission) {
      return fallback;
    }

    // 有权限，渲染子组件
    return children;
  };

  return <>{renderContent()}</>;
};

// ==================== 路由守卫Hook ====================

/**
 * 路由守卫Hook
 */
export const useRouteGuard = (config?: RouteGuardConfig) => {
  const [state, setState] = useState<RouteGuardState>({
    isLoading: true,
    hasPermission: false,
    isVerified: false
  });

  const router = useRouter();
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated, userInfo } = useAuthStore();
  const permissionHook = usePermission();
  
  // 创建路由权限验证器实例
  const routePermissionValidator = useMemo(() => new RoutePermissionValidator(permissionHook), [permissionHook]);

  /**
   * 检查路由权限
   */
  const checkRoutePermission = useCallback(async (): Promise<RoutePermissionResult> => {
    const result = await routePermissionValidator.validateRoutePermission(
      config?.permissionResource || pathname,
      config?.permissionAction || 'read'
    );
    return result;
  }, [routePermissionValidator, pathname, config?.permissionResource, config?.permissionAction]);

  /**
   * 验证权限
   */
  const verifyPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // 检查认证状态
      if (config?.requireAuth && !isAuthenticated) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: false,
          isVerified: true,
          error: '用户未认证'
        }));
        return false;
      }

      // 检查权限验证
      if (config?.requirePermission) {
        const result = await checkRoutePermission();
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: result.hasPermission,
          permissionResult: result,
          isVerified: true,
          error: result.error
        }));

        return result.hasPermission;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasPermission: true,
        isVerified: true
      }));

      return true;
    } catch (error) {
      const errorObj = error as Error;
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasPermission: false,
        isVerified: true,
        error: errorObj.message
      }));
      return false;
    }
  }, [isAuthenticated, checkRoutePermission, config]);

  /**
   * 重定向到指定路径
   */
  const redirectTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  return {
    state,
    verifyPermission,
    redirectTo,
    checkRoutePermission
  };
};

// ==================== 路由守卫工具函数 ====================

/**
 * 路由守卫工具函数
 */
export const RouteGuardUtils = {
  /**
   * 创建路由守卫配置
   */
  createConfig: (config: Partial<RouteGuardConfig>): RouteGuardConfig => ({
    requireAuth: true,
    requirePermission: true,
    permissionAction: 'read',
    redirectTo: '/signin',
    ...config
  }),

  /**
   * 检查路由是否需要权限验证
   */
  needsPermission: (pathname: string, whitelist: string[] = []): boolean => {
    return !whitelist.some(path => pathname.startsWith(path));
  },

  /**
   * 获取路由权限配置
   */
  getRoutePermissionConfig: (pathname: string): RouteGuardConfig => {
    // 根据路径返回不同的权限配置
    const configMap: Record<string, RouteGuardConfig> = {
      '/admin': {
        requireAuth: true,
        requirePermission: true,
        permissionAction: 'admin',
        redirectTo: '/signin'
      },
      '/user': {
        requireAuth: true,
        requirePermission: true,
        permissionAction: 'read',
        redirectTo: '/signin'
      },
      '/api': {
        requireAuth: true,
        requirePermission: true,
        permissionAction: 'api',
        redirectTo: '/signin'
      }
    };

    return configMap[pathname] || {
      requireAuth: true,
      requirePermission: true,
      permissionAction: 'read',
      redirectTo: '/signin'
    };
  }
};

// ==================== 导出 ====================

export default RouteGuard;
