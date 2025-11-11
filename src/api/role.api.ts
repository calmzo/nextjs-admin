import request from '@/utils/request';
import type { PageQuery, PageResult, OptionType } from '@/types/api';

const ROLE_BASE_URL = '/admin/system/roles';

export const RoleAPI = {
  /**
   * 获取角色分页列表
   * @param queryParams 查询参数
   * @returns Promise<PageResult<RolePageVO>>
   */
  getPage(queryParams: RolePageQuery): Promise<PageResult<RolePageVO>> {
    return request({
      url: `${ROLE_BASE_URL}/page`,
      method: 'get',
      params: queryParams,
    });
  },

  /**
   * 获取角色表单详情
   * @param roleId 角色ID
   * @returns Promise<RoleForm>
   */
  getFormData(roleId: number): Promise<RoleForm> {
    return request({
      url: `${ROLE_BASE_URL}/${roleId}/form`,
      method: 'get',
    });
  },

  /**
   * 添加角色
   * @param data 角色表单数据
   * @returns Promise<void>
   */
  create(data: RoleForm): Promise<void> {
    return request({
      url: `${ROLE_BASE_URL}`,
      method: 'post',
      data,
    });
  },

  /**
   * 修改角色
   * @param id 角色ID
   * @param data 角色表单数据
   * @returns Promise<void>
   */
  update(id: number, data: RoleForm): Promise<void> {
    return request({
      url: `${ROLE_BASE_URL}/${id}`,
      method: 'put',
      data,
    });
  },

  /**
   * 批量删除角色
   * @param ids 角色ID数组
   * @returns Promise<void>
   */
  deleteByIds(ids: number[]): Promise<void> {
    return request({
      url: `${ROLE_BASE_URL}/${ids.join(',')}`,
      method: 'delete',
    });
  },

  /**
   * 修改角色状态
   * @param id 角色ID
   * @param status 状态
   * @returns Promise<void>
   */
  updateStatus(id: number, status: number): Promise<void> {
    return request({
      url: `${ROLE_BASE_URL}/${id}/status`,
      method: 'put',
      data: { status },
    });
  },

  /**
   * 获取角色下拉选项
   * @returns Promise<OptionType[]>
   */
  getOptions(): Promise<OptionType[]> {
    return request({
      url: `${ROLE_BASE_URL}/options`,
      method: 'get',
    });
  },

  /**
   * 获取角色已分配的菜单ID列表
   * @param roleId 角色ID
   * @returns Promise<number[]>
   */
  getRoleMenuIds(roleId: number): Promise<number[]> {
    return request({
      url: `${ROLE_BASE_URL}/${roleId}/menuIds`,
      method: 'get',
    });
  },

  /**
   * 更新角色菜单权限
   * @param roleId 角色ID
   * @param menuIds 菜单ID数组
   * @returns Promise<void>
   */
  updateRoleMenus(roleId: number, menuIds: number[]): Promise<void> {
    return request({
      url: `${ROLE_BASE_URL}/${roleId}/menus`,
      method: 'put',
      data: menuIds,
    });
  },
};

export default RoleAPI;

// ==================== 类型定义 ====================

/** 角色分页查询对象 */
export interface RolePageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 角色状态 */
  status?: number;
}

/** 角色分页对象 */
export interface RolePageVO {
  /** 角色ID */
  id: number;
  /** 角色编码 */
  code?: string;
  /** 角色名称 */
  name?: string;
  /** 角色描述 */
  description?: string;
  /** 排序 */
  sort?: number;
  /** 角色状态(1:启用;0:禁用) */
  status?: number;
  /** 用户数量 */
  userCount?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/** 角色表单类型 */
export interface RoleForm {
  /** 角色ID */
  id?: number;
  /** 角色编码 */
  code?: string;
  /** 角色名称 */
  name?: string;
  /** 角色描述 */
  description?: string;
  /** 数据权限 */
  dataScope?: number;
  /** 排序 */
  sort?: number;
  /** 角色状态(1:正常;0:禁用) */
  status?: number;
}

/** 角色状态枚举 */
export enum RoleStatus {
  DISABLED = 0,
  ENABLED = 1,
}

/** 角色状态选项 */
export const ROLE_STATUS_OPTIONS = [
  { label: '禁用', value: RoleStatus.DISABLED, color: 'error' },
  { label: '正常', value: RoleStatus.ENABLED, color: 'success' },
];

