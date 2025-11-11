/**
 * 菜单权限模型详细设计
 * 基于Vue项目的菜单权限系统，适配Next.js项目
 */

import { 
  Menu, 
  Permission, 
  Button,
  PermissionStatus,
  MenuType 
} from './permission';

// ==================== 菜单权限核心模型 ====================

/**
 * 菜单权限信息（完整版）
 */
export interface MenuPermissionInfo {
  // 菜单基础信息
  menu: Menu;
  
  // 菜单权限信息
  permissions: MenuPermissionDetail[];
  
  // 菜单按钮权限
  buttons: MenuButtonPermission[];
  
  // 菜单子菜单
  children: MenuPermissionInfo[];
  
  // 菜单权限缓存
  permissionCache: MenuPermissionCache;
}

/**
 * 菜单权限详情
 */
export interface MenuPermissionDetail {
  id: number;
  menuId: number;
  permissionId: number;
  permission: Permission;
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
  reason?: string;
}

/**
 * 菜单按钮权限
 */
export interface MenuButtonPermission {
  id: number;
  menuId: number;
  buttonId: number;
  button: Button;
  permissions: Permission[];
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
}

/**
 * 菜单权限缓存
 */
export interface MenuPermissionCache {
  menuId: number;
  permissions: string[];
  buttons: string[];
  lastUpdated: string;
  expireTime: number;
}

// ==================== 菜单权限验证模型 ====================

/**
 * 菜单权限验证请求
 */
export interface MenuPermissionCheckRequest {
  menuId: number;
  userId: number;
  action: string;
  context?: Record<string, unknown>;
}

/**
 * 菜单权限验证结果
 */
export interface MenuPermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  menuVisible: boolean;
  menuAccessible: boolean;
  expireTime?: string;
}

/**
 * 菜单权限验证上下文
 */
export interface MenuPermissionContext {
  menuId: number;
  userId: number;
  userRoles: string[];
  userPermissions: string[];
  currentPath: string;
  parentMenuId?: number;
}

// ==================== 菜单权限管理模型 ====================

/**
 * 菜单权限分配请求
 */
export interface MenuPermissionAssignRequest {
  menuId: number;
  permissionIds: number[];
  grantedBy: number;
  expireTime?: string;
  reason?: string;
}

/**
 * 菜单按钮权限分配请求
 */
export interface MenuButtonPermissionAssignRequest {
  menuId: number;
  buttonIds: number[];
  grantedBy: number;
  expireTime?: string;
  reason?: string;
}

/**
 * 菜单权限查询请求
 */
