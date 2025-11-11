/**
 * 权限验证组件索引
 * 统一导出所有权限验证相关组件
 */

// ==================== 权限验证Hook ====================
export * from '@/hooks/usePermission';

// ==================== 权限指令组件 ====================
export * from './PermissionDirective';

// ==================== 权限边界组件 ====================
export * from './PermissionBoundary';

// ==================== 权限验证中间件 ====================
export * from '@/middleware/permission.middleware';

// ==================== 权限验证组件工具函数 ====================

import React from 'react';
import { PermissionDirective } from './PermissionDirective';
import { PermissionBoundary } from './PermissionBoundary';
import { PermissionMiddleware } from '@/middleware/permission.middleware';

/**
 * 权限验证组件工具函数
 */
export const PermissionComponentUtils = {
  /**
   * 创建权限验证组件
   */
  createPermissionDirective: (props: Record<string, unknown>) => {
    return React.createElement(PermissionDirective, props as unknown as React.ComponentProps<typeof PermissionDirective>);
  },

  /**
   * 创建权限边界组件
   */
  createPermissionBoundary: (props: Record<string, unknown>) => {
    return React.createElement(PermissionBoundary, props as unknown as React.ComponentProps<typeof PermissionBoundary>);
  },

  /**
   * 创建权限验证中间件
   */
  createPermissionMiddleware: (config?: Record<string, unknown>) => {
    return new PermissionMiddleware(config);
  },

  /**
   * 权限验证组件验证
   */
  validatePermissionComponent: (props: Record<string, unknown>): boolean => {
    if (!props.permissionId || !props.action) {
      return false;
    }

    switch (props.permissionType) {
      case 'user':
        return 'userId' in props && typeof props.userId === 'number' && props.userId > 0;
      case 'role':
        return 'roleId' in props && typeof props.roleId === 'number' && props.roleId > 0;
      case 'menu':
        return 'menuId' in props && typeof props.menuId === 'number' && props.menuId > 0;
      case 'button':
        return 'buttonId' in props && typeof props.buttonId === 'number' && props.buttonId > 0;
      default:
        return false;
    }
  },

  /**
   * 权限验证组件配置
   */
  getDefaultConfig: (): Record<string, unknown> => ({
    mode: 'show',
    strategy: 'all',
    fallback: null,
    loading: null,
    error: null
  })
};

// ==================== 权限验证组件常量 ====================

/**
 * 权限验证组件常量
 */
export const PERMISSION_COMPONENT_CONSTANTS = {
  // 权限验证模式
  MODES: {
    SHOW: 'show',
    HIDE: 'hide',
    DISABLE: 'disable',
    ENABLE: 'enable'
  },
  
  // 权限验证策略
  STRATEGIES: {
    ALL: 'all',
    ANY: 'any',
    NONE: 'none'
  },
  
  // 权限验证类型
  TYPES: {
    USER: 'user',
    ROLE: 'role',
    MENU: 'menu',
    BUTTON: 'button'
  },
  
  // 权限验证状态
  STATUS: {
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
    DENIED: 'denied'
  }
} as const;
