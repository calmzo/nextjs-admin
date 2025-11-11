/**
 * 权限边界组件
 * 提供权限验证、权限控制、权限显示等功能
 */

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { usePermission } from '@/hooks/usePermission';
import type {
  UserPermissionCheckRequest,
  RolePermissionCheckRequest,
  MenuPermissionCheckRequest,
  ButtonPermissionCheckRequest
} from '@/types';
import { handleError } from '@/utils/error-handler';

// ==================== 权限边界组件Context ====================

/**
 * 权限边界组件Context
 */
export interface PermissionBoundaryContextValue {
  // 权限验证状态
  hasPermission: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // 权限验证方法
  checkPermission: () => Promise<boolean>;
  refreshPermission: () => Promise<void>;
  
  // 权限验证配置
  permissionType: string;
  permissionId: number;
  action: string;
  context: Record<string, unknown>;
}

/**
 * 权限边界组件Context
 */
export const PermissionBoundaryContext = createContext<PermissionBoundaryContextValue | null>(null);

/**
 * 使用权限边界组件Context
 */
export const usePermissionBoundary = (): PermissionBoundaryContextValue => {
  const context = useContext(PermissionBoundaryContext);
  if (!context) {
    throw new Error('usePermissionBoundary must be used within a PermissionBoundary');
  }
  return context;
};

// ==================== 权限边界组件Props ====================

/**
 * 权限边界组件基础Props
 */
export interface PermissionBoundaryBaseProps {
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
 * 用户权限边界Props
 */
export interface UserPermissionBoundaryProps extends Omit<PermissionBoundaryBaseProps, 'permissionType'> {
  permissionType: 'user';
  userId: number;
}

/**
 * 角色权限边界Props
 */
export interface RolePermissionBoundaryProps extends Omit<PermissionBoundaryBaseProps, 'permissionType'> {
  permissionType: 'role';
  roleId: number;
}

/**
 * 菜单权限边界Props
 */
export interface MenuPermissionBoundaryProps extends Omit<PermissionBoundaryBaseProps, 'permissionType'> {
  permissionType: 'menu';
  menuId: number;
}

/**
 * 按钮权限边界Props
 */
export interface ButtonPermissionBoundaryProps extends Omit<PermissionBoundaryBaseProps, 'permissionType'> {
  permissionType: 'button';
  buttonId: number;
}

/**
 * 权限边界组件Props联合类型
 */
export type PermissionBoundaryProps = 
  | UserPermissionBoundaryProps
  | RolePermissionBoundaryProps
  | MenuPermissionBoundaryProps
  | ButtonPermissionBoundaryProps;

// ==================== 权限边界组件 ====================

/**
 * 权限边界组件
 */
export const PermissionBoundary: React.FC<PermissionBoundaryProps> = ({
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
  const executePermissionCheck = useCallback(async (): Promise<boolean> => {
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

      return result;
    } catch (err) {
      const error = err as Error;
      setIsError(true);
      setErrorMessage(error.message);
      
      if (onPermissionError) {
        onPermissionError(error);
      }
      
      return false;
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

  /**
   * 检查权限
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    return await executePermissionCheck();
  }, [executePermissionCheck]);

  /**
   * 刷新权限
   */
  const refreshPermission = useCallback(async (): Promise<void> => {
    await executePermissionCheck();
  }, [executePermissionCheck]);

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

  // ==================== Context值 ====================

  const contextValue: PermissionBoundaryContextValue = useMemo(() => ({
    hasPermission,
    isLoading: isLoading || permissionLoading,
    isError: isError || permissionError,
    error: permissionErrorObj,
    checkPermission,
    refreshPermission,
    permissionType,
    permissionId,
    action,
    context
  }), [
    hasPermission,
    isLoading,
    permissionLoading,
    isError,
    permissionError,
    permissionErrorObj,
    checkPermission,
    refreshPermission,
    permissionType,
    permissionId,
    action,
    context
  ]);

  // ==================== 组件渲染 ====================

  return (
    <PermissionBoundaryContext.Provider value={contextValue}>
      {renderContent()}
    </PermissionBoundaryContext.Provider>
  );
};

// ==================== 权限边界组件变体 ====================

/**
 * 用户权限边界组件
 */
export const UserPermissionBoundary: React.FC<Omit<UserPermissionBoundaryProps, 'permissionType'>> = (props) => (
  <PermissionBoundary {...props} permissionType="user" />
);

/**
 * 角色权限边界组件
 */
export const RolePermissionBoundary: React.FC<Omit<RolePermissionBoundaryProps, 'permissionType'>> = (props) => (
  <PermissionBoundary {...props} permissionType="role" />
);

/**
 * 菜单权限边界组件
 */
export const MenuPermissionBoundary: React.FC<Omit<MenuPermissionBoundaryProps, 'permissionType'>> = (props) => (
  <PermissionBoundary {...props} permissionType="menu" />
);

/**
 * 按钮权限边界组件
 */
export const ButtonPermissionBoundary: React.FC<Omit<ButtonPermissionBoundaryProps, 'permissionType'>> = (props) => (
  <PermissionBoundary {...props} permissionType="button" />
);

// ==================== 权限边界组件工具函数 ====================

/**
 * 权限边界组件工具函数
 */
export const PermissionBoundaryUtils = {
  /**
   * 创建权限边界组件
   */
  create: (props: PermissionBoundaryProps) => {
    return <PermissionBoundary {...props} />;
  },

  /**
   * 批量创建权限边界组件
   */
  createBatch: (propsList: PermissionBoundaryProps[]) => {
    return propsList.map((props, index) => (
      <PermissionBoundary key={index} {...props} />
    ));
  },

  /**
   * 权限边界组件验证
   */
  validate: (props: PermissionBoundaryProps): boolean => {
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
   * 权限边界组件配置
   */
  getDefaultConfig: (): Partial<PermissionBoundaryProps> => ({
    mode: 'show',
    strategy: 'all',
    fallback: null,
    loading: null,
    error: null
  })
};

// ==================== 权限边界组件常量 ====================

/**
 * 权限边界组件常量
 */
export const PERMISSION_BOUNDARY_CONSTANTS = {
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
