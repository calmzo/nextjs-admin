/**
 * 角色权限模型详细设计
 * 基于Vue项目的角色权限系统，适配Next.js项目
 */

import { 
  Role, 
  Permission, 
  Menu, 
  Button, 
  User,
  PermissionStatus,
  DataScope 
} from './permission';

// ==================== 角色权限核心模型 ====================

/**
 * 角色权限信息（完整版）
 */
export interface RolePermissionInfo {
  // 角色基础信息
  role: Role;
  
  // 角色权限信息
  permissions: RolePermissionDetail[];
  
  // 角色菜单权限
  menus: RoleMenuPermission[];
  
  // 角色按钮权限
  buttons: RoleButtonPermission[];
  
  // 角色数据权限
  dataScope: DataScope;
  customDataScope?: number[];
  
  // 角色用户信息
  users: RoleUserInfo[];
  
  // 角色权限缓存
  permissionCache: RolePermissionCache;
}

/**
 * 角色权限详情
 */
export interface RolePermissionDetail {
  id: number;
  roleId: number;
  permissionId: number;
  permission: Permission;
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
  reason?: string;
}

/**
 * 角色菜单权限
 */
export interface RoleMenuPermission {
  id: number;
  roleId: number;
  menuId: number;
  menu: Menu;
  permissions: Permission[];
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
}

/**
 * 角色按钮权限
 */
export interface RoleButtonPermission {
  id: number;
  roleId: number;
  buttonId: number;
  button: Button;
  permissions: Permission[];
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
}

/**
 * 角色用户信息
 */
export interface RoleUserInfo {
  id: number;
  roleId: number;
  userId: number;
  user: User;
  assignedBy: number;
  assignedTime: string;
  expireTime?: string;
  isActive: boolean;
}

/**
 * 角色权限缓存
 */
export interface RolePermissionCache {
  roleId: number;
  permissions: string[];
  menus: string[];
  buttons: string[];
  dataScope: DataScope;
  customDataScope?: number[];
  lastUpdated: string;
  expireTime: number;
}

// ==================== 角色权限验证模型 ====================

/**
 * 角色权限验证请求
 */
export interface RolePermissionCheckRequest {
  roleId: number;
  resourceType: string;
  resourcePath: string;
  action: string;
  context?: Record<string, unknown>;
}

/**
 * 角色权限验证结果
 */
export interface RolePermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  dataScope?: DataScope;
  customDataScope?: number[];
  expireTime?: string;
}

/**
 * 角色权限验证上下文
 */
export interface RolePermissionContext {
  roleId: number;
  rolePermissions: string[];
  roleMenus: string[];
  roleButtons: string[];
  dataScope: DataScope;
  customDataScope?: number[];
  currentDeptId?: number;
  currentMenuId?: number;
}

// ==================== 角色权限管理模型 ====================

/**
 * 角色权限分配请求
 */
export interface RolePermissionAssignRequest {
  roleId: number;
  permissionIds: number[];
  grantedBy: number;
  expireTime?: string;
  reason?: string;
}

/**
 * 角色菜单权限分配请求
 */
export interface RoleMenuPermissionAssignRequest {
  roleId: number;
  menuIds: number[];
  grantedBy: number;
  expireTime?: string;
  reason?: string;
}

/**
 * 角色按钮权限分配请求
 */
export interface RoleButtonPermissionAssignRequest {
  roleId: number;
  buttonIds: number[];
  grantedBy: number;
  expireTime?: string;
  reason?: string;
}

/**
 * 角色用户分配请求
 */
export interface RoleUserAssignRequest {
  roleId: number;
  userIds: number[];
  assignedBy: number;
  expireTime?: string;
  reason?: string;
}

/**
 * 角色权限查询请求
 */
export interface RolePermissionQueryRequest {
  roleId?: number;
  roleName?: string;
  permissionId?: number;
  resourceType?: string;
  resourcePath?: string;
  action?: string;
  status?: PermissionStatus;
  page?: number;
  pageSize?: number;
}

/**
 * 角色权限查询结果
 */
