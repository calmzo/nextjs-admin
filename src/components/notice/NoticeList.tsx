/**
 * 通知公告列表组件
 * 使用 GenericList 通用组件
 */

"use client";

import React, { useCallback, useMemo, useState, useRef } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@/icons/index';
import { ViewButton, EditButton, DeleteButton } from '@/components/ui/buttons/ActionButtons';
import { simpleConfirm } from '@/utils/simpleConfirmDialog';
import { useNoticeList } from '@/hooks/useNotice';
import { NoticePageVO } from '@/api/notice.api';
import NoticeAPI from '@/api/notice.api';
import GenericList from '@/components/common/GenericList/GenericList';
import { ColumnDef } from '@/components/common/GenericList/types';
import { ListHookReturn } from '@/components/common/GenericList/types';
import { noticeButtonAuth } from '@/utils/permission';
import Badge from '@/components/ui/badge/Badge';
import DictLabel from '@/components/dict/DictLabel';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';

interface NoticeListProps {
  className?: string;
  onView?: (notice: NoticePageVO) => void;
  onAdd?: () => void;
  onEdit?: (notice: NoticePageVO) => void;
  onRefreshRequest?: (refreshFn: () => void) => void;
}

/**
 * 适配器：将 useNoticeList 转换为 GenericList 需要的格式
 */
function useNoticeListAdapter(): ListHookReturn<NoticePageVO> {
  const {
    data,
    loading,
    pagination,
    searchParams,
    fetchNoticeList,
    updateSearchParams,
    updatePagination,
    resetSearch,
  } = useNoticeList();

  // 包装 updatePagination 以匹配 GenericList 的签名
  // 注意：不要在这里调用 fetchNoticeList，让 GenericList 统一处理
  const updatePaginationWrapped = useCallback((page: number, pageSize: number) => {
    updatePagination(page, pageSize);
  }, [updatePagination]);

  // 适配 GenericList 的 keywords 搜索字段到通知公告的 title 字段
  const fetchListAdapted = useCallback((params?: Record<string, unknown>) => {
    const mappedParams = params && 'keywords' in params
      ? { ...params, title: params.keywords as string, keywords: undefined }
      : params;
    return (fetchNoticeList as (p?: Record<string, unknown>) => Promise<void> | void)(mappedParams);
  }, [fetchNoticeList]);

  const updateSearchParamsAdapted = useCallback((params: Record<string, unknown>) => {
    const mapped = 'keywords' in params
      ? { ...params, title: params.keywords as string }
      : params;
    (updateSearchParams as (p: Record<string, unknown>) => void)(mapped);
  }, [updateSearchParams]);

  return useMemo(() => ({
    data,
    loading,
    pagination,
    // 将 title 映射为 keywords，保证默认搜索框展示正确
    searchParams: { ...searchParams, keywords: (searchParams as Record<string, unknown>).title } as Record<string, unknown>,
    fetchList: fetchListAdapted,
    updateSearchParams: updateSearchParamsAdapted,
    updatePagination: updatePaginationWrapped,
    resetSearch,
  }), [data, loading, pagination, searchParams, fetchListAdapted, updateSearchParamsAdapted, updatePaginationWrapped, resetSearch]);
}

/**
 * 列表操作 Hook
 */
