/**
 * 权限系统类型定义
 * 基于Vue项目的权限系统设计，适配Next.js项目
 */

// ==================== 基础权限类型 ====================

/**
 * 权限状态枚举
 */
export enum PermissionStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  DELETED = 'deleted'
}

/**
 * 资源类型枚举
 */
export enum ResourceType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api',
  DATA = 'data'
}

/**
 * 权限动作枚举
 */
export enum PermissionAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject'
}

/**
 * 菜单类型枚举
 */
export enum MenuType {
  DIRECTORY = 'directory',
  MENU = 'menu',
  BUTTON = 'button'
}

/**
 * 按钮类型枚举
 */
export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info'
}

// ==================== 用户权限模型 ====================

/**
 * 用户基础信息
 */
export interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar?: string;
  status: PermissionStatus;
  deptId: number;
  createTime: string;
  updateTime: string;
}

/**
 * 用户权限信息
 */
export interface UserPermission {
  id: number;
  userId: number;
  permissionId: number;
  permission: Permission;
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
}

/**
 * 用户角色关联
 */
export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  role: Role;
  assignedBy: number;
  assignedTime: string;
  expireTime?: string;
}

// ==================== 角色权限模型 ====================

/**
 * 角色信息
 */
export interface Role {
  id: number;
  roleName: string;
  roleKey: string;
  description?: string;
  status: PermissionStatus;
  sortOrder: number;
  createTime: string;
  updateTime: string;
}

/**
 * 角色权限关联
 */
export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  permission: Permission;
  grantedBy: number;
  grantedTime: string;
}

/**
 * 角色完整信息
 */
export interface RoleInfo {
  role: Role;
  permissions: Permission[];
  users: User[];
  menuPermissions: MenuPermission[];
  buttonPermissions: ButtonPermission[];
}

// ==================== 菜单权限模型 ====================

/**
 * 菜单信息
 */
export interface Menu {
  id: number;
  menuName: string;
  menuKey: string;
  path: string;
  component?: string;
  icon?: string;
  parentId?: number;
  sortOrder: number;
  menuType: MenuType;
  visible: boolean;
  status: PermissionStatus;
  createTime: string;
  updateTime: string;
  children?: Menu[];
}

/**
 * 菜单权限关联
 */
export interface MenuPermission {
  id: number;
  menuId: number;
  permissionId: number;
  permission: Permission;
  grantedBy: number;
  grantedTime: string;
}

// ==================== 按钮权限模型 ====================

/**
 * 按钮信息
 */
export interface Button {
  id: number;
  buttonName: string;
  buttonKey: string;
  buttonType: ButtonType;
  menuId: number;
  icon?: string;
  sortOrder: number;
  status: PermissionStatus;
  createTime: string;
  updateTime: string;
}

/**
 * 按钮权限关联
 */
export interface ButtonPermission {
  id: number;
  buttonId: number;
  permissionId: number;
  permission: Permission;
  grantedBy: number;
  grantedTime: string;
}

// ==================== 权限核心模型 ====================

/**
 * 权限信息
 */
export interface Permission {
  id: number;
  permissionName: string;
  permissionKey: string;
  resourceType: ResourceType;
  resourcePath: string;
  action: PermissionAction;
  description?: string;
  status: PermissionStatus;
  createTime: string;
  updateTime: string;
}

/**
 * 权限组
 */
export interface PermissionGroup {
  id: number;
  groupName: string;
  groupKey: string;
  description?: string;
  permissions: Permission[];
  sortOrder: number;
  status: PermissionStatus;
  createTime: string;
  updateTime: string;
}

// ==================== 部门权限模型 ====================

/**
 * 部门信息
 */
export interface Department {
  id: number;
  deptName: string;
  deptKey: string;
  parentId?: number;
  sortOrder: number;
  status: PermissionStatus;
  createTime: string;
  updateTime: string;
  children?: Department[];
}

/**
 * 部门权限
 */
export interface DepartmentPermission {
  id: number;
  deptId: number;
  permissionId: number;
  permission: Permission;
  dataScope: DataScope;
  grantedBy: number;
  grantedTime: string;
}

/**
 * 数据权限范围
 */
export enum DataScope {
  ALL = 'all',           // 全部数据权限
  DEPT_AND_CHILD = 'dept_and_child', // 部门及以下数据权限
  DEPT_ONLY = 'dept_only',           // 仅部门数据权限
  SELF_ONLY = 'self_only',           // 仅本人数据权限
  CUSTOM = 'custom'                  // 自定义数据权限
}

// ==================== 权限验证模型 ====================

/**
 * 权限验证请求
 */
export interface PermissionCheckRequest {
  userId: number;
  resourceType: ResourceType;
  resourcePath: string;
  action: PermissionAction;
  context?: Record<string, unknown>;
}

/**
 * 权限验证结果
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  dataScope?: DataScope;
  customDataScope?: number[];
}

/**
 * 权限缓存信息
 */
export interface PermissionCache {
  userId: number;
  permissions: string[];
  roles: string[];
  menus: Menu[];
  buttons: Button[];
  dataScope: DataScope;
  customDataScope?: number[];
  expireTime: number;
}

// ==================== 权限管理API模型 ====================

/**
 * 权限分配请求
 */
export interface PermissionAssignRequest {
  userId?: number;
  roleId?: number;
  permissionIds: number[];
  expireTime?: string;
}

/**
 * 权限查询请求
 */
export interface PermissionQueryRequest {
  userId?: number;
  roleId?: number;
  resourceType?: ResourceType;
  resourcePath?: string;
  action?: PermissionAction;
  status?: PermissionStatus;
  page?: number;
  pageSize?: number;
}

/**
 * 权限查询结果
 */
export interface PermissionQueryResult {
  permissions: Permission[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 权限常量 ====================

/**
 * 权限常量定义
 */
export const PERMISSION_CONSTANTS = {
  // 系统权限
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_USER: 'system:user',
  
  // 用户管理权限
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_EXPORT: 'user:export',
  
  // 角色管理权限
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // 菜单管理权限
  MENU_VIEW: 'menu:view',
  MENU_CREATE: 'menu:create',
  MENU_UPDATE: 'menu:update',
  MENU_DELETE: 'menu:delete',
  
  // 部门管理权限
  DEPT_VIEW: 'dept:view',
  DEPT_CREATE: 'dept:create',
  DEPT_UPDATE: 'dept:update',
  DEPT_DELETE: 'dept:delete',
  
  // 字典管理权限
  DICT_VIEW: 'dict:view',
  DICT_CREATE: 'dict:create',
  DICT_UPDATE: 'dict:update',
  DICT_DELETE: 'dict:delete',
} as const;

/**
 * 默认角色定义
 */
export const DEFAULT_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
} as const;

/**
 * 默认权限组
 */
export const DEFAULT_PERMISSION_GROUPS = {
  SYSTEM_MANAGEMENT: 'system_management',
  USER_MANAGEMENT: 'user_management',
  ROLE_MANAGEMENT: 'role_management',
  MENU_MANAGEMENT: 'menu_management',
  DEPT_MANAGEMENT: 'dept_management',
  DICT_MANAGEMENT: 'dict_management'
} as const;