export interface RolePermissionQueryResult {
  rolePermissions: RolePermissionDetail[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 角色权限统计模型 ====================

/**
 * 角色权限统计信息
 */
export interface RolePermissionStats {
  roleId: number;
  roleName: string;
  totalPermissions: number;
  activePermissions: number;
  expiredPermissions: number;
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  totalMenus: number;
  totalButtons: number;
  dataScope: DataScope;
  customDataScopeCount?: number;
}

/**
 * 角色权限分析报告
 */
export interface RolePermissionAnalysis {
  roleId: number;
  roleName: string;
  permissionDistribution: {
    system: number;
    user: number;
    role: number;
    menu: number;
    dept: number;
    dict: number;
  };
  permissionCategories: {
    read: number;
    create: number;
    update: number;
    delete: number;
    export: number;
    import: number;
  };
  riskAssessment: {
    highRiskPermissions: string[];
    excessivePermissions: string[];
    conflictingPermissions: string[];
  };
  recommendations: string[];
}

// ==================== 角色权限操作模型 ====================

/**
 * 角色权限操作日志
 */
export interface RolePermissionOperationLog {
  id: number;
  roleId: number;
  operatorId: number;
  operationType: RolePermissionOperationType;
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
 * 角色权限操作类型
 */
export enum RolePermissionOperationType {
  GRANT = 'grant',
  REVOKE = 'revoke',
  UPDATE = 'update',
  EXPIRE = 'expire',
  RENEW = 'renew',
  ASSIGN_USER = 'assign_user',
  REMOVE_USER = 'remove_user'
}

/**
 * 角色权限变更请求
 */
export interface RolePermissionChangeRequest {
  roleId: number;
  changes: RolePermissionChange[];
  reason: string;
  operatorId: number;
}

/**
 * 角色权限变更详情
 */
export interface RolePermissionChange {
  type: RolePermissionOperationType;
  targetType: string;
  targetId: number;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
}

// ==================== 角色权限模板模型 ====================

/**
 * 角色权限模板
 */
export interface RolePermissionTemplate {
  id: number;
  templateName: string;
  templateKey: string;
  description?: string;
  permissions: Permission[];
  menus: Menu[];
  buttons: Button[];
  dataScope: DataScope;
  customDataScope?: number[];
  isSystem: boolean;
  createTime: string;
  updateTime: string;
}

/**
 * 角色权限模板应用请求
 */
export interface RolePermissionTemplateApplyRequest {
  roleId: number;
  templateId: number;
  appliedBy: number;
  reason?: string;
}

/**
 * 角色权限模板查询请求
 */
export interface RolePermissionTemplateQueryRequest {
  templateName?: string;
  templateKey?: string;
  isSystem?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * 角色权限模板查询结果
 */
export interface RolePermissionTemplateQueryResult {
  templates: RolePermissionTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 角色权限继承模型 ====================

/**
 * 角色权限继承关系
 */
export interface RolePermissionInheritance {
  id: number;
  parentRoleId: number;
  childRoleId: number;
  inheritanceType: RoleInheritanceType;
  isActive: boolean;
  createTime: string;
  updateTime: string;
}

/**
 * 角色继承类型
 */
export enum RoleInheritanceType {
  FULL = 'full',           // 完全继承
  PARTIAL = 'partial',     // 部分继承
  SELECTIVE = 'selective'  // 选择性继承
}

/**
 * 角色权限继承配置
 */
export interface RolePermissionInheritanceConfig {
  parentRoleId: number;
  childRoleId: number;
  inheritanceType: RoleInheritanceType;
  inheritedPermissions: number[];
  excludedPermissions: number[];
  inheritedMenus: number[];
  excludedMenus: number[];
  inheritedButtons: number[];
  excludedButtons: number[];
  dataScopeInheritance: boolean;
}

// ==================== 角色权限常量 ====================

/**
 * 角色权限常量
 */
export const ROLE_PERMISSION_CONSTANTS = {
  // 角色权限缓存键
  CACHE_KEY_PREFIX: 'role:permission:',
  CACHE_EXPIRE_TIME: 30 * 60 * 1000, // 30分钟
  
  // 角色权限验证
  PERMISSION_CHECK_CACHE_TIME: 5 * 60 * 1000, // 5分钟
  
  // 角色权限统计
  STATS_CACHE_TIME: 60 * 60 * 1000, // 1小时
  
  // 角色权限操作日志
  OPERATION_LOG_RETENTION_DAYS: 90, // 90天
  
  // 角色权限模板
  TEMPLATE_CACHE_TIME: 24 * 60 * 60 * 1000, // 24小时
} as const;

/**
 * 角色权限默认配置
 */
export const ROLE_PERMISSION_DEFAULTS = {
  // 默认数据权限范围
  DEFAULT_DATA_SCOPE: DataScope.DEPT_AND_CHILD,
  
  // 默认权限过期时间（天）
  DEFAULT_PERMISSION_EXPIRE_DAYS: 365,
  
  // 默认用户过期时间（天）
  DEFAULT_USER_EXPIRE_DAYS: 365,
  
  // 权限验证超时时间（秒）
  PERMISSION_CHECK_TIMEOUT: 5,
  
  // 权限缓存大小限制
  PERMISSION_CACHE_SIZE_LIMIT: 1000,
  
  // 角色继承深度限制
  MAX_INHERITANCE_DEPTH: 5,
} as const;

/**
 * 系统预定义角色
 */
export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    roleKey: 'super_admin',
    roleName: '超级管理员',
    description: '系统超级管理员，拥有所有权限',
    permissions: ['*'],
    dataScope: DataScope.ALL
  },
  ADMIN: {
    roleKey: 'admin',
    roleName: '管理员',
    description: '系统管理员，拥有大部分权限',
    permissions: ['system:*', 'user:*', 'role:*', 'menu:*', 'dept:*', 'dict:*'],
    dataScope: DataScope.DEPT_AND_CHILD
  },
  USER: {
    roleKey: 'user',
    roleName: '普通用户',
    description: '普通用户，拥有基础权限',
    permissions: ['user:view', 'menu:view'],
    dataScope: DataScope.SELF_ONLY
  },
  GUEST: {
    roleKey: 'guest',
    roleName: '访客',
    description: '访客用户，拥有最少权限',
    permissions: ['menu:view'],
    dataScope: DataScope.SELF_ONLY
  }
} as const;
