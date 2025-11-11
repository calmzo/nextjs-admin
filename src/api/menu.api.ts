/**
 * 菜单管理API接口
 */

import request from '@/utils/request';
import type { MenuNode, MenuNodeOption } from '@/types/menu-tree';
import { convertMenuNodeOptionsToMenuNodes } from '@/types/menu-tree';
import logger from '@/utils/logger';

// 菜单查询参数
export interface MenuQueryParams {
  keywords?: string;  // 搜索关键词
  status?: number;    // 状态
  parentId?: number;  // 父菜单ID
  type?: number;      // 菜单类型
  page?: number;      // 页码
  pageSize?: number;  // 每页大小
}

// 菜单创建/更新参数
export interface MenuFormData {
  id?: number;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  type: number; // 1: 目录, 2: 菜单, 3: 按钮
  parentId: number;
  sort: number;
  status: number;
  visible: number; // 1: 显示, 0: 隐藏
  perm?: string; // 权限标识
}

// API响应类型
export interface MenuApiResponse<T = unknown> {
  code: string;
  msg: string;
  data: T;
}

export interface MenuListResponse {
  list: MenuNode[];
  total: number;
  page: number;
  pageSize: number;
}

// 后端返回的原始菜单节点格式
interface RawMenuNode {
  id: number;
  name?: string;
  path?: string;
  routePath?: string;
  routeName?: string;
  component?: string;
  icon?: string;
  type?: number | string;
  parentId?: number;
  sort?: number;
  status?: number;
  visible?: number;
  perm?: string;
  createTime?: string | null;
  updateTime?: string | null;
  children?: RawMenuNode[];
}

/**
 * 转换图标名称
 * 将 el-icon- 前缀转换为小写的 SVG 图标名称
 * 例如: el-icon-User -> user
 */
const transformIconName = (icon?: string): string => {
  if (!icon) {
    return '';
  }
  
  // 如果以 el-icon- 开头，去掉前缀并转为小写
  if (icon.toLowerCase().startsWith('el-icon-')) {
    return icon.replace(/^el-icon-/i, '').toLowerCase();
  }
  
  // 其他情况直接返回（已经是 SVG 图标名称）
  return icon;
};

/**
 * 转换后端菜单数据到 MenuNode 格式
 */
const transformMenuNode = (node: RawMenuNode): MenuNode => {
  // 处理路由路径：优先使用 routePath，如果没有则使用 path
  const routePath = node.routePath || node.path || '';
  
  // 处理图标：转换 el-icon- 前缀为小写 SVG 图标名称
  const transformedIcon = transformIconName(node.icon);
  
  return {
    id: node.id,
    name: node.name || '',
    path: routePath, // 兼容旧字段
    routeName: node.routeName || '',
    routePath: node.routePath || routePath,
    component: node.component || '',
    icon: transformedIcon,
    type: node.type || 1, // 保持原始类型（字符串或数字）
    parentId: node.parentId || 0,
    sort: node.sort || 0,
    status: node.status !== undefined ? node.status : 1,
    visible: node.visible !== undefined ? node.visible : 1,
    perm: node.perm || '',
    createTime: node.createTime || null,
    updateTime: node.updateTime || null,
    children: node.children && node.children.length > 0 
      ? node.children.map((child: RawMenuNode) => transformMenuNode(child))
      : undefined
  };
};

/**
 * 获取菜单树形列表
 */
export const getMenuTree = async (params?: MenuQueryParams): Promise<MenuNode[]> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.get<RawMenuNode[]>('/admin/system/menus', {
      params: {
        keywords: params?.keywords,
        status: params?.status,
        parentId: params?.parentId,
        type: params?.type
      }
    });
    
    // 检查响应数据是否存在
    if (!response) {
      throw new Error('API响应为空');
    }
    
    // 检查数据是否为空
    if (!Array.isArray(response) || response.length === 0) {
      logger.warn('API返回的数据为空，返回空数组');
      return [];
    }
    
    // 转换数据格式
    const transformedData = response.map(node => transformMenuNode(node));
    return transformedData;
  } catch (error) {
    logger.error('❌ 获取菜单树失败:', error);
    throw error;
  }
};

/**
 * 获取菜单列表（分页）
 */
