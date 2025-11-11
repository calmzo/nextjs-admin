/**
 * 用户权限模型详细设计
 * 基于Vue项目的用户权限系统，适配Next.js项目
 */

import { 
  User, 
  Role, 
  Permission, 
  Menu, 
  Button, 
  Department,
  PermissionStatus,
  DataScope 
} from './permission';

// ==================== 用户权限核心模型 ====================

/**
 * 用户权限信息（完整版）
 */
export interface UserPermissionInfo {
  // 用户基础信息
  user: User;
  
  // 用户角色信息
  roles: UserRoleInfo[];
  
  // 用户权限信息
  permissions: UserPermissionDetail[];
  
  // 用户菜单权限
  menus: UserMenuPermission[];
  
  // 用户按钮权限
  buttons: UserButtonPermission[];
  
  // 用户部门权限
  deptPermissions: UserDeptPermission[];
  
  // 用户数据权限
  dataScope: DataScope;
  customDataScope?: number[];
  
  // 权限缓存信息
  permissionCache: UserPermissionCache;
}

/**
 * 用户角色信息
 */
export interface UserRoleInfo {
  id: number;
  userId: number;
  roleId: number;
  role: Role;
  assignedBy: number;
  assignedTime: string;
  expireTime?: string;
  isActive: boolean;
}

/**
 * 用户权限详情
 */
export interface UserPermissionDetail {
  id: number;
  userId: number;
  permissionId: number;
  permission: Permission;
  source: PermissionSource;
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
}

/**
 * 权限来源枚举
 */
export enum PermissionSource {
  DIRECT = 'direct',           // 直接分配
  ROLE = 'role',              // 通过角色获得
  DEPT = 'dept',              // 通过部门获得
  INHERIT = 'inherit'         // 继承获得
}

/**
 * 用户菜单权限
 */
export interface UserMenuPermission {
  id: number;
  userId: number;
  menuId: number;
  menu: Menu;
  permissions: Permission[];
  source: PermissionSource;
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
}

/**
 * 用户按钮权限
 */
export interface UserButtonPermission {
  id: number;
  userId: number;
  buttonId: number;
  button: Button;
  permissions: Permission[];
  source: PermissionSource;
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
}

/**
 * 用户部门权限
 */
export interface UserDeptPermission {
  id: number;
  userId: number;
  deptId: number;
  dept: Department;
  dataScope: DataScope;
  customDataScope?: number[];
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
}

/**
 * 用户权限缓存
 */
export interface UserPermissionCache {
  userId: number;
  permissions: string[];
  roles: string[];
  menus: string[];
  buttons: string[];
  dataScope: DataScope;
  customDataScope?: number[];
  lastUpdated: string;
  expireTime: number;
}

// ==================== 用户权限验证模型 ====================

/**
 * 用户权限验证请求
 */
export interface UserPermissionCheckRequest {
  userId: number;
  resourceType: string;
  resourcePath: string;
  action: string;
  context?: Record<string, unknown>;
}

/**
 * 用户权限验证结果
 */
export interface UserPermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  source?: PermissionSource;
  dataScope?: DataScope;
  customDataScope?: number[];
  expireTime?: string;
}

/**
 * 用户权限验证上下文
 */
export interface UserPermissionContext {
  userId: number;
  userRoles: string[];
  userPermissions: string[];
  userMenus: string[];
  userButtons: string[];
  dataScope: DataScope;
  customDataScope?: number[];
  currentDeptId?: number;
  currentMenuId?: number;
}

// ==================== 用户权限管理模型 ====================

/**
 * 用户权限分配请求
 */
export interface UserPermissionAssignRequest {
  userId: number;
  permissionIds: number[];
  source: PermissionSource;
  grantedBy: number;
  expireTime?: string;
  reason?: string;
}

/**
 * 用户角色分配请求
 */
export interface UserRoleAssignRequest {
  userId: number;
  roleIds: number[];
  assignedBy: number;
  expireTime?: string;
  reason?: string;
}

/**
 * 用户权限查询请求
 */
export interface UserPermissionQueryRequest {
  userId?: number;
  username?: string;
  roleId?: number;
  permissionId?: number;
  resourceType?: string;
  resourcePath?: string;
  action?: string;
  source?: PermissionSource;
  status?: PermissionStatus;
  page?: number;
  pageSize?: number;
}

/**
 * 用户权限查询结果
 */
export interface UserPermissionQueryResult {
  userPermissions: UserPermissionDetail[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 用户权限统计模型 ====================

/**
 * 用户权限统计信息
 */
export interface UserPermissionStats {
  userId: number;
  username: string;
  totalPermissions: number;
  directPermissions: number;
  rolePermissions: number;
  deptPermissions: number;
  inheritPermissions: number;
  activePermissions: number;
  expiredPermissions: number;
  totalRoles: number;
  activeRoles: number;
  expiredRoles: number;
  dataScope: DataScope;
  customDataScopeCount?: number;
}

/**
 * 用户权限分析报告
 */
export interface UserPermissionAnalysis {
  userId: number;
  username: string;
  permissionDistribution: {
    direct: number;
    role: number;
    dept: number;
    inherit: number;
  };
  permissionCategories: {
    system: number;
    user: number;
    role: number;
    menu: number;
    dept: number;
    dict: number;
  };
  riskAssessment: {
    highRiskPermissions: string[];
    expiredPermissions: string[];
    excessivePermissions: string[];
  };
  recommendations: string[];
}

// ==================== 用户权限操作模型 ====================

/**
 * 用户权限操作日志
 */
export interface UserPermissionOperationLog {
  id: number;
  userId: number;
  operatorId: number;
  operationType: PermissionOperationType;
  targetType: string;
  targetId: number;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createTime: string;
}

/**
 * 权限操作类型
 */
export enum PermissionOperationType {
  GRANT = 'grant',
  REVOKE = 'revoke',
  UPDATE = 'update',
  EXPIRE = 'expire',
  RENEW = 'renew'
}

/**
 * 用户权限变更请求
 */
export interface UserPermissionChangeRequest {
  userId: number;
  changes: PermissionChange[];
  reason: string;
  operatorId: number;
}

/**
 * 权限变更详情
 */
export interface PermissionChange {
  type: PermissionOperationType;
  targetType: string;
  targetId: number;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
}

// ==================== 用户权限常量 ====================

/**
 * 用户权限常量
 */
export const USER_PERMISSION_CONSTANTS = {
  // 用户权限缓存键
  CACHE_KEY_PREFIX: 'user:permission:',
  CACHE_EXPIRE_TIME: 30 * 60 * 1000, // 30分钟
  
  // 用户权限验证
  PERMISSION_CHECK_CACHE_TIME: 5 * 60 * 1000, // 5分钟
  
  // 用户权限统计
  STATS_CACHE_TIME: 60 * 60 * 1000, // 1小时
  
  // 用户权限操作日志
  OPERATION_LOG_RETENTION_DAYS: 90, // 90天
} as const;

/**
 * 用户权限默认配置
 */
export const USER_PERMISSION_DEFAULTS = {
  // 默认数据权限范围
  DEFAULT_DATA_SCOPE: DataScope.DEPT_AND_CHILD,
  
  // 默认权限过期时间（天）
  DEFAULT_PERMISSION_EXPIRE_DAYS: 365,
  
  // 默认角色过期时间（天）
  DEFAULT_ROLE_EXPIRE_DAYS: 365,
  
  // 权限验证超时时间（秒）
  PERMISSION_CHECK_TIMEOUT: 5,
  
  // 权限缓存大小限制
  PERMISSION_CACHE_SIZE_LIMIT: 1000,
} as const;
