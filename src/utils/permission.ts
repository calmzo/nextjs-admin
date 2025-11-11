/**
 * 权限检查工具函数
 * 参考Vue项目的hasAuth实现，适配Next.js项目
 */

import { useAuthStore } from '@/store/authStore';

/**
 * 判断是否有权限
 * @param value 权限值，可以是字符串或字符串数组
 * @param type 权限类型，默认为"button"
 * @returns 是否有权限
 */
export function hasAuth(value: string | string[], type: "button" | "role" = "button"): boolean {
  const { userInfo } = useAuthStore.getState();
  
  // 如果没有用户信息，返回false
  if (!userInfo) {
    return false;
  }

  // 超级管理员拥有所有权限
  if (type === "button" && userInfo.roles?.includes("ROOT")) {
    return true;
  }

  // 获取权限列表
  const auths = type === "button" ? userInfo.perms : userInfo.roles;
  
  if (!auths || !Array.isArray(auths)) {
    return false;
  }

  // 检查权限
  const hasPermission = typeof value === "string"
    ? auths.includes(value)
    : value.some((perm) => auths.includes(perm));
  
  return hasPermission;
}

/**
 * 测试用的权限检查函数（用于演示）
 * 在实际项目中应该从API获取用户权限
 */
export function hasAuthForTest(value: string | string[], type: "button" | "role" = "button"): boolean {
  // 模拟测试用户权限 - 基于实际接口权限格式
  const testUserPermissions = [
    "sys:user:add",
    "sys:role:add", 
    "sys:menu:add",
    "sys:dept:add",
    "sys:dict:add",
    "sys:user:query",
    "sys:user:import",
    "sys:config:query",
    "sys:config:add",
    "sys:config:update",
    "sys:config:delete",
    "sys:config:refresh",
    "sys:notice:query",
    "sys:notice:add",
    "sys:notice:edit",
    "sys:notice:delete",
    "sys:notice:publish",
    "sys:notice:revoke",
    "sys:notice:view",
    "sys:dict-item:add",
    "sys:role:query",
    "sys:menu:query",
    "sys:dept:query",
    "sys:dict:query",
    "sys:dict-item:query"
  ];
  
  const testUserRoles = ['admin'];
  
  // 超级管理员拥有所有权限
  if (type === "button" && testUserRoles.includes("ROOT")) {
    return true;
  }

  // 获取权限列表
  const auths = type === "button" ? testUserPermissions : testUserRoles;
  
  // 检查权限
  return typeof value === "string"
    ? auths.includes(value)
    : value.some((perm) => auths.includes(perm));
}

/**
 * 检查按钮权限
 * @param buttonKey 按钮权限标识
 * @returns 是否有按钮权限
 */
export function hasButtonAuth(buttonKey: string): boolean {
  return hasAuth(buttonKey, "button");
}

/**
 * 检查角色权限
 * @param roleKey 角色标识
 * @returns 是否有角色权限
 */
export function hasRoleAuth(roleKey: string): boolean {
  return hasAuth(roleKey, "role");
}

/**
 * 检查多个权限（需要全部满足）
 * @param permissions 权限数组
 * @param type 权限类型
 * @returns 是否全部有权限
 */
export function hasAllAuth(permissions: string[], type: "button" | "role" = "button"): boolean {
  return permissions.every(perm => hasAuth(perm, type));
}

/**
 * 检查多个权限（满足任意一个即可）
 * @param permissions 权限数组
 * @param type 权限类型
 * @returns 是否有任意权限
 */
export function hasAnyAuth(permissions: string[], type: "button" | "role" = "button"): boolean {
  return permissions.some(perm => hasAuth(perm, type));
}

/**
 * 部门管理相关按钮权限常量
 * 基于实际接口权限格式：sys:模块:操作
 */
export const DEPT_BUTTON_PERMISSIONS = {
  SEARCH: 'sys:dept:query',    // 搜索权限（查询权限）
  ADD: 'sys:dept:add',         // 新增权限
  EDIT: 'sys:dept:edit',       // 编辑权限
  DELETE: 'sys:dept:delete',   // 删除权限
  EXPORT: 'sys:dept:export',   // 导出权限
  IMPORT: 'sys:dept:import',   // 导入权限
  SORT: 'sys:dept:sort'        // 排序权限
} as const;

/**
 * 用户管理相关按钮权限常量
 * 基于实际接口权限格式：sys:模块:操作
 */
export const USER_BUTTON_PERMISSIONS = {
  SEARCH: 'sys:user:query',      // 搜索权限（查询权限）
  ADD: 'sys:user:add',           // 新增权限
  EDIT: 'sys:user:edit',         // 编辑权限
  DELETE: 'sys:user:delete',     // 删除权限
  RESET_PASSWORD: 'sys:user:reset-password', // 重置密码权限
  EXPORT: 'sys:user:export',     // 导出权限
  IMPORT: 'sys:user:import',     // 导入权限
  VIEW: 'sys:user:view'          // 查看权限
} as const;

