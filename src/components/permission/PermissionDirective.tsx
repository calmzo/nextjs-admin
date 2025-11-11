/**
 * 权限指令组件
 * 提供权限验证、权限控制、权限显示等功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePermission } from '@/hooks/usePermission';
import type {
  UserPermissionCheckRequest,
  RolePermissionCheckRequest,
  MenuPermissionCheckRequest,
  ButtonPermissionCheckRequest
} from '@/types';
import { handleError } from '@/utils/error-handler';

// ==================== 权限指令组件Props ====================

/**
 * 权限指令组件基础Props
 */
export interface PermissionDirectiveBaseProps {
  // 权限验证类型
  permissionType: 'user' | 'role' | 'menu' | 'button';
  
  // 权限验证参数
  permissionId: number;
  action: string;
  
  // 权限验证配置
  context?: Record<string, unknown>;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  
  // 权限验证模式
  mode?: 'show' | 'hide' | 'disable' | 'enable';
  
  // 权限验证策略
  strategy?: 'all' | 'any' | 'none';
  
  // 权限验证回调
  onPermissionChange?: (hasPermission: boolean) => void;
  onPermissionError?: (error: Error) => void;
  
  // 子组件
  children: React.ReactNode;
}

/**
 * 用户权限指令Props
 */
export interface UserPermissionDirectiveProps extends Omit<PermissionDirectiveBaseProps, 'permissionType'> {
  permissionType: 'user';
  userId: number;
}

/**
 * 角色权限指令Props
 */
export interface RolePermissionDirectiveProps extends Omit<PermissionDirectiveBaseProps, 'permissionType'> {
  permissionType: 'role';
  roleId: number;
}

/**
 * 菜单权限指令Props
 */
export interface MenuPermissionDirectiveProps extends Omit<PermissionDirectiveBaseProps, 'permissionType'> {
  permissionType: 'menu';
  menuId: number;
}

/**
 * 按钮权限指令Props
 */
export interface ButtonPermissionDirectiveProps extends Omit<PermissionDirectiveBaseProps, 'permissionType'> {
  permissionType: 'button';
  buttonId: number;
}

/**
 * 权限指令组件Props联合类型
 */
export type PermissionDirectiveProps = 
  | UserPermissionDirectiveProps
  | RolePermissionDirectiveProps
  | MenuPermissionDirectiveProps
  | ButtonPermissionDirectiveProps;

// ==================== 权限指令组件 ====================

/**
 * 权限指令组件
 */
export const PermissionDirective: React.FC<PermissionDirectiveProps> = ({
  permissionType,
  permissionId,
  action,
  context = {},
  fallback = null,
  loading = null,
  error = null,
  mode = 'show',
  onPermissionChange,
  onPermissionError,
  children
}) => {
  // ==================== 状态管理 ====================
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ==================== 权限验证Hook ====================
  const {
    checkUserPermission,
    checkRolePermission,
    checkMenuPermission,
    checkButtonPermission,
    isLoading: permissionLoading,
    isError: permissionError,
    error: permissionErrorObj
  } = usePermission({
    enableCache: true,
    enableLogging: true
  });

  // ==================== 权限验证方法 ====================

  /**
   * 验证用户权限
   */
  const verifyUserPermission = useCallback(async (): Promise<boolean> => {
    try {
      const request: UserPermissionCheckRequest = {
        userId: permissionId,
        resourceType: (context?.resourceType as string) || 'default',
        resourcePath: (context?.resourcePath as string) || '',
        action,
        context
      };
      
      const result = await checkUserPermission(request);
      return result.hasPermission;
    } catch (err) {
      // 权限验证失败，只记录日志，不显示 toast
      handleError(err, { showToast: false });
      return false;
    }
  }, [permissionId, action, context, checkUserPermission]);

  /**
   * 验证角色权限
   */
  const verifyRolePermission = useCallback(async (): Promise<boolean> => {
    try {
      const request: RolePermissionCheckRequest = {
        roleId: permissionId,
        resourceType: (context?.resourceType as string) || 'default',
        resourcePath: (context?.resourcePath as string) || '',
        action,
        context
      };
      
      const result = await checkRolePermission(request);
      return result.hasPermission;
    } catch (err) {
      // 权限验证失败，只记录日志，不显示 toast
      handleError(err, { showToast: false });
      return false;
    }
  }, [permissionId, action, context, checkRolePermission]);

  /**
   * 验证菜单权限
   */
  const verifyMenuPermission = useCallback(async (): Promise<boolean> => {
    try {
      const userId = (context?.userId as number) || permissionId;
      const request: MenuPermissionCheckRequest = {
        menuId: permissionId,
        userId,
        action,
        context
      };
      
      const result = await checkMenuPermission(request);
      return result.hasPermission;
    } catch (err) {
      // 权限验证失败，只记录日志，不显示 toast
      handleError(err, { showToast: false });
      return false;
    }
  }, [permissionId, action, context, checkMenuPermission]);

  /**
   * 验证按钮权限
   */
  const verifyButtonPermission = useCallback(async (): Promise<boolean> => {
    try {
      const userId = (context?.userId as number) || permissionId;
      const request: ButtonPermissionCheckRequest = {
        buttonId: permissionId,
        userId,
        action,
        context
      };
      
      const result = await checkButtonPermission(request);
      return result.hasPermission;
    } catch (err) {
      // 权限验证失败，只记录日志，不显示 toast
      handleError(err, { showToast: false });
      return false;
    }
  }, [permissionId, action, context, checkButtonPermission]);

  /**
   * 执行权限验证
   */
  const executePermissionCheck = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage('');

      let result = false;

      switch (permissionType) {
        case 'user':
          result = await verifyUserPermission();
          break;
        case 'role':
          result = await verifyRolePermission();
          break;
        case 'menu':
          result = await verifyMenuPermission();
          break;
        case 'button':
          result = await verifyButtonPermission();
          break;
        default:
          throw new Error(`不支持的权限类型: ${permissionType}`);
      }

      setHasPermission(result);
      
      if (onPermissionChange) {
        onPermissionChange(result);
      }
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setErrorMessage(error.message);
      
      if (onPermissionError) {
        onPermissionError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    permissionType,
    verifyUserPermission,
    verifyRolePermission,
    verifyMenuPermission,
    verifyButtonPermission,
    onPermissionChange,
    onPermissionError
  ]);

  // ==================== 权限验证执行 ====================

  useEffect(() => {
    executePermissionCheck();
  }, [executePermissionCheck]);

  // ==================== 权限验证结果处理 ====================

  /**
   * 根据权限验证结果渲染内容
   */
  const renderContent = useCallback((): React.ReactNode => {
    // 加载状态
    if (isLoading || permissionLoading) {
      return loading || <div>权限验证中...</div>;
    }

    // 错误状态
    if (isError || permissionError) {
      return error || <div>权限验证失败: {errorMessage || permissionErrorObj?.message}</div>;
    }

    // 权限验证结果
    const shouldShow = hasPermission;
    
    // 根据模式处理权限结果
    switch (mode) {
      case 'show':
        return shouldShow ? children : fallback;
      case 'hide':
        return shouldShow ? fallback : children;
      case 'disable':
        if (React.isValidElement(children)) {
          return React.cloneElement(children as React.ReactElement<{ disabled?: boolean }>, {
            disabled: !shouldShow
          });
        }
        return children;
      case 'enable':
        if (React.isValidElement(children)) {
          return React.cloneElement(children as React.ReactElement<{ disabled?: boolean }>, {
            disabled: shouldShow
          });
        }
        return children;
      default:
        return shouldShow ? children : fallback;
    }
  }, [
    isLoading,
    permissionLoading,
    isError,
    permissionError,
    errorMessage,
    permissionErrorObj,
    hasPermission,
    mode,
    children,
    fallback,
    loading,
    error
  ]);

  // ==================== 组件渲染 ====================

  return <>{renderContent()}</>;
};

