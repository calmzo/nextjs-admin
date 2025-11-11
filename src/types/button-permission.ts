/**
 * 按钮权限模型详细设计
 * 基于Vue项目的按钮权限系统，适配Next.js项目
 */

import { 
  Button, 
  Permission, 
  Menu,
  PermissionStatus,
  ButtonType 
} from './permission';

// ==================== 按钮权限核心模型 ====================

/**
 * 按钮权限信息（完整版）
 */
export interface ButtonPermissionInfo {
  // 按钮基础信息
  button: Button;
  
  // 按钮权限信息
  permissions: ButtonPermissionDetail[];
  
  // 按钮所属菜单
  menu: Menu;
  
  // 按钮权限缓存
  permissionCache: ButtonPermissionCache;
}

/**
 * 按钮权限详情
 */
export interface ButtonPermissionDetail {
  id: number;
  buttonId: number;
  permissionId: number;
  permission: Permission;
  grantedBy: number;
  grantedTime: string;
  expireTime?: string;
  isActive: boolean;
  reason?: string;
}

/**
 * 按钮权限缓存
 */
export interface ButtonPermissionCache {
  buttonId: number;
  permissions: string[];
  lastUpdated: string;
  expireTime: number;
}

// ==================== 按钮权限验证模型 ====================

/**
 * 按钮权限验证请求
 */
export interface ButtonPermissionCheckRequest {
  buttonId: number;
  userId: number;
  action: string;
  context?: Record<string, unknown>;
}

/**
 * 按钮权限验证结果
 */
export interface ButtonPermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  buttonVisible: boolean;
  buttonAccessible: boolean;
  buttonEnabled: boolean;
  expireTime?: string;
}

/**
 * 按钮权限验证上下文
 */
export interface ButtonPermissionContext {
  buttonId: number;
  userId: number;
  userRoles: string[];
  userPermissions: string[];
  menuId: number;
  currentPath: string;
  buttonType: ButtonType;
}

// ==================== 按钮权限管理模型 ====================

/**
 * 按钮权限分配请求
 */
export interface ButtonPermissionAssignRequest {
  buttonId: number;
  permissionIds: number[];
  grantedBy: number;
  expireTime?: string;
  reason?: string;
}

/**
 * 按钮权限查询请求
 */
export interface ButtonPermissionQueryRequest {
  buttonId?: number;
  buttonName?: string;
  buttonKey?: string;
  menuId?: number;
  buttonType?: ButtonType;
  permissionId?: number;
  resourceType?: string;
  action?: string;
  status?: PermissionStatus;
  page?: number;
  pageSize?: number;
}

/**
 * 按钮权限查询结果
 */
