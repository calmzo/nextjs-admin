/**
 * 权限系统API接口
 * 基于Vue项目的权限API设计，适配Next.js项目
 */

import request from '@/utils/request';
import type {
  // 基础权限类型
  Permission,
  
  // 用户权限类型
  UserPermissionInfo,
  UserPermissionCheckRequest,
  UserPermissionCheckResult,
  UserPermissionAssignRequest,
  UserPermissionQueryRequest,
  UserPermissionQueryResult,
  
  // 角色权限类型
  RolePermissionInfo,
  RolePermissionCheckRequest,
  RolePermissionCheckResult,
  RolePermissionAssignRequest,
  RolePermissionQueryRequest,
  RolePermissionQueryResult,
  
  // 菜单权限类型
  MenuPermissionInfo,
  MenuPermissionCheckRequest,
  MenuPermissionCheckResult,
  MenuPermissionAssignRequest,
  MenuPermissionQueryRequest,
  MenuPermissionQueryResult,
  MenuTreeBuildRequest,
  MenuTreeBuildResult,
  
  // 按钮权限类型
  ButtonPermissionInfo,
  ButtonPermissionCheckRequest,
  ButtonPermissionCheckResult,
  ButtonPermissionAssignRequest,
  ButtonPermissionQueryRequest,
  ButtonPermissionQueryResult,
  
  // 权限验证类型
  PermissionValidationResult,
  PermissionValidationContext
} from '@/types';

// ==================== 权限基础API ====================

const PERMISSION_BASE_URL = '/prod-api/admin/system/permission';