export const getMenuList = async (params: MenuQueryParams = {}): Promise<MenuNode[]> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.get<RawMenuNode[]>('/admin/system/menus', {
      params: {
        keywords: params?.keywords,
        status: params?.status,
        parentId: params?.parentId,
        type: params?.type,
        page: params?.page,
        pageSize: params?.pageSize
      }
    });
    
    // 检查响应数据是否存在
    if (!response) {
      throw new Error('API响应数据为空');
    }
    
    // 检查数据是否为空
    if (!Array.isArray(response) || response.length === 0) {
      logger.warn('API返回的数据为空，返回空数组');
      return [];
    }
    
    // 转换数据格式
    const transformedData = response.map(node => transformMenuNode(node));
    return transformedData;
  } catch (error) {
    logger.error('获取菜单列表失败:', error);
    throw error;
  }
};

/**
 * 获取菜单详情
 */
export const getMenuDetail = async (id: number): Promise<MenuNode> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.get<RawMenuNode>(`/admin/system/menus/${id}`) as unknown as RawMenuNode;
    return transformMenuNode(response);
  } catch (error) {
    logger.error('获取菜单详情失败:', error);
    throw error;
  }
};

/**
 * 创建菜单
 */
export const createMenu = async (data: MenuFormData): Promise<MenuNode> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.post<RawMenuNode>('/admin/system/menus', data) as unknown as RawMenuNode;
    return transformMenuNode(response);
  } catch (error) {
    logger.error('创建菜单失败:', error);
    throw error;
  }
};

/**
 * 更新菜单
 */
export const updateMenu = async (id: number, data: MenuFormData): Promise<MenuNode> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.put<RawMenuNode>(`/admin/system/menus/${id}`, data) as unknown as RawMenuNode;
    return transformMenuNode(response);
  } catch (error) {
    logger.error('更新菜单失败:', error);
    throw error;
  }
};

/**
 * 删除菜单
 * @param id 菜单ID，可以是单个数字或逗号分隔的ID字符串
 */
export const deleteMenu = async (id: number | string): Promise<boolean> => {
  try {
    // 统一使用路径参数，字符串ID直接拼接到URL中
    return await request.delete<boolean>(`/admin/system/menus/${id}`) as unknown as boolean;
  } catch (error) {
    logger.error('删除菜单失败:', error);
    throw error;
  }
};

/**
 * 更新菜单状态
 */
export const updateMenuStatus = async (id: number, status: number): Promise<boolean> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    return await request.patch<boolean>(`/admin/system/menus/${id}/status`, {
      status
    }) as unknown as boolean;
  } catch (error) {
    logger.error('更新菜单状态失败:', error);
    throw error;
  }
};

/**
 * 获取菜单选项列表（用于选择器）
 * API返回格式：{value, label, children}[]
 */
export const getMenuOptions = async (): Promise<MenuNode[]> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.get<MenuNodeOption[]>('/admin/system/menus/options');
    
    // 检查响应数据是否存在
    if (!response) {
      throw new Error('API响应为空');
    }
    
    // 检查数据是否为空
    if (!Array.isArray(response) || response.length === 0) {
      logger.warn('API返回的数据为空，返回空数组');
      return [];
    }
    
    // 转换数据格式：将 {value, label, children} 格式转换为 MenuNodeOption 格式（添加 parentId）
    // 然后转换为 MenuNode 格式
    interface RawMenuOption {
      value: number;
      label: string;
      children?: RawMenuOption[];
    }
    const addParentIds = (nodes: RawMenuOption[], parentId: number = 0): MenuNodeOption[] => {
      return nodes.map(node => ({
        value: node.value,
        label: node.label,
        parentId: parentId,
        children: node.children && node.children.length > 0 
          ? addParentIds(node.children, node.value)
          : undefined
      }));
    };
    
    // 添加 parentId 后转换为 MenuNode[]
    const nodesWithParentId = addParentIds(response);
    const transformedData = convertMenuNodeOptionsToMenuNodes(nodesWithParentId);
    return transformedData;
  } catch (error) {
    logger.error('获取菜单选项失败:', error);
    throw error;
  }
};

// API返回的菜单节点格式（实际API返回的就是标准格式）
export interface ApiMenuNode extends MenuNode {
  createTime: string | null;
  updateTime: string | null;
}

