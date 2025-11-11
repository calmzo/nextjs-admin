/**
 * 通知公告管理API接口
 */

import request from '@/utils/request';
import type { PageResponse } from '@/types/api';

const NOTICE_BASE_URL = '/admin/system/notices';

// 通知公告查询参数
export interface NoticeQueryParams {
  title?: string;          // 标题
  publishStatus?: number;  // 发布状态(0-未发布 1-已发布 -1-已撤回)
  pageNum?: number;        // 页码
  pageSize?: number;       // 每页大小
}

// 通知公告表单数据
export interface NoticeFormData {
  id?: string;
  title: string;           // 通知标题
  content: string;         // 通知内容
  type: number;           // 通知类型(1-通知 2-公告)
  level?: string;         // 优先级(L-低 M-中 H-高)
  priority?: number;      // 优先级(0-低 1-中 2-高)
  targetType: number;     // 目标类型(1-全体 2-指定)
  targetUserIds?: string; // 目标ID合集，以,分割
}

// 通知公告分页对象
export interface NoticePageVO {
  id: string;
  title?: string;         // 通知标题
  content?: string;       // 通知内容
  type?: number;         // 通知类型(1-通知 2-公告)
  publisherId?: string;   // 发布人ID
  publisherName?: string; // 发布人
  priority?: number;      // 优先级(0-低 1-中 2-高)
  level?: string;         // 优先级(L-低 M-中 H-高)
  targetType?: number;    // 目标类型(1-全体 2-指定)
  publishStatus?: number; // 发布状态(0-未发布 1-已发布 -1-已撤回)
  publishTime?: string;   // 发布时间
  revokeTime?: string;    // 撤回时间
  createTime?: string;    // 创建时间
  updateTime?: string;    // 更新时间
}

// 通知公告详情对象
export interface NoticeDetailVO {
  id?: string;
  title?: string;
  content?: string;
  type?: number;
  publisherName?: string;
  level?: string;
  publishTime?: string;
  publishStatus?: number;
}

// 通知公告列表响应
export type NoticeListResponse = PageResponse<NoticePageVO>;

/**
 * 通知公告管理API
 */
const NoticeAPI = {
  /**
   * 通知公告分页列表
   * @param queryParams 查询参数
   * @returns 通知公告分页结果
   */
  getPage(queryParams: NoticeQueryParams): Promise<NoticeListResponse> {
    return request({
      url: `${NOTICE_BASE_URL}/page`,
      method: 'get',
      params: queryParams,
    });
  },

  /**
   * 获取通知公告表单数据
   * @param id 通知公告ID
   * @returns 通知公告表单数据
   */
  getFormData(id: string): Promise<NoticeFormData> {
    return request({
      url: `${NOTICE_BASE_URL}/${id}/form`,
      method: 'get',
    });
  },

  /**
   * 获取通知公告详情
   * @param id 通知公告ID
   * @returns 通知公告详情
   */
  getDetail(id: string): Promise<NoticeDetailVO> {
    return request({
      url: `${NOTICE_BASE_URL}/${id}/detail`,
      method: 'get',
    });
  },

  /**
   * 新增通知公告
   * @param data 通知公告表单数据
   */
  create(data: NoticeFormData): Promise<void> {
    return request({
      url: NOTICE_BASE_URL,
      method: 'post',
      data,
    });
  },

  /**
   * 修改通知公告
   * @param id 通知公告ID
   * @param data 通知公告表单数据
   */
  update(id: string, data: NoticeFormData): Promise<void> {
    return request({
      url: `${NOTICE_BASE_URL}/${id}`,
      method: 'put',
      data,
    });
  },

  /**
   * 批量删除通知公告
   * @param ids 通知公告ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string): Promise<void> {
    return request({
      url: `${NOTICE_BASE_URL}/${ids}`,
      method: 'delete',
    });
  },

  /**
   * 发布通知公告
   * @param id 通知公告ID
   */
  publish(id: string): Promise<void> {
    return request({
      url: `${NOTICE_BASE_URL}/${id}/publish`,
      method: 'put',
    });
  },

  /**
   * 撤回通知公告
   * @param id 通知公告ID
   */
  revoke(id: string): Promise<void> {
    return request({
      url: `${NOTICE_BASE_URL}/${id}/revoke`,
      method: 'put',
    });
  },
};

export default NoticeAPI;

