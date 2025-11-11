/**
 * 操作日志列表组件
 * 使用 GenericList 通用组件
 */

"use client";

import React, { useCallback, useMemo } from 'react';
import { useLogList } from '@/hooks/useLog';
import { LogPageVO } from '@/api/log.api';
import DatePicker from '@/components/form/date-picker';
import flatpickr from 'flatpickr';
import GenericList from '@/components/common/GenericList/GenericList';
import { ColumnDef } from '@/components/common/GenericList/types';
import { ListHookReturn } from '@/components/common/GenericList/types';

type DateOption = flatpickr.Options.DateOption;

interface LogListProps {
  className?: string;
}

/**
 * 适配器：将 useLogList 转换为 GenericList 需要的格式
 */
function useLogListAdapter(): ListHookReturn<LogPageVO> {
  const {
    data,
    loading,
    pagination,
    searchParams,
    fetchLogList,
    updateSearchParams,
    updatePagination,
    resetSearch,
  } = useLogList();

  return useMemo(() => ({
    data,
    loading,
    pagination,
    searchParams: searchParams as Record<string, unknown>,
    fetchList: fetchLogList as (params?: Record<string, unknown>) => Promise<void> | void,
    updateSearchParams: updateSearchParams as (params: Record<string, unknown>) => void,
    updatePagination,
    resetSearch,
  }), [data, loading, pagination, searchParams, fetchLogList, updateSearchParams, updatePagination, resetSearch]);
}

export default function LogList({ 
  className = "", 
}: LogListProps) {
  // 使用适配器 hook 获取状态和方法
  const logListHook = useLogListAdapter();

  // 格式化日期时间
  const formatDateTime = useCallback((dateTime: string): string => {
    if (!dateTime) return '-';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateTime;
    }
  }, []);

  // 格式化执行时间
  const formatExecutionTime = useCallback((ms: number): string => {
    if (ms === undefined || ms === null) return '-';
    return `${ms} ms`;
  }, []);

  // 定义列配置
  const columns: ColumnDef<LogPageVO>[] = useMemo(() => [
    {
      key: 'createTime',
      label: '操作时间',
      width: '180px',
      render: (item) => formatDateTime(item.createTime),
    },
    {
      key: 'operator',
      label: '操作人',
      width: '120px',
      render: (item) => item.operator || '-',
    },
    {
      key: 'module',
      label: '日志模块',
      width: '100px',
      render: (item) => item.module || '-',
    },
    {
      key: 'content',
      label: '日志内容',
      render: (item) => (
        <div className="text-sm text-gray-700 dark:text-gray-400 truncate" title={item.content}>
          {item.content || '-'}
        </div>
      ),
    },
    {
      key: 'ip',
      label: 'IP 地址',
      width: '150px',
      render: (item) => item.ip || '-',
    },
    {
      key: 'region',
      label: '地区',
      width: '150px',
      render: (item) => item.region || '-',
    },
    {
      key: 'browser',
      label: '浏览器 / 终端系统',
      width: '200px',
      render: (item) => (
        <div className="space-y-1">
          <div className="text-sm text-gray-700 dark:text-gray-400">{item.browser || '-'}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.os || '-'}</div>
        </div>
      ),
    },
    {
      key: 'executionTime',
      label: '执行时间(ms)',
      width: '150px',
      render: (item) => formatExecutionTime(item.executionTime),
    },
  ], [formatDateTime, formatExecutionTime]);

  // 配置筛选器：日期选择器
  const filters = useMemo(() => [
    {
      key: 'createTime',
      label: '操作时间',
      type: 'custom' as const,
      render: () => {
        const { searchParams, updateSearchParams, fetchList } = logListHook;
        return (
          <div className="w-72">
            <DatePicker
              id="log-createTime-range"
              mode="range"
              placeholder="操作时间区间"
              onChange={dates => {
                if (!dates || dates.length < 2) {
                  updateSearchParams({ createTime: undefined } as Record<string, unknown>);
                  fetchList({ createTime: undefined } as Record<string, unknown>);
                  return;
                }
                if (Array.isArray(dates)) {
                  const dts = dates.map(d => (typeof d === 'string' ? d : (d && d.toISOString().slice(0,10)))).filter(Boolean);
                  updateSearchParams({ createTime: [dts[0], dts[1]] } as Record<string, unknown>);
                  fetchList({ createTime: [dts[0], dts[1]] } as Record<string, unknown>);
                }
              }}
              defaultDate={searchParams.createTime && Array.isArray(searchParams.createTime) && searchParams.createTime[0] && searchParams.createTime[1]
                ? ([new Date(searchParams.createTime[0] as string), new Date(searchParams.createTime[1] as string)] as unknown as DateOption)
                : undefined}
            />
          </div>
        );
      },
    },
  ], [logListHook]);

  return (
    <GenericList<LogPageVO>
      useListHook={useLogListAdapter}
      title="操作日志"
      description="查看系统操作记录和日志信息"
      columns={columns}
      searchPlaceholder="搜索日志内容..."
      filters={filters}
      getItemId={(item) => item.id}
      enableSelection={false}
      className={className}
    />
  );
}

