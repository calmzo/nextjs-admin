/**
 * 系统配置管理API接口
 */

import request from '@/utils/request';
import type { PageResponse } from '@/types/api';

const CONFIG_BASE_URL = '/admin/system/config';

// 配置查询参数
export interface ConfigQueryParams {
  keywords?: string;  // 关键字(配置名称/配置键)
  pageNum?: number;   // 页码
  pageSize?: number;  // 每页大小
}

// 配置表单数据
export interface ConfigFormData {
  id?: string;
  configName: string;   // 配置名称
  configKey: string;    // 配置键
  configValue: string;  // 配置值
  remark?: string;      // 描述
}

// 配置分页对象
export interface ConfigPageVO {
  id: string;
  configName: string;   // 配置名称
  configKey: string;    // 配置键
  configValue: string;  // 配置值
  remark?: string;      // 描述
  createTime?: string;
  updateTime?: string;
}

// 配置列表响应
export type ConfigListResponse = PageResponse<ConfigPageVO>;

/**
 * 系统配置管理API
 */
const ConfigAPI = {
  /**
   * 配置分页列表
   * @param queryParams 查询参数
   * @returns 配置分页结果
   */
  getPage(queryParams: ConfigQueryParams): Promise<ConfigListResponse> {
    return request({
      url: `${CONFIG_BASE_URL}/page`,
      method: 'get',
      params: queryParams,
    });
  },

  /**
   * 获取配置表单数据
   * @param id 配置ID
   * @returns 配置表单数据
   */
  getFormData(id: string): Promise<ConfigFormData> {
    return request({
      url: `${CONFIG_BASE_URL}/${id}/form`,
      method: 'get',
    });
  },

  /**
   * 新增配置
   * @param data 配置表单数据
   */
  create(data: ConfigFormData): Promise<void> {
    return request({
      url: CONFIG_BASE_URL,
      method: 'post',
      data,
    });
  },

  /**
   * 修改配置
   * @param id 配置ID
   * @param data 配置表单数据
   */
  update(id: string, data: ConfigFormData): Promise<void> {
    return request({
      url: `${CONFIG_BASE_URL}/${id}`,
      method: 'put',
      data,
    });
  },

  /**
   * 删除配置
   * @param id 配置ID
   */
  deleteById(id: string): Promise<void> {
    return request({
      url: `${CONFIG_BASE_URL}/${id}`,
      method: 'delete',
    });
  },

  /**
   * 刷新缓存
   */
  refreshCache(): Promise<void> {
    return request({
      url: `${CONFIG_BASE_URL}/refresh`,
      method: 'put',
    });
  },
};

export default ConfigAPI;