// ==================== 权限指令组件变体 ====================

/**
 * 用户权限指令组件
 */
export const UserPermissionDirective: React.FC<Omit<UserPermissionDirectiveProps, 'permissionType'>> = (props) => (
  <PermissionDirective {...props} permissionType="user" />
);

/**
 * 角色权限指令组件
 */
export const RolePermissionDirective: React.FC<Omit<RolePermissionDirectiveProps, 'permissionType'>> = (props) => (
  <PermissionDirective {...props} permissionType="role" />
);

/**
 * 菜单权限指令组件
 */
export const MenuPermissionDirective: React.FC<Omit<MenuPermissionDirectiveProps, 'permissionType'>> = (props) => (
  <PermissionDirective {...props} permissionType="menu" />
);

/**
 * 按钮权限指令组件
 */
export const ButtonPermissionDirective: React.FC<Omit<ButtonPermissionDirectiveProps, 'permissionType'>> = (props) => (
  <PermissionDirective {...props} permissionType="button" />
);

// ==================== 权限指令组件工具函数 ====================

/**
 * 权限指令组件工具函数
 */
export const PermissionDirectiveUtils = {
  /**
   * 创建权限指令组件
   */
  create: (props: PermissionDirectiveProps) => {
    return <PermissionDirective {...props} />;
  },

  /**
   * 批量创建权限指令组件
   */
  createBatch: (propsList: PermissionDirectiveProps[]) => {
    return propsList.map((props, index) => (
      <PermissionDirective key={index} {...props} />
    ));
  },

  /**
   * 权限指令组件验证
   */
  validate: (props: PermissionDirectiveProps): boolean => {
    if (!props.permissionId || !props.action) {
      return false;
    }

    switch (props.permissionType) {
      case 'user':
        return 'userId' in props && props.userId > 0;
      case 'role':
        return 'roleId' in props && props.roleId > 0;
      case 'menu':
        return 'menuId' in props && props.menuId > 0;
      case 'button':
        return 'buttonId' in props && props.buttonId > 0;
      default:
        return false;
    }
  },

  /**
   * 权限指令组件配置
   */
  getDefaultConfig: (): Partial<PermissionDirectiveProps> => ({
    mode: 'show',
    strategy: 'all',
    fallback: null,
    loading: null,
    error: null
  })
};

// ==================== 权限指令组件常量 ====================

/**
 * 权限指令组件常量
 */
export const PERMISSION_DIRECTIVE_CONSTANTS = {
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
  }
} as const;