export interface MenuPermissionQueryRequest {
  menuId?: number;
  menuName?: string;
  menuKey?: string;
  parentId?: number;
  menuType?: MenuType;
  permissionId?: number;
  resourceType?: string;
  action?: string;
  status?: PermissionStatus;
  visible?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * 菜单权限查询结果
 */
export interface MenuPermissionQueryResult {
  menuPermissions: MenuPermissionDetail[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 菜单树权限模型 ====================

/**
 * 菜单树节点（带权限）
 */
export interface MenuTreeNode {
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
  children: MenuTreeNode[];
  permissions: Permission[];
  buttons: Button[];
  hasPermission: boolean;
  isAccessible: boolean;
}

/**
 * 菜单树构建请求
 */
export interface MenuTreeBuildRequest {
  userId: number;
  includeInvisible?: boolean;
  includeDisabled?: boolean;
  includeButtons?: boolean;
  includePermissions?: boolean;
}

/**
 * 菜单树构建结果
 */
export interface MenuTreeBuildResult {
  menuTree: MenuTreeNode[];
  totalMenus: number;
  accessibleMenus: number;
  totalButtons: number;
  accessibleButtons: number;
}

// ==================== 菜单权限统计模型 ====================

/**
 * 菜单权限统计信息
 */
export interface MenuPermissionStats {
  menuId: number;
  menuName: string;
  totalPermissions: number;
  activePermissions: number;
  expiredPermissions: number;
  totalButtons: number;
  totalChildren: number;
  accessibleChildren: number;
  permissionDistribution: {
    read: number;
    create: number;
    update: number;
    delete: number;
    export: number;
    import: number;
  };
}

/**
 * 菜单权限分析报告
 */
export interface MenuPermissionAnalysis {
  menuId: number;
  menuName: string;
  permissionCategories: {
    system: number;
    user: number;
    role: number;
    menu: number;
    dept: number;
    dict: number;
  };
  buttonDistribution: {
    primary: number;
    secondary: number;
    success: number;
    warning: number;
    danger: number;
    info: number;
  };
  riskAssessment: {
    highRiskPermissions: string[];
    excessivePermissions: string[];
    missingPermissions: string[];
  };
  recommendations: string[];
}

// ==================== 菜单权限操作模型 ====================

/**
 * 菜单权限操作日志
 */
export interface MenuPermissionOperationLog {
  id: number;
  menuId: number;
  operatorId: number;
  operationType: MenuPermissionOperationType;
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
 * 菜单权限操作类型
 */
export enum MenuPermissionOperationType {
  GRANT = 'grant',
  REVOKE = 'revoke',
  UPDATE = 'update',
  EXPIRE = 'expire',
  RENEW = 'renew',
  ADD_BUTTON = 'add_button',
  REMOVE_BUTTON = 'remove_button',
  UPDATE_BUTTON = 'update_button'
}

/**
 * 菜单权限变更请求
 */
export interface MenuPermissionChangeRequest {
  menuId: number;
  changes: MenuPermissionChange[];
  reason: string;
  operatorId: number;
}

/**
 * 菜单权限变更详情
 */
export interface MenuPermissionChange {
  type: MenuPermissionOperationType;
  targetType: string;
  targetId: number;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
}

// ==================== 菜单权限模板模型 ====================

/**
 * 菜单权限模板
 */
export interface MenuPermissionTemplate {
  id: number;
  templateName: string;
  templateKey: string;
  description?: string;
  menuStructure: MenuTemplateNode[];
  permissions: Permission[];
  buttons: Button[];
  isSystem: boolean;
  createTime: string;
  updateTime: string;
}

/**
 * 菜单模板节点
 */
export interface MenuTemplateNode {
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
  permissions: Permission[];
  buttons: Button[];
  children: MenuTemplateNode[];
}

/**
 * 菜单权限模板应用请求
 */
export interface MenuPermissionTemplateApplyRequest {
  menuId: number;
  templateId: number;
  appliedBy: number;
  reason?: string;
}

/**
 * 菜单权限模板查询请求
 */
export interface MenuPermissionTemplateQueryRequest {
  templateName?: string;
  templateKey?: string;
  isSystem?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * 菜单权限模板查询结果
 */
export interface MenuPermissionTemplateQueryResult {
  templates: MenuPermissionTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 菜单权限继承模型 ====================

/**
 * 菜单权限继承关系
 */
export interface MenuPermissionInheritance {
  id: number;
  parentMenuId: number;
  childMenuId: number;
  inheritanceType: MenuInheritanceType;
  isActive: boolean;
  createTime: string;
  updateTime: string;
}

/**
 * 菜单继承类型
 */
export enum MenuInheritanceType {
  FULL = 'full',           // 完全继承
  PARTIAL = 'partial',     // 部分继承
  SELECTIVE = 'selective'  // 选择性继承
}

/**
 * 菜单权限继承配置
 */
export interface MenuPermissionInheritanceConfig {
  parentMenuId: number;
  childMenuId: number;
  inheritanceType: MenuInheritanceType;
  inheritedPermissions: number[];
  excludedPermissions: number[];
  inheritedButtons: number[];
  excludedButtons: number[];
}

// ==================== 菜单权限常量 ====================

/**
 * 菜单权限常量
 */
export const MENU_PERMISSION_CONSTANTS = {
  // 菜单权限缓存键
  CACHE_KEY_PREFIX: 'menu:permission:',
  CACHE_EXPIRE_TIME: 30 * 60 * 1000, // 30分钟
  
  // 菜单权限验证
  PERMISSION_CHECK_CACHE_TIME: 5 * 60 * 1000, // 5分钟
  
  // 菜单权限统计
  STATS_CACHE_TIME: 60 * 60 * 1000, // 1小时
  
  // 菜单权限操作日志
  OPERATION_LOG_RETENTION_DAYS: 90, // 90天
  
  // 菜单树缓存
  MENU_TREE_CACHE_TIME: 10 * 60 * 1000, // 10分钟
} as const;

/**
 * 菜单权限默认配置
 */
export const MENU_PERMISSION_DEFAULTS = {
  // 默认菜单类型
  DEFAULT_MENU_TYPE: MenuType.MENU,
  
  // 默认菜单可见性
  DEFAULT_MENU_VISIBLE: true,
  
  // 默认菜单状态
  DEFAULT_MENU_STATUS: PermissionStatus.ENABLED,
  
  // 默认权限过期时间（天）
  DEFAULT_PERMISSION_EXPIRE_DAYS: 365,
  
  // 权限验证超时时间（秒）
  PERMISSION_CHECK_TIMEOUT: 5,
  
  // 权限缓存大小限制
  PERMISSION_CACHE_SIZE_LIMIT: 1000,
  
  // 菜单树深度限制
  MAX_MENU_TREE_DEPTH: 10,
} as const;

/**
 * 系统预定义菜单
 */
export const SYSTEM_MENUS = {
  DASHBOARD: {
    menuKey: 'dashboard',
    menuName: '仪表板',
    path: '/',
    component: 'Dashboard',
    icon: 'dashboard',
    menuType: MenuType.MENU,
    visible: true,
    sortOrder: 1
  },
  SYSTEM_MANAGEMENT: {
    menuKey: 'system',
    menuName: '系统管理',
    path: '/system',
    component: 'SystemLayout',
    icon: 'system',
    menuType: MenuType.DIRECTORY,
    visible: true,
    sortOrder: 2
  },
  USER_MANAGEMENT: {
    menuKey: 'user',
    menuName: '用户管理',
    path: '/system/user',
    component: 'UserManagement',
    icon: 'user',
    menuType: MenuType.MENU,
    visible: true,
    sortOrder: 1
  },
  ROLE_MANAGEMENT: {
    menuKey: 'role',
    menuName: '角色管理',
    path: '/system/role',
    component: 'RoleManagement',
    icon: 'role',
    menuType: MenuType.MENU,
    visible: true,
    sortOrder: 2
  },
  MENU_MANAGEMENT: {
    menuKey: 'menu',
    menuName: '菜单管理',
    path: '/system/menu',
    component: 'MenuManagement',
    icon: 'menu',
    menuType: MenuType.MENU,
    visible: true,
    sortOrder: 3
  },
  DEPT_MANAGEMENT: {
    menuKey: 'dept',
    menuName: '部门管理',
    path: '/system/dept',
    component: 'DeptManagement',
    icon: 'dept',
    menuType: MenuType.MENU,
    visible: true,
    sortOrder: 4
  },
  DICT_MANAGEMENT: {
    menuKey: 'dict',
    menuName: '字典管理',
    path: '/system/dict',
    component: 'DictManagement',
    icon: 'dict',
    menuType: MenuType.MENU,
    visible: true,
    sortOrder: 5
  }
} as const;