/**
 * 菜单管理相关按钮权限常量
 * 基于实际接口权限格式：sys:模块:操作
 */
export const MENU_BUTTON_PERMISSIONS = {
  SEARCH: 'sys:menu:query',    // 搜索权限（查询权限）
  ADD: 'sys:menu:add',         // 新增权限
  EDIT: 'sys:menu:edit',       // 编辑权限
  DELETE: 'sys:menu:delete',   // 删除权限
  EXPORT: 'sys:menu:export',   // 导出权限
  VIEW: 'sys:menu:view'        // 查看权限
} as const;

/**
 * 角色管理相关按钮权限常量
 * 基于实际接口权限格式：sys:模块:操作
 */
export const ROLE_BUTTON_PERMISSIONS = {
  SEARCH: 'sys:role:query',    // 搜索权限（查询权限）
  ADD: 'sys:role:add',         // 新增权限
  EDIT: 'sys:role:edit',       // 编辑权限
  DELETE: 'sys:role:delete',  // 删除权限
  ASSIGN_PERM: 'sys:role:assign'  // 分配权限
} as const;

/**
 * 字典管理相关按钮权限常量
 * 基于实际接口权限格式：sys:模块:操作
 */
export const DICT_BUTTON_PERMISSIONS = {
  SEARCH: 'sys:dict:query',    // 搜索权限（查询权限）
  ADD: 'sys:dict:add',         // 新增权限
  EDIT: 'sys:dict:edit',       // 编辑权限
  DELETE: 'sys:dict:delete',   // 删除权限
  VIEW: 'sys:dict:view'        // 查看权限（查看字典数据）
} as const;

/**
 * 字典项管理相关按钮权限常量
 * 基于实际接口权限格式：sys:模块:操作
 */
export const DICT_ITEM_BUTTON_PERMISSIONS = {
  SEARCH: 'sys:dict-item:query',    // 搜索权限（查询权限）
  ADD: 'sys:dict-item:add',         // 新增权限
  EDIT: 'sys:dict-item:edit',       // 编辑权限
  DELETE: 'sys:dict-item:delete',   // 删除权限
  VIEW: 'sys:dict-item:view'        // 查看权限（查看字典项数据）
} as const;

/**
 * 系统配置管理相关按钮权限常量
 * 基于实际接口权限格式：sys:模块:操作
 */
export const CONFIG_BUTTON_PERMISSIONS = {
  SEARCH: 'sys:config:query',    // 搜索权限（查询权限）
  ADD: 'sys:config:add',         // 新增权限
  EDIT: 'sys:config:update',     // 编辑权限（注意：接口使用update而不是edit）
  DELETE: 'sys:config:delete',  // 删除权限
  REFRESH: 'sys:config:refresh', // 刷新缓存权限
  VIEW: 'sys:config:view'        // 查看权限
} as const;

/**
 * 通知公告管理相关按钮权限常量
 * 基于实际接口权限格式：sys:模块:操作
 */
export const NOTICE_BUTTON_PERMISSIONS = {
  SEARCH: 'sys:notice:query',    // 搜索权限（查询权限）
  ADD: 'sys:notice:add',         // 新增权限
  EDIT: 'sys:notice:edit',       // 编辑权限
  DELETE: 'sys:notice:delete',   // 删除权限
  PUBLISH: 'sys:notice:publish', // 发布权限
  REVOKE: 'sys:notice:revoke',   // 撤回权限
  VIEW: 'sys:notice:view'         // 查看权限
} as const;

/**
 * 检查部门按钮权限的便捷函数
 */