function useNoticeListOperations() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(async (ids: (string | number)[]): Promise<boolean> => {
    setLoading(true);
    try {
      const idsString = ids.map(id => String(id)).join(',');
      await NoticeAPI.deleteByIds(idsString);
      toast.success('删除成功');
      return true;
    } catch (error: unknown) {
      handleError(error, { showToast: false });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    remove,
  };
}

export default function NoticeList({ 
  className = "", 
  onView,
  onAdd,
  onEdit,
  onRefreshRequest
}: NoticeListProps) {
  const refreshNoticeListRef = useRef<(() => void) | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // 格式化时间
  const formatTime = useCallback((time?: string): string => {
    if (!time) return '-';
    try {
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return time;
    }
  }, []);

  // 获取目标类型标签
  const getTargetTypeLabel = useCallback((targetType?: number) => {
    return targetType === 1 ? '全体' : targetType === 2 ? '指定' : '-';
  }, []);

  // 获取发布状态标签
  const getPublishStatusLabel = useCallback((status?: number) => {
    switch (status) {
      case 0: return '未发布';
      case 1: return '已发布';
      case -1: return '已撤回';
      default: return '-';
    }
  }, []);

  const getPublishStatusColor = useCallback((status?: number) => {
    switch (status) {
      case 0: return 'light' as const;
      case 1: return 'success' as const;
      case -1: return 'error' as const;
      default: return 'light' as const;
    }
  }, []);

  // 处理发布
  const handlePublish = useCallback(async (notice: NoticePageVO) => {
    if (operationLoading) return;
    const confirmed = await simpleConfirm.danger(
      '确定要发布该通知公告吗？',
      '确认发布'
    );
    if (!confirmed) return;
    
    setOperationLoading(true);
    try {
      await NoticeAPI.publish(notice.id);
      toast.success('发布成功');
      if (refreshNoticeListRef.current) {
        refreshNoticeListRef.current();
      }
    } catch (error: unknown) {
      handleError(error, { showToast: false });
    } finally {
      setOperationLoading(false);
    }
  }, [operationLoading]);

  // 处理撤回
  const handleRevoke = useCallback(async (notice: NoticePageVO) => {
    if (operationLoading) return;
    const confirmed = await simpleConfirm.danger(
      '确定要撤回该通知公告吗？撤回后将不再对外显示。',
      '确认撤回'
    );
    if (!confirmed) return;
    
    setOperationLoading(true);
    try {
      await NoticeAPI.revoke(notice.id);
      toast.success('撤回成功');
      if (refreshNoticeListRef.current) {
        refreshNoticeListRef.current();
      }
    } catch (error: unknown) {
      handleError(error, { showToast: false });
    } finally {
      setOperationLoading(false);
    }
  }, [operationLoading]);

  // 处理删除（单个）
  const handleDelete = useCallback(async (notice: NoticePageVO) => {
    if (operationLoading) return;
    const confirmed = await simpleConfirm.danger(
      '确定要删除该通知公告吗？删除后无法恢复！',
      '确认删除'
    );
    if (!confirmed) return;
    
    setOperationLoading(true);
    try {
      await NoticeAPI.deleteByIds(notice.id);
      toast.success('删除成功');
      if (refreshNoticeListRef.current) {
        refreshNoticeListRef.current();
      }
    } catch (error: unknown) {
      handleError(error, { showToast: false });
    } finally {
      setOperationLoading(false);
    }
  }, [operationLoading]);

  // 由于 GenericList 的 rowActions 不支持函数形式，我们需要使用 renderRow 或自定义列
  // 这里我们添加一个操作列来动态渲染操作按钮
  const renderActions = useCallback((notice: NoticePageVO) => {
  return (
      <div className="flex items-center gap-2">
        {onView && noticeButtonAuth.view() && (
          <ViewButton onClick={() => onView(notice)} />
        )}
        {/* 未发布和已撤回状态：显示发布、编辑、删除按钮 */}
        {(notice.publishStatus === 0 || notice.publishStatus === -1) && (
          <>
            {noticeButtonAuth.publish() && (
              <button
                onClick={() => handlePublish(notice)}
                disabled={operationLoading}
                className="inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="发布"
              >
                <ArrowUpIcon />
                发布
              </button>
            )}
            {onEdit && noticeButtonAuth.edit() && (
              <EditButton onClick={() => onEdit(notice)} />
            )}
            {noticeButtonAuth.delete() && (
              <DeleteButton 
                onClick={() => handleDelete(notice)} 
                disabled={operationLoading}
              />
            )}
          </>
        )}
        {/* 已发布状态：显示撤回按钮 */}
        {notice.publishStatus === 1 && noticeButtonAuth.revoke() && (
          <button
            onClick={() => handleRevoke(notice)}
            disabled={operationLoading}
            className="inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="撤回"
          >
            <ArrowDownIcon />
            撤回
          </button>
        )}
      </div>
    );
  }, [onView, onEdit, handlePublish, handleRevoke, handleDelete, operationLoading]);

  // 定义列配置
  const columns: ColumnDef<NoticePageVO>[] = useMemo(() => [
    {
      key: 'index',
      label: '序号',
      width: '80px',
      render: (item, index, pagination) => {
        if (pagination) {
          const serialNumber = (pagination.current - 1) * pagination.pageSize + index + 1;
          return <span>{serialNumber}</span>;
        }
        return <span>{index + 1}</span>;
      },
    },
    {
      key: 'title',
      label: '通知标题',
      minWidth: '200px',
      render: (item) => (
        <div className="text-sm text-gray-700 dark:text-gray-400 max-w-xs truncate" title={item.title}>
          {item.title || '-'}
        </div>
      ),
    },
    {
      key: 'type',
      label: '通知类型',
      width: '100px',
      render: (item) => (
        <DictLabel code="notice_type" value={item.type} />
      ),
    },
    {
      key: 'publisherName',
      label: '发布人',
      minWidth: '120px',
      render: (item) => item.publisherName || '-',
    },
    {
      key: 'level',
      label: '通知等级',
      width: '100px',
      render: (item) => (
        <DictLabel code="notice_level" value={item.level} />
      ),
    },
    {
      key: 'targetType',
      label: '通告目标类型',
      minWidth: '120px',
      render: (item) => getTargetTypeLabel(item.targetType),
    },
    {
      key: 'publishStatus',
      label: '发布状态',
      width: '100px',
      render: (item) => (
        <Badge color={getPublishStatusColor(item.publishStatus)}>
          {getPublishStatusLabel(item.publishStatus)}
        </Badge>
      ),
    },
    {
      key: 'time',
      label: '操作时间',
      minWidth: '180px',
      render: (item) => (
        <div className="flex flex-col gap-0.5 text-xs">
          {item.createTime && (
            <div className="whitespace-nowrap">
              <span className="text-gray-500 dark:text-gray-500">创建：</span>
              {formatTime(item.createTime)}
            </div>
          )}
          {item.publishTime && (
            <div className="whitespace-nowrap">
              <span className="text-gray-500 dark:text-gray-500">发布：</span>
              {formatTime(item.publishTime)}
            </div>
          )}
          {!item.createTime && !item.publishTime && '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '操作',
      width: '160px',
      render: renderActions,
    },
  ], [formatTime, getTargetTypeLabel, getPublishStatusLabel, getPublishStatusColor, renderActions]);

  // 配置筛选器：发布状态筛选
  const filters = useMemo(() => [
    {
      key: 'publishStatus',
      label: '发布状态',
      type: 'select' as const,
      placeholder: '全部状态',
      options: [
        { label: '未发布', value: 0 },
        { label: '已发布', value: 1 },
        { label: '已撤回', value: -1 },
      ],
      // 不设置 defaultValue，使用 Hook 的初始值（undefined）
      // 变更时只更新搜索参数，触发查询交给“搜索”按钮
    },
  ], []);

  return (
    <GenericList<NoticePageVO>
      useListHook={useNoticeListAdapter}
      useOperationsHook={useNoticeListOperations}
      title="通知公告"
      description="管理系统通知公告信息"
      columns={columns}
      searchPlaceholder="搜索通知标题..."
      searchFields={['title']}
      filters={filters}
      onAdd={onAdd && noticeButtonAuth.add() ? onAdd : undefined}
      permissions={{
        add: noticeButtonAuth.add,
        edit: noticeButtonAuth.edit,
        delete: noticeButtonAuth.delete,
        view: noticeButtonAuth.view,
      }}
      getItemId={(item: NoticePageVO) => item.id}
      onRefreshRequest={(refreshFn: () => void) => {
        refreshNoticeListRef.current = refreshFn;
        if (onRefreshRequest) {
          onRefreshRequest(refreshFn);
        }
      }}
      className={className}
    />
  );
}