export const PermissionAPI = {
  // ==================== 权限验证API ====================
  
  /**
   * 验证用户权限
   */
  checkUserPermission(data: UserPermissionCheckRequest): Promise<UserPermissionCheckResult> {
    return request({
      url: `${PERMISSION_BASE_URL}/user/check`,
      method: 'post',
      data
    });
  },
  
  /**
   * 验证角色权限
   */
  checkRolePermission(data: RolePermissionCheckRequest): Promise<RolePermissionCheckResult> {
    return request({
      url: `${PERMISSION_BASE_URL}/role/check`,
      method: 'post',
      data
    });
  },
  
  /**
   * 验证菜单权限
   */
  checkMenuPermission(data: MenuPermissionCheckRequest): Promise<MenuPermissionCheckResult> {
    return request({
      url: `${PERMISSION_BASE_URL}/menu/check`,
      method: 'post',
      data
    });
  },
  
  /**
   * 验证按钮权限
   */
  checkButtonPermission(data: ButtonPermissionCheckRequest): Promise<ButtonPermissionCheckResult> {
    return request({
      url: `${PERMISSION_BASE_URL}/button/check`,
      method: 'post',
      data
    });
  },
  
  /**
   * 批量验证权限
   */
  batchCheckPermissions(requests: PermissionValidationContext[]): Promise<PermissionValidationResult[]> {
    return request({
      url: `${PERMISSION_BASE_URL}/batch/check`,
      method: 'post',
      data: { requests }
    });
  },
  
  // ==================== 用户权限API ====================
  
  /**
   * 获取用户权限信息
   */
  getUserPermissionInfo(userId: number): Promise<UserPermissionInfo> {
    return request({
      url: `${PERMISSION_BASE_URL}/user/${userId}/info`,
      method: 'get'
    });
  },
  
  /**
   * 分配用户权限
   */
  assignUserPermission(data: UserPermissionAssignRequest): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/user/assign`,
      method: 'post',
      data
    });
  },
  
  /**
   * 撤销用户权限
   */
  revokeUserPermission(data: UserPermissionAssignRequest): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/user/revoke`,
      method: 'post',
      data
    });
  },
  
  /**
   * 查询用户权限
   */
  queryUserPermissions(params: UserPermissionQueryRequest): Promise<UserPermissionQueryResult> {
    return request({
      url: `${PERMISSION_BASE_URL}/user/query`,
      method: 'get',
      params
    });
  },
  
  /**
   * 获取用户权限统计
   */
  getUserPermissionStats(userId: number): Promise<Record<string, unknown>> {
    return request({
      url: `${PERMISSION_BASE_URL}/user/${userId}/stats`,
      method: 'get'
    });
  },
  
  // ==================== 角色权限API ====================
  
  /**
   * 获取角色权限信息
   */
  getRolePermissionInfo(roleId: number): Promise<RolePermissionInfo> {
    return request({
      url: `${PERMISSION_BASE_URL}/role/${roleId}/info`,
      method: 'get'
    });
  },
  
  /**
   * 分配角色权限
   */
  assignRolePermission(data: RolePermissionAssignRequest): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/role/assign`,
      method: 'post',
      data
    });
  },
  
  /**
   * 撤销角色权限
   */
  revokeRolePermission(data: RolePermissionAssignRequest): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/role/revoke`,
      method: 'post',
      data
    });
  },
  
  /**
   * 查询角色权限
   */
  queryRolePermissions(params: RolePermissionQueryRequest): Promise<RolePermissionQueryResult> {
    return request({
      url: `${PERMISSION_BASE_URL}/role/query`,
      method: 'get',
      params
    });
  },
  
  /**
   * 获取角色权限统计
   */
  getRolePermissionStats(roleId: number): Promise<Record<string, unknown>> {
    return request({
      url: `${PERMISSION_BASE_URL}/role/${roleId}/stats`,
      method: 'get'
    });
  },
  
  // ==================== 菜单权限API ====================
  
  /**
   * 获取菜单权限信息
   */
  getMenuPermissionInfo(menuId: number): Promise<MenuPermissionInfo> {
    return request({
      url: `${PERMISSION_BASE_URL}/menu/${menuId}/info`,
      method: 'get'
    });
  },
  
  /**
   * 分配菜单权限
   */
  assignMenuPermission(data: MenuPermissionAssignRequest): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/menu/assign`,
      method: 'post',
      data
    });
  },
  
  /**
   * 撤销菜单权限
   */
  revokeMenuPermission(data: MenuPermissionAssignRequest): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/menu/revoke`,
      method: 'post',
      data
    });
  },
  
  /**
   * 查询菜单权限
   */
  queryMenuPermissions(params: MenuPermissionQueryRequest): Promise<MenuPermissionQueryResult> {
    return request({
      url: `${PERMISSION_BASE_URL}/menu/query`,
      method: 'get',
      params
    });
  },
  
  /**
   * 构建菜单树
   */
  buildMenuTree(data: MenuTreeBuildRequest): Promise<MenuTreeBuildResult> {
    return request({
      url: `${PERMISSION_BASE_URL}/menu/tree`,
      method: 'post',
      data
    });
  },
  
  /**
   * 获取菜单权限统计
   */
  getMenuPermissionStats(menuId: number): Promise<Record<string, unknown>> {
    return request({
      url: `${PERMISSION_BASE_URL}/menu/${menuId}/stats`,
      method: 'get'
    });
  },
  
  // ==================== 按钮权限API ====================
  
  /**
   * 获取按钮权限信息
   */
  getButtonPermissionInfo(buttonId: number): Promise<ButtonPermissionInfo> {
    return request({
      url: `${PERMISSION_BASE_URL}/button/${buttonId}/info`,
      method: 'get'
    });
  },
  
  /**
   * 分配按钮权限
   */
  assignButtonPermission(data: ButtonPermissionAssignRequest): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/button/assign`,
      method: 'post',
      data
    });
  },
  
  /**
   * 撤销按钮权限
   */
  revokeButtonPermission(data: ButtonPermissionAssignRequest): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/button/revoke`,
      method: 'post',
      data
    });
  },
  
  /**
   * 查询按钮权限
   */
  queryButtonPermissions(params: ButtonPermissionQueryRequest): Promise<ButtonPermissionQueryResult> {
    return request({
      url: `${PERMISSION_BASE_URL}/button/query`,
      method: 'get',
      params
    });
  },
  
  /**
   * 获取按钮权限统计
   */
  getButtonPermissionStats(buttonId: number): Promise<Record<string, unknown>> {
    return request({
      url: `${PERMISSION_BASE_URL}/button/${buttonId}/stats`,
      method: 'get'
    });
  },
  
  // ==================== 权限管理API ====================
  
  /**
   * 获取所有权限
   */
  getAllPermissions(): Promise<Permission[]> {
    return request({
      url: `${PERMISSION_BASE_URL}/list`,
      method: 'get'
    });
  },
  
  /**
   * 创建权限
   */
  createPermission(data: Partial<Permission>): Promise<Permission> {
    return request({
      url: `${PERMISSION_BASE_URL}/create`,
      method: 'post',
      data
    });
  },
  
  /**
   * 更新权限
   */
  updatePermission(id: number, data: Partial<Permission>): Promise<Permission> {
    return request({
      url: `${PERMISSION_BASE_URL}/${id}/update`,
      method: 'put',
      data
    });
  },
  
  /**
   * 删除权限
   */
  deletePermission(id: number): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/${id}/delete`,
      method: 'delete'
    });
  },
  
  /**
   * 批量删除权限
   */
  batchDeletePermissions(ids: number[]): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/batch/delete`,
      method: 'post',
      data: { ids }
    });
  },
  
  // ==================== 权限缓存API ====================
  
  /**
   * 清除权限缓存
   */
  clearPermissionCache(): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/cache/clear`,
      method: 'post'
    });
  },
  
  /**
   * 清除用户权限缓存
   */
  clearUserPermissionCache(userId: number): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/cache/user/${userId}/clear`,
      method: 'post'
    });
  },
  
  /**
   * 清除角色权限缓存
   */
  clearRolePermissionCache(roleId: number): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/cache/role/${roleId}/clear`,
      method: 'post'
    });
  },
  
  /**
   * 获取权限缓存统计
   */
  getPermissionCacheStats(): Promise<Record<string, unknown>> {
    return request({
      url: `${PERMISSION_BASE_URL}/cache/stats`,
      method: 'get'
    });
  },
  
  // ==================== 权限同步API ====================
  
  /**
   * 同步用户权限
   */
  syncUserPermissions(userId: number): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/sync/user/${userId}`,
      method: 'post'
    });
  },
  
  /**
   * 同步角色权限
   */
  syncRolePermissions(roleId: number): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/sync/role/${roleId}`,
      method: 'post'
    });
  },
  
  /**
   * 同步所有权限
   */
  syncAllPermissions(): Promise<void> {
    return request({
      url: `${PERMISSION_BASE_URL}/sync/all`,
      method: 'post'
    });
  },
  
  // ==================== 权限分析API ====================
  
  /**
   * 分析用户权限
   */
  analyzeUserPermissions(userId: number): Promise<Record<string, unknown>> {
    return request({
      url: `${PERMISSION_BASE_URL}/analyze/user/${userId}`,
      method: 'get'
    });
  },
  
  /**
   * 分析角色权限
   */
  analyzeRolePermissions(roleId: number): Promise<Record<string, unknown>> {
    return request({
      url: `${PERMISSION_BASE_URL}/analyze/role/${roleId}`,
      method: 'get'
    });
  },
  
  /**
   * 分析菜单权限
   */
  analyzeMenuPermissions(menuId: number): Promise<Record<string, unknown>> {
    return request({
      url: `${PERMISSION_BASE_URL}/analyze/menu/${menuId}`,
      method: 'get'
    });
  },
  
  /**
   * 分析按钮权限
   */
  analyzeButtonPermissions(buttonId: number): Promise<Record<string, unknown>> {
    return request({
      url: `${PERMISSION_BASE_URL}/analyze/button/${buttonId}`,
      method: 'get'
    });
  },
  
  // ==================== 权限导出API ====================
  
  /**
   * 导出用户权限
   */
  exportUserPermissions(userId: number, format: 'json' | 'csv' | 'excel' = 'json'): Promise<Blob> {
    return request({
      url: `${PERMISSION_BASE_URL}/export/user/${userId}`,
      method: 'get',
      params: { format },
      responseType: 'blob'
    });
  },
  
  /**
   * 导出角色权限
   */
  exportRolePermissions(roleId: number, format: 'json' | 'csv' | 'excel' = 'json'): Promise<Blob> {
    return request({
      url: `${PERMISSION_BASE_URL}/export/role/${roleId}`,
      method: 'get',
      params: { format },
      responseType: 'blob'
    });
  },
  
  /**
   * 导出菜单权限
   */
  exportMenuPermissions(menuId: number, format: 'json' | 'csv' | 'excel' = 'json'): Promise<Blob> {
    return request({
      url: `${PERMISSION_BASE_URL}/export/menu/${menuId}`,
      method: 'get',
      params: { format },
      responseType: 'blob'
    });
  },
  
  /**
   * 导出按钮权限
   */
  exportButtonPermissions(buttonId: number, format: 'json' | 'csv' | 'excel' = 'json'): Promise<Blob> {
    return request({
      url: `${PERMISSION_BASE_URL}/export/button/${buttonId}`,
      method: 'get',
      params: { format },
      responseType: 'blob'
    });
  }
};
