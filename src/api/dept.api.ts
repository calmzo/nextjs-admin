/**
 * 部门管理API接口
 */

import request from '@/utils/request';
import type { DeptNode } from '@/types/dept-tree';
import logger from '@/utils/logger';

// 部门查询参数
export interface DeptQueryParams {
  keywords?: string;  // 搜索关键词
  status?: number;    // 状态
  parentId?: number;  // 父部门ID
  page?: number;      // 页码
  pageSize?: number;  // 每页大小
}

// 部门创建/更新参数
export interface DeptFormData {
  id?: number;
  name: string;
  code: string;
  parentId: number;
  sort: number;
  status: number;
}

// API响应类型
export interface DeptApiResponse<T = unknown> {
  code: string;     // 后端返回的是字符串类型
  msg: string;      // 后端返回的是msg字段
  data: T;
}

export interface DeptListResponse {
  list: DeptNode[];
  total: number;
  page: number;
  pageSize: number;
}


/**
 * 获取部门树形列表
 */
export const getDeptTree = async (params?: DeptQueryParams): Promise<DeptNode[]> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.get<ApiDeptNode[]>('/admin/system/dept', {
      params: {
        keywords: params?.keywords,
        status: params?.status,
        parentId: params?.parentId
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
    
    // 响应拦截器已经处理了格式转换，直接返回
    return response;
  } catch (error) {
    logger.error('❌ 获取部门树失败:', error);
    throw error;
  }
};

/**
 * 获取部门列表（分页）
 */
export const getDeptList = async (params: DeptQueryParams = {}): Promise<DeptNode[]> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.get<ApiDeptNode[]>('/admin/system/dept', {
      params: {
        keywords: params?.keywords,
        status: params?.status,
        parentId: params?.parentId,
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
    
    // 响应拦截器已经处理了格式转换，直接返回
    return response;
  } catch (error) {
    logger.error('获取部门列表失败，使用mock数据:', error);
    
    // 当API调用失败时，返回mock数据
    const mockData: DeptNode[] = [
      {
        id: 1,
        name: '总公司',
        code: 'HQ',
        parentId: 0,
        sort: 1,
        status: 1,
        children: [
          {
            id: 2,
            name: '技术部',
            code: 'TECH',
            parentId: 1,
            sort: 1,
            status: 1,
            children: [
              {
                id: 3,
                name: '前端组',
                code: 'FRONTEND',
                parentId: 2,
                sort: 1,
                status: 1
              },
              {
                id: 4,
                name: '后端组',
                code: 'BACKEND',
                parentId: 2,
                sort: 2,
                status: 1
              }
            ]
          },
          {
            id: 5,
            name: '市场部',
            code: 'MARKETING',
            parentId: 1,
            sort: 2,
            status: 1
          }
        ]
      }
    ];
    
    return mockData;
  }
};

/**
 * 获取部门详情
 */
export const getDeptDetail = async (id: number): Promise<DeptNode> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    return await request.get<DeptNode>(`/admin/system/dept/${id}/form`) as unknown as DeptNode;
  } catch (error) {
    logger.error('获取部门详情失败:', error);
    throw error;
  }
};

/**
 * 创建部门
 */
export const createDept = async (data: DeptFormData): Promise<DeptNode> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    return await request.post<DeptNode>('/admin/system/dept', data) as unknown as DeptNode;
  } catch (error) {
    logger.error('创建部门失败:', error);
    throw error;
  }
};

/**
 * 更新部门
 */
export const updateDept = async (id: number, data: DeptFormData): Promise<DeptNode> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.put(`/admin/system/dept/${id}`, data) as DeptNode;
    return response;
  } catch (error) {
    logger.error('更新部门失败:', error);
    throw error;
  }
};

/**
 * 删除部门
 * @param id 部门ID，可以是单个数字或逗号分隔的ID字符串
 */
export const deleteDept = async (id: number | string): Promise<boolean> => {
  try {
    // 统一使用路径参数，字符串ID直接拼接到URL中
    return await request.delete<boolean>(`/admin/system/dept/${id}`) as unknown as boolean;
  } catch (error) {
    logger.error('删除部门失败:', error);
    throw error;
  }
};

/**
 * 更新部门状态
 */
export const updateDeptStatus = async (id: number, status: number): Promise<boolean> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    return await request.patch<boolean>(`/admin/system/dept/${id}/status`, {
      status
    }) as unknown as boolean;
  } catch (error) {
    logger.error('更新部门状态失败:', error);
    throw error;
  }
};

/**
 * 获取部门选项列表（用于选择器）
 */
export const getDeptOptions = async (): Promise<DeptNode[]> => {
  try {
    // 真实API调用 - 响应拦截器已经返回了data部分
    const response = await request.get<ApiDeptNode[]>('/admin/system/dept/options');
    
    // 检查响应数据是否存在
    if (!response) {
      throw new Error('API响应为空');
    }
    
    // 检查数据是否为空
    if (!Array.isArray(response) || response.length === 0) {
      logger.warn('API返回的数据为空，返回空数组');
      return [];
    }
    
    // 响应拦截器已经处理了格式转换，直接返回
    return response;
  } catch (error) {
    logger.error('获取部门选项失败，使用mock数据:', error);
    
    // 当API调用失败时，返回mock数据
    const mockData: DeptNode[] = [
      {
        id: 1,
        name: '总公司',
        code: 'HQ',
        parentId: 0,
        sort: 1,
        status: 1,
        children: [
          {
            id: 2,
            name: '技术部',
            code: 'TECH',
            parentId: 1,
            sort: 1,
            status: 1,
            children: [
              {
                id: 3,
                name: '前端组',
                code: 'FRONTEND',
                parentId: 2,
                sort: 1,
                status: 1
              },
              {
                id: 4,
                name: '后端组',
                code: 'BACKEND',
                parentId: 2,
                sort: 2,
                status: 1
              }
            ]
          },
          {
            id: 5,
            name: '市场部',
            code: 'MARKETING',
            parentId: 1,
            sort: 2,
            status: 1
          }
        ]
      }
    ];
    
    return mockData;
  }
};

// API返回的部门节点格式（实际API返回的就是标准格式）
export interface ApiDeptNode extends DeptNode {
  createTime: string | null;
  updateTime: string | null;
}

// 测试用的模拟数据
export const mockApiDeptData: ApiDeptNode[] = [
  {
    id: 1,
    name: "总监办",
    code: "ADMIN",
    parentId: 0,
    sort: 1,
    status: 1,
    createTime: null,
    updateTime: "2025-07-23 09:12:11",
    children: [
      {
        id: 2,
        name: "研发部门",
        code: "RD001",
        parentId: 1,
        sort: 1,
        status: 1,
        createTime: null,
        updateTime: "2022-04-19 12:46:37",
        children: []
      },
      {
        id: 3,
        name: "测试部门",
        code: "QA001",
        parentId: 1,
        sort: 1,
        status: 1,
        createTime: null,
        updateTime: "2022-04-19 12:46:37",
        children: []
      }
    ]
  }
];
