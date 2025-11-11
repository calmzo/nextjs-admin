import request from '@/utils/request';
import type { PageQuery, PageResult } from '@/types/api';

const LOG_BASE_URL = '/admin/system/logs';

export const LogAPI = {
  /**
   * 获取日志分页列表
   * @param queryParams 查询参数
   * @returns Promise<PageResult<LogPageVO>>
   */
  getPage(queryParams: LogPageQuery): Promise<PageResult<LogPageVO>> {
    return request({
      url: `${LOG_BASE_URL}/page`,
      method: 'get',
      params: queryParams,
    });
  },

  /**
   * 获取访问统计
   * @returns Promise<VisitStatsVO>
   */
  getVisitStats(): Promise<VisitStatsVO> {
    return request({
      url: `${LOG_BASE_URL}/visit-stats`,
      method: 'get',
    });
  },

  /**
   * 获取访问趋势
   * @param queryParams 查询参数
   * @returns Promise<VisitTrendVO>
   */
  getVisitTrend(queryParams: VisitTrendQuery): Promise<VisitTrendVO> {
    return request({
      url: `${LOG_BASE_URL}/visit-trend`,
      method: 'get',
      params: queryParams,
    });
  },
};

/**
 * 日志分页查询对象
 */
export interface LogPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 操作时间范围 [开始时间, 结束时间] */
  createTime?: [string, string];
}

/**
 * 系统日志分页VO
 */
export interface LogPageVO {
  /** 主键 */
  id: string;
  /** 操作时间 */
  createTime: string;
  /** 操作人 */
  operator: string;
  /** 日志模块 */
  module: string;
  /** 日志内容 */
  content: string;
  /** IP 地址 */
  ip: string;
  /** 地区 */
  region: string;
  /** 浏览器 */
  browser: string;
  /** 终端系统 */
  os: string;
  /** 执行时间(毫秒) */
  executionTime: number;
}

/**
 * 访问统计VO
 */
export interface VisitStatsVO {
  /** 今日访客数 */
  todayUvCount: number;
  /** 总访客数 */
  totalUvCount: number;
  /** 访客增长率 */
  uvGrowthRate: string;
  /** 今日浏览量 */
  todayPvCount: number;
  /** 总浏览量 */
  totalPvCount: number;
  /** 浏览量增长率 */
  pvGrowthRate: string;
}

/**
 * 访问趋势VO
 */
export interface VisitTrendVO {
  /** 日期列表 */
  dates: string[];
  /** 浏览量(PV) */
  pvList: number[];
  /** 访客数(UV) */
  uvList: number[];
  /** IP数 */
  ipList: number[];
}

/**
 * 访问趋势查询参数
 */
export interface VisitTrendQuery {
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
}

