/**
 * 权限系统类型定义索引
 * 统一导出所有权限相关类型
 */

// ==================== 基础权限类型 ====================
export * from './permission';

// ==================== 用户权限类型 ====================
export * from './user-permission';

// ==================== 角色权限类型 ====================
export * from './role-permission';

// ==================== 菜单权限类型 ====================
export * from './menu-permission';

// ==================== 按钮权限类型 ====================
export * from './button-permission';

// ==================== 权限验证类型 ====================
export interface PermissionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PermissionValidationContext {
  userId: number;
  resourceType: string;
  resourcePath: string;
  action: string;
  context?: Record<string, unknown>;
}

// ==================== 权限缓存类型 ====================
export interface PermissionCacheConfig {
  enabled: boolean;
  expireTime: number;
  maxSize: number;
  cleanupInterval: number;
}

export interface PermissionCacheStats {
  hitCount: number;
  missCount: number;
  evictionCount: number;
  size: number;
  maxSize: number;
}

// ==================== 权限配置类型 ====================
export interface PermissionConfig {
  // 权限验证配置
  validation: {
    enabled: boolean;
    timeout: number;
    retryCount: number;
    cacheEnabled: boolean;
  };
  
  // 权限缓存配置
  cache: PermissionCacheConfig;
  
  // 权限日志配置
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
  };
  
  // 权限安全配置
  security: {
    maxPermissionDepth: number;
    maxInheritanceDepth: number;
    permissionExpireWarningDays: number;
  };
}

// ==================== 权限常量 ====================
export const PERMISSION_SYSTEM_CONSTANTS = {
  // 系统版本
  VERSION: '1.0.0',
  
  // 权限验证
  VALIDATION_TIMEOUT: 5000, // 5秒
  VALIDATION_RETRY_COUNT: 3,
  
  // 权限缓存
  CACHE_DEFAULT_EXPIRE: 30 * 60 * 1000, // 30分钟
  CACHE_MAX_SIZE: 1000,
  CACHE_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5分钟
  
  // 权限日志
  LOG_RETENTION_DAYS: 90,
  
  // 权限安全
  MAX_PERMISSION_DEPTH: 10,
  MAX_INHERITANCE_DEPTH: 5,
  PERMISSION_EXPIRE_WARNING_DAYS: 7,
} as const;

// ==================== 权限工具类型 ====================
export interface PermissionUtils {
  // 权限验证工具
  validatePermission: (permission: string) => boolean;
  validatePermissionKey: (key: string) => boolean;
  validateResourcePath: (path: string) => boolean;
  
  // 权限格式化工具
  formatPermissionKey: (resource: string, action: string) => string;
  parsePermissionKey: (key: string) => { resource: string; action: string };
  
  // 权限比较工具
  comparePermissions: (perm1: string, perm2: string) => number;
  isPermissionSubset: (subset: string[], superset: string[]) => boolean;
  
  // 权限转换工具
  convertToPermissionArray: (permissions: unknown) => string[];
  convertFromPermissionArray: (permissions: string[]) => unknown;
}

// ==================== 权限事件类型 ====================
export interface PermissionEvent {
  type: string;
  timestamp: number;
  userId: number;
  resourceType: string;
  resourcePath: string;
  action: string;
  result: boolean;
  context?: Record<string, unknown>;
}

export interface PermissionEventListener {
  (event: PermissionEvent): void;
}

export interface PermissionEventEmitter {
  on: (event: string, listener: PermissionEventListener) => void;
  off: (event: string, listener: PermissionEventListener) => void;
  emit: (event: string, data: PermissionEvent) => void;
}

// ==================== 权限中间件类型 ====================
export interface PermissionMiddleware {
  name: string;
  priority: number;
  execute: (context: PermissionValidationContext) => Promise<PermissionValidationResult>;
}

export interface PermissionMiddlewareChain {
  add: (middleware: PermissionMiddleware) => void;
  remove: (name: string) => void;
  execute: (context: PermissionValidationContext) => Promise<PermissionValidationResult>;
}

// ==================== 权限插件类型 ====================
export interface PermissionPlugin {
  name: string;
  version: string;
  install: (config: PermissionConfig) => void;
  uninstall: () => void;
  isInstalled: () => boolean;
}

export interface PermissionPluginManager {
  install: (plugin: PermissionPlugin) => void;
  uninstall: (name: string) => void;
  getPlugin: (name: string) => PermissionPlugin | undefined;
  listPlugins: () => PermissionPlugin[];
}