export interface ButtonPermissionQueryResult {
  buttonPermissions: ButtonPermissionDetail[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 按钮权限统计模型 ====================

/**
 * 按钮权限统计信息
 */
export interface ButtonPermissionStats {
  buttonId: number;
  buttonName: string;
  totalPermissions: number;
  activePermissions: number;
  expiredPermissions: number;
  buttonType: ButtonType;
  menuId: number;
  menuName: string;
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
 * 按钮权限分析报告
 */
export interface ButtonPermissionAnalysis {
  buttonId: number;
  buttonName: string;
  permissionCategories: {
    system: number;
    user: number;
    role: number;
    menu: number;
    dept: number;
    dict: number;
  };
  buttonTypeDistribution: {
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

// ==================== 按钮权限操作模型 ====================

/**
 * 按钮权限操作日志
 */
export interface ButtonPermissionOperationLog {
  id: number;
  buttonId: number;
  operatorId: number;
  operationType: ButtonPermissionOperationType;
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
 * 按钮权限操作类型
 */
export enum ButtonPermissionOperationType {
  GRANT = 'grant',
  REVOKE = 'revoke',
  UPDATE = 'update',
  EXPIRE = 'expire',
  RENEW = 'renew',
  ENABLE = 'enable',
  DISABLE = 'disable'
}

/**
 * 按钮权限变更请求
 */
export interface ButtonPermissionChangeRequest {
  buttonId: number;
  changes: ButtonPermissionChange[];
  reason: string;
  operatorId: number;
}

/**
 * 按钮权限变更详情
 */
export interface ButtonPermissionChange {
  type: ButtonPermissionOperationType;
  targetType: string;
  targetId: number;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
}

// ==================== 按钮权限模板模型 ====================

/**
 * 按钮权限模板
 */
export interface ButtonPermissionTemplate {
  id: number;
  templateName: string;
  templateKey: string;
  description?: string;
  buttonType: ButtonType;
  permissions: Permission[];
  isSystem: boolean;
  createTime: string;
  updateTime: string;
}

/**
 * 按钮权限模板应用请求
 */
export interface ButtonPermissionTemplateApplyRequest {
  buttonId: number;
  templateId: number;
  appliedBy: number;
  reason?: string;
}

/**
 * 按钮权限模板查询请求
 */
export interface ButtonPermissionTemplateQueryRequest {
  templateName?: string;
  templateKey?: string;
  buttonType?: ButtonType;
  isSystem?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * 按钮权限模板查询结果
 */
export interface ButtonPermissionTemplateQueryResult {
  templates: ButtonPermissionTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 按钮权限继承模型 ====================

/**
 * 按钮权限继承关系
 */
export interface ButtonPermissionInheritance {
  id: number;
  parentButtonId: number;
  childButtonId: number;
  inheritanceType: ButtonInheritanceType;
  isActive: boolean;
  createTime: string;
  updateTime: string;
}

/**
 * 按钮继承类型
 */
export enum ButtonInheritanceType {
  FULL = 'full',           // 完全继承
  PARTIAL = 'partial',     // 部分继承
  SELECTIVE = 'selective'  // 选择性继承
}

/**
 * 按钮权限继承配置
 */
export interface ButtonPermissionInheritanceConfig {
  parentButtonId: number;
  childButtonId: number;
  inheritanceType: ButtonInheritanceType;
  inheritedPermissions: number[];
  excludedPermissions: number[];
}

// ==================== 按钮权限常量 ====================

/**
 * 按钮权限常量
 */
export const BUTTON_PERMISSION_CONSTANTS = {
  // 按钮权限缓存键
  CACHE_KEY_PREFIX: 'button:permission:',
  CACHE_EXPIRE_TIME: 30 * 60 * 1000, // 30分钟
  
  // 按钮权限验证
  PERMISSION_CHECK_CACHE_TIME: 5 * 60 * 1000, // 5分钟
  
  // 按钮权限统计
  STATS_CACHE_TIME: 60 * 60 * 1000, // 1小时
  
  // 按钮权限操作日志
  OPERATION_LOG_RETENTION_DAYS: 90, // 90天
  
  // 按钮权限模板
  TEMPLATE_CACHE_TIME: 24 * 60 * 60 * 1000, // 24小时
} as const;

/**
 * 按钮权限默认配置
 */
export const BUTTON_PERMISSION_DEFAULTS = {
  // 默认按钮类型
  DEFAULT_BUTTON_TYPE: ButtonType.PRIMARY,
  
  // 默认按钮状态
  DEFAULT_BUTTON_STATUS: PermissionStatus.ENABLED,
  
  // 默认权限过期时间（天）
  DEFAULT_PERMISSION_EXPIRE_DAYS: 365,
  
  // 权限验证超时时间（秒）
  PERMISSION_CHECK_TIMEOUT: 5,
  
  // 权限缓存大小限制
  PERMISSION_CACHE_SIZE_LIMIT: 1000,
  
  // 按钮权限继承深度限制
  MAX_INHERITANCE_DEPTH: 5,
} as const;

/**
 * 系统预定义按钮
 */
export const SYSTEM_BUTTONS = {
  // 用户管理按钮
  USER_ADD: {
    buttonKey: 'user:add',
    buttonName: '新增用户',
    buttonType: ButtonType.PRIMARY,
    icon: 'plus',
    sortOrder: 1
  },
  USER_EDIT: {
    buttonKey: 'user:edit',
    buttonName: '编辑用户',
    buttonType: ButtonType.SECONDARY,
    icon: 'edit',
    sortOrder: 2
  },
  USER_DELETE: {
    buttonKey: 'user:delete',
    buttonName: '删除用户',
    buttonType: ButtonType.DANGER,
    icon: 'delete',
    sortOrder: 3
  },
  USER_EXPORT: {
    buttonKey: 'user:export',
    buttonName: '导出用户',
    buttonType: ButtonType.INFO,
    icon: 'export',
    sortOrder: 4
  },
  USER_IMPORT: {
    buttonKey: 'user:import',
    buttonName: '导入用户',
    buttonType: ButtonType.INFO,
    icon: 'import',
    sortOrder: 5
  },
  
  // 角色管理按钮
  ROLE_ADD: {
    buttonKey: 'role:add',
    buttonName: '新增角色',
    buttonType: ButtonType.PRIMARY,
    icon: 'plus',
    sortOrder: 1
  },
  ROLE_EDIT: {
    buttonKey: 'role:edit',
    buttonName: '编辑角色',
    buttonType: ButtonType.SECONDARY,
    icon: 'edit',
    sortOrder: 2
  },
  ROLE_DELETE: {
    buttonKey: 'role:delete',
    buttonName: '删除角色',
    buttonType: ButtonType.DANGER,
    icon: 'delete',
    sortOrder: 3
  },
  ROLE_PERMISSION: {
    buttonKey: 'role:permission',
    buttonName: '分配权限',
    buttonType: ButtonType.SUCCESS,
    icon: 'permission',
    sortOrder: 4
  },
  
  // 菜单管理按钮
  MENU_ADD: {
    buttonKey: 'menu:add',
    buttonName: '新增菜单',
    buttonType: ButtonType.PRIMARY,
    icon: 'plus',
    sortOrder: 1
  },
  MENU_EDIT: {
    buttonKey: 'menu:edit',
    buttonName: '编辑菜单',
    buttonType: ButtonType.SECONDARY,
    icon: 'edit',
    sortOrder: 2
  },
  MENU_DELETE: {
    buttonKey: 'menu:delete',
    buttonName: '删除菜单',
    buttonType: ButtonType.DANGER,
    icon: 'delete',
    sortOrder: 3
  },
  MENU_SORT: {
    buttonKey: 'menu:sort',
    buttonName: '排序菜单',
    buttonType: ButtonType.INFO,
    icon: 'sort',
    sortOrder: 4
  },
  
  // 部门管理按钮
  DEPT_ADD: {
    buttonKey: 'dept:add',
    buttonName: '新增部门',
    buttonType: ButtonType.PRIMARY,
    icon: 'plus',
    sortOrder: 1
  },
  DEPT_EDIT: {
    buttonKey: 'dept:edit',
    buttonName: '编辑部门',
    buttonType: ButtonType.SECONDARY,
    icon: 'edit',
    sortOrder: 2
  },
  DEPT_DELETE: {
    buttonKey: 'dept:delete',
    buttonName: '删除部门',
    buttonType: ButtonType.DANGER,
    icon: 'delete',
    sortOrder: 3
  },
  DEPT_SORT: {
    buttonKey: 'dept:sort',
    buttonName: '排序部门',
    buttonType: ButtonType.INFO,
    icon: 'sort',
    sortOrder: 4
  },
  
  // 字典管理按钮
  DICT_ADD: {
    buttonKey: 'dict:add',
    buttonName: '新增字典',
    buttonType: ButtonType.PRIMARY,
    icon: 'plus',
    sortOrder: 1
  },
  DICT_EDIT: {
    buttonKey: 'dict:edit',
    buttonName: '编辑字典',
    buttonType: ButtonType.SECONDARY,
    icon: 'edit',
    sortOrder: 2
  },
  DICT_DELETE: {
    buttonKey: 'dict:delete',
    buttonName: '删除字典',
    buttonType: ButtonType.DANGER,
    icon: 'delete',
    sortOrder: 3
  },
  DICT_EXPORT: {
    buttonKey: 'dict:export',
    buttonName: '导出字典',
    buttonType: ButtonType.INFO,
    icon: 'export',
    sortOrder: 4
  },
  DICT_IMPORT: {
    buttonKey: 'dict:import',
    buttonName: '导入字典',
    buttonType: ButtonType.INFO,
    icon: 'import',
    sortOrder: 5
  }
} as const;
