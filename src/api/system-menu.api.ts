/**
 * 系统菜单API接口
 * 基于Vue项目的菜单API设计，适配Next.js项目
 */

import request from '@/utils/request';
import type { 
  SystemMenuItem, 
  MenuPermissionCheckRequest, 
  MenuPermissionCheckResult 
} from '@/types/system-menu';

const SYSTEM_MENU_BASE_URL = '/admin/system/menus';

export const SystemMenuAPI = {
  /**
   * 获取系统菜单路由
   * @returns Promise<SystemMenuItem[]>
   */
  getRoutes(): Promise<SystemMenuItem[]> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/routes`,
      method: 'get',
    });
  },

  /**
   * 获取用户菜单权限
   * @param userId 用户ID
   * @returns Promise<SystemMenuItem[]>
   */
  getUserMenus(userId?: number): Promise<SystemMenuItem[]> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/user-menus`,
      method: 'get',
      params: userId ? { userId } : {},
    });
  },

  /**
   * 检查菜单权限
   * @param data 权限检查请求
   * @returns Promise<MenuPermissionCheckResult>
   */
  checkMenuPermission(data: MenuPermissionCheckRequest): Promise<MenuPermissionCheckResult> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/check-permission`,
      method: 'post',
      data,
    });
  },

  /**
   * 获取菜单详情
   * @param menuId 菜单ID
   * @returns Promise<SystemMenuItem>
   */
  getMenuDetail(menuId: number): Promise<SystemMenuItem> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/${menuId}`,
      method: 'get',
    });
  },

  /**
   * 获取菜单树
   * @returns Promise<SystemMenuItem[]>
   */
  getMenuTree(): Promise<SystemMenuItem[]> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/tree`,
      method: 'get',
    });
  },

  /**
   * 创建菜单
   * @param data 菜单数据
   * @returns Promise<SystemMenuItem>
   */
  createMenu(data: Partial<SystemMenuItem>): Promise<SystemMenuItem> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}`,
      method: 'post',
      data,
    });
  },

  /**
   * 更新菜单
   * @param menuId 菜单ID
   * @param data 菜单数据
   * @returns Promise<SystemMenuItem>
   */
  updateMenu(menuId: number, data: Partial<SystemMenuItem>): Promise<SystemMenuItem> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/${menuId}`,
      method: 'put',
      data,
    });
  },

  /**
   * 删除菜单
   * @param menuId 菜单ID
   * @returns Promise<void>
   */
  deleteMenu(menuId: number): Promise<void> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/${menuId}`,
      method: 'delete',
    });
  },

  /**
   * 批量删除菜单
   * @param menuIds 菜单ID数组
   * @returns Promise<void>
   */
  batchDeleteMenus(menuIds: number[]): Promise<void> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/batch-delete`,
      method: 'post',
      data: { menuIds },
    });
  },

  /**
   * 更新菜单排序
   * @param data 排序数据
   * @returns Promise<void>
   */
  updateMenuSort(data: { menuId: number; sortOrder: number }[]): Promise<void> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/sort`,
      method: 'put',
      data,
    });
  },

  /**
   * 获取菜单权限列表
   * @param menuId 菜单ID
   * @returns Promise<string[]>
   */
  getMenuPermissions(menuId: number): Promise<string[]> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/${menuId}/permissions`,
      method: 'get',
    });
  },

  /**
   * 分配菜单权限
   * @param menuId 菜单ID
   * @param permissions 权限列表
   * @returns Promise<void>
   */
  assignMenuPermissions(menuId: number, permissions: string[]): Promise<void> {
    return request({
      url: `${SYSTEM_MENU_BASE_URL}/${menuId}/permissions`,
      method: 'post',
      data: { permissions },
    });
  },
};

export default SystemMenuAPI;