export const deptButtonAuth = {
  search: () => hasButtonAuth(DEPT_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasButtonAuth(DEPT_BUTTON_PERMISSIONS.ADD),
  edit: () => hasButtonAuth(DEPT_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasButtonAuth(DEPT_BUTTON_PERMISSIONS.DELETE),
  export: () => hasButtonAuth(DEPT_BUTTON_PERMISSIONS.EXPORT),
  import: () => hasButtonAuth(DEPT_BUTTON_PERMISSIONS.IMPORT),
  sort: () => hasButtonAuth(DEPT_BUTTON_PERMISSIONS.SORT)
};

/**
 * 检查用户按钮权限的便捷函数
 */
export const userButtonAuth = {
  search: () => hasButtonAuth(USER_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasButtonAuth(USER_BUTTON_PERMISSIONS.ADD),
  edit: () => hasButtonAuth(USER_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasButtonAuth(USER_BUTTON_PERMISSIONS.DELETE),
  resetPassword: () => hasButtonAuth(USER_BUTTON_PERMISSIONS.RESET_PASSWORD),
  export: () => hasButtonAuth(USER_BUTTON_PERMISSIONS.EXPORT),
  import: () => hasButtonAuth(USER_BUTTON_PERMISSIONS.IMPORT),
  view: () => hasButtonAuth(USER_BUTTON_PERMISSIONS.VIEW)
};

/**
 * 检查菜单按钮权限的便捷函数
 */
export const menuButtonAuth = {
  search: () => hasButtonAuth(MENU_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasButtonAuth(MENU_BUTTON_PERMISSIONS.ADD),
  edit: () => hasButtonAuth(MENU_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasButtonAuth(MENU_BUTTON_PERMISSIONS.DELETE),
  export: () => hasButtonAuth(MENU_BUTTON_PERMISSIONS.EXPORT),
  view: () => hasButtonAuth(MENU_BUTTON_PERMISSIONS.VIEW)
};

/**
 * 检查角色按钮权限的便捷函数
 */
export const roleButtonAuth = {
  search: () => hasButtonAuth(ROLE_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasButtonAuth(ROLE_BUTTON_PERMISSIONS.ADD),
  edit: () => hasButtonAuth(ROLE_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasButtonAuth(ROLE_BUTTON_PERMISSIONS.DELETE),
  assignPerm: () => hasButtonAuth(ROLE_BUTTON_PERMISSIONS.ASSIGN_PERM)
};

/**
 * 检查字典按钮权限的便捷函数
 */
export const dictButtonAuth = {
  search: () => hasButtonAuth(DICT_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasButtonAuth(DICT_BUTTON_PERMISSIONS.ADD),
  edit: () => hasButtonAuth(DICT_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasButtonAuth(DICT_BUTTON_PERMISSIONS.DELETE),
  view: () => hasButtonAuth(DICT_BUTTON_PERMISSIONS.VIEW)
};

/**
 * 检查字典项按钮权限的便捷函数
 */
export const dictItemButtonAuth = {
  search: () => hasButtonAuth(DICT_ITEM_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasButtonAuth(DICT_ITEM_BUTTON_PERMISSIONS.ADD),
  edit: () => hasButtonAuth(DICT_ITEM_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasButtonAuth(DICT_ITEM_BUTTON_PERMISSIONS.DELETE),
  view: () => hasButtonAuth(DICT_ITEM_BUTTON_PERMISSIONS.VIEW)
};

/**
 * 检查系统配置按钮权限的便捷函数
 */
export const configButtonAuth = {
  search: () => hasButtonAuth(CONFIG_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasButtonAuth(CONFIG_BUTTON_PERMISSIONS.ADD),
  edit: () => hasButtonAuth(CONFIG_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasButtonAuth(CONFIG_BUTTON_PERMISSIONS.DELETE),
  refresh: () => hasButtonAuth(CONFIG_BUTTON_PERMISSIONS.REFRESH),
  view: () => hasButtonAuth(CONFIG_BUTTON_PERMISSIONS.VIEW)
};

/**
 * 检查通知公告按钮权限的便捷函数
 */
export const noticeButtonAuth = {
  search: () => hasButtonAuth(NOTICE_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasButtonAuth(NOTICE_BUTTON_PERMISSIONS.ADD),
  edit: () => hasButtonAuth(NOTICE_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasButtonAuth(NOTICE_BUTTON_PERMISSIONS.DELETE),
  publish: () => hasButtonAuth(NOTICE_BUTTON_PERMISSIONS.PUBLISH),
  revoke: () => hasButtonAuth(NOTICE_BUTTON_PERMISSIONS.REVOKE),
  view: () => hasButtonAuth(NOTICE_BUTTON_PERMISSIONS.VIEW)
};

/**
 * 测试用的部门按钮权限检查函数
 * 用于演示按钮权限功能
 */
export const deptButtonAuthTest = {
  search: () => hasAuthForTest(DEPT_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasAuthForTest(DEPT_BUTTON_PERMISSIONS.ADD),
  edit: () => hasAuthForTest(DEPT_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasAuthForTest(DEPT_BUTTON_PERMISSIONS.DELETE),
  export: () => hasAuthForTest(DEPT_BUTTON_PERMISSIONS.EXPORT),
  import: () => hasAuthForTest(DEPT_BUTTON_PERMISSIONS.IMPORT),
  sort: () => hasAuthForTest(DEPT_BUTTON_PERMISSIONS.SORT)
};

/**
 * 测试用的用户按钮权限检查函数
 * 用于演示按钮权限功能
 */
export const userButtonAuthTest = {
  search: () => hasAuthForTest(USER_BUTTON_PERMISSIONS.SEARCH),
  add: () => hasAuthForTest(USER_BUTTON_PERMISSIONS.ADD),
  edit: () => hasAuthForTest(USER_BUTTON_PERMISSIONS.EDIT),
  delete: () => hasAuthForTest(USER_BUTTON_PERMISSIONS.DELETE),
  resetPassword: () => hasAuthForTest(USER_BUTTON_PERMISSIONS.RESET_PASSWORD),
  export: () => hasAuthForTest(USER_BUTTON_PERMISSIONS.EXPORT),
  import: () => hasAuthForTest(USER_BUTTON_PERMISSIONS.IMPORT),
  view: () => hasAuthForTest(USER_BUTTON_PERMISSIONS.VIEW)
};
