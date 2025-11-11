/**
 * 字典管理API接口
 */

import request from '@/utils/request';
import type { PageResponse } from '@/types/api';

const DICT_BASE_URL = '/admin/system/dicts';

// 字典查询参数
export interface DictQueryParams {
  keywords?: string;  // 关键字(字典名称/编码)
  status?: number;    // 字典状态（1:启用，0:禁用）
  pageNum?: number;   // 页码
  pageSize?: number;  // 每页大小
}

// 字典表单数据
export interface DictFormData {
  id?: string;
  name: string;       // 字典名称
  dictCode: string;   // 字典编码
  status: number;     // 字典状态（1-启用，0-禁用）
  remark?: string;    // 备注
}

// 字典分页对象
export interface DictPageVO {
  id: string;
  name: string;
  dictCode: string;
  status: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

// 字典列表响应
export type DictListResponse = PageResponse<DictPageVO>;

// 字典项查询参数
export interface DictItemQueryParams {
  keywords?: string;  // 关键字(字典项标签/值)
  status?: number;    // 字典项状态（1:启用，0:禁用）
  pageNum?: number;   // 页码
  pageSize?: number;  // 每页大小
}

// 字典项表单数据
export interface DictItemFormData {
  id?: string;
  label: string;      // 字典项标签
  value: string;      // 字典项值
  sort: number;       // 排序
  status: number;     // 字典项状态（1-启用，0-禁用）
  tagType?: 'success' | 'warning' | 'info' | 'primary' | 'danger' | '';  // 标签类型
  remark?: string;    // 备注
}

// 字典项分页对象
export interface DictItemPageVO {
  id: string;
  label: string;      // 字典项标签
  value: string;      // 字典项值
  sort: number;       // 排序
  status: number;     // 字典项状态
  tagType?: 'success' | 'warning' | 'info' | 'primary' | 'danger' | '';  // 标签类型
  remark?: string;    // 备注
  createTime?: string;
  updateTime?: string;
}

// 字典项列表响应
export type DictItemListResponse = PageResponse<DictItemPageVO>;

/**
 * 字典管理API
 */
const DictAPI = {
  /**
   * 字典分页列表
   * @param queryParams 查询参数
   * @returns 字典分页结果
   */
  getPage(queryParams: DictQueryParams): Promise<DictListResponse> {
    return request({
      url: `${DICT_BASE_URL}/page`,
      method: 'get',
      params: queryParams,
    });
  },

  /**
   * 字典列表（不分页）
   * @returns 字典列表
   */
  getList(): Promise<DictPageVO[]> {
    return request({
      url: DICT_BASE_URL,
      method: 'get',
    });
  },

  /**
   * 获取字典表单数据
   * @param id 字典ID
   * @returns 字典表单数据
   */
  getFormData(id: string): Promise<DictFormData> {
    return request({
      url: `${DICT_BASE_URL}/${id}/form`,
      method: 'get',
    });
  },

  /**
   * 新增字典
   * @param data 字典表单数据
   */
  create(data: DictFormData): Promise<void> {
    return request({
      url: DICT_BASE_URL,
      method: 'post',
      data,
    });
  },

  /**
   * 修改字典
   * @param id 字典ID
   * @param data 字典表单数据
   */
  update(id: string, data: DictFormData): Promise<void> {
    return request({
      url: `${DICT_BASE_URL}/${id}`,
      method: 'put',
      data,
    });
  },

  /**
   * 删除字典
   * @param ids 字典ID，多个以英文逗号(,)分隔
   */
  deleteByIds(ids: string): Promise<void> {
    return request({
      url: `${DICT_BASE_URL}/${ids}`,
      method: 'delete',
    });
  },

  //---------------------------------------------------
  // 字典项相关接口
  //---------------------------------------------------

  /**
   * 获取字典项分页列表
   * @param dictCode 字典编码
   * @param queryParams 查询参数
   * @returns 字典项分页结果
   */
  getDictItemPage(dictCode: string, queryParams: DictItemQueryParams): Promise<DictItemListResponse> {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items/page`,
      method: 'get',
      params: queryParams,
    });
  },

  /**
   * 获取字典项列表（不分页，用于下拉选择等场景）
   * @param dictCode 字典编码
   * @returns 字典项列表
   */
  getDictItems(dictCode: string): Promise<DictItemPageVO[]> {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: 'get',
    });
  },

  /**
   * 获取字典项表单数据
   * @param dictCode 字典编码
   * @param id 字典项ID
   * @returns 字典项表单数据
   */
  getDictItemFormData(dictCode: string, id: string): Promise<DictItemFormData> {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}/form`,
      method: 'get',
    });
  },

  /**
   * 新增字典项
   * @param dictCode 字典编码
   * @param data 字典项表单数据
   */
  createDictItem(dictCode: string, data: DictItemFormData): Promise<void> {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: 'post',
      data: {
        ...data,
        dictCode,
      },
    });
  },

  /**
   * 修改字典项
   * @param dictCode 字典编码
   * @param id 字典项ID
   * @param data 字典项表单数据
   */
  updateDictItem(dictCode: string, id: string, data: DictItemFormData): Promise<void> {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}`,
      method: 'put',
      data: {
        ...data,
        dictCode,
        id,
      },
    });
  },

  /**
   * 删除字典项
   * @param dictCode 字典编码
   * @param ids 字典项ID，多个以英文逗号(,)分隔
   */
  deleteDictItemByIds(dictCode: string, ids: string): Promise<void> {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items/${ids}`,
      method: 'delete',
    });
  },
};

export default DictAPI;

