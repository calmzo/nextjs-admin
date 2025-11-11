/**
 * 字典列表组件
 * 使用 GenericList 通用组件
 */

"use client";

import React, { useCallback, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import DictAPI, { DictQueryParams, DictPageVO } from '@/api/dict.api';
import GenericList from '@/components/common/GenericList/GenericList';
import { ColumnDef } from '@/components/common/GenericList/types';
import { ListHookReturn } from '@/components/common/GenericList/types';
import { dictButtonAuth } from '@/utils/permission';
import Badge from '@/components/ui/badge/Badge';
import UserTag from '@/components/ui/badge/UserTag';
import { handleError } from '@/utils/error-handler';

interface DictListProps {
  className?: string;
  onEdit?: (dict: DictPageVO) => void;
  onView?: (dict: DictPageVO) => void;
  onAdd?: () => void;
  onRefreshRequest?: (refreshFn: () => void) => void;
}

/**
 * 适配器：将 DictList 的状态管理转换为 GenericList 需要的格式
 */
function useDictListAdapter(): ListHookReturn<DictPageVO> {
  const [data, setData] = useState<DictPageVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<DictQueryParams>({
    keywords: '',
    status: undefined,
    pageNum: 1,
    pageSize: 10,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchList = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const queryParams: DictQueryParams = {
        ...searchParams,
        ...(params as DictQueryParams),
        pageNum: (params?.pageNum as number) || searchParams.pageNum || 1,
        pageSize: (params?.pageSize as number) || searchParams.pageSize || 10,
      };
      const response = await DictAPI.getPage(queryParams);
      setData(response.list || []);
      setPagination({
        current: queryParams.pageNum || 1,
        pageSize: queryParams.pageSize || 10,
        total: response.total || 0,
      });
      // 更新 searchParams 以保持同步
      setSearchParams(queryParams);
    } catch (error) {
      handleError(error, { showToast: false });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const updateSearchParams = useCallback((params: Record<string, unknown>) => {
    setSearchParams(prev => ({
      ...prev,
      ...(params as Partial<DictQueryParams>),
      pageNum: 1, // 重置到第一页
    }));
  }, []);

  // 包装 updatePagination 以匹配 GenericList 的签名
  // 注意：不要在这里调用 fetchList，让 GenericList 统一处理
  const updatePagination = useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  }, []);

  const resetSearch = useCallback(() => {
    setSearchParams({
      keywords: '',
      status: undefined,
      pageNum: 1,
      pageSize: 10,
    });
  }, []);

  // 注意：不要在适配器中初始化加载，让 GenericList 统一处理
  // GenericList 会在需要时调用 fetchList

  return useMemo(() => ({
    data,
    loading,
    pagination,
    searchParams: searchParams as Record<string, unknown>,
    fetchList,
    updateSearchParams,
    updatePagination,
    resetSearch,
  }), [data, loading, pagination, searchParams, fetchList, updateSearchParams, updatePagination, resetSearch]);
}

/**
 * 列表操作 Hook
 */
function useDictListOperations() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(async (ids: (string | number)[]): Promise<boolean> => {
    setLoading(true);
    try {
      const idsString = ids.join(',');
      await DictAPI.deleteByIds(idsString);
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

export default function DictList({ 
  className = "", 
  onEdit, 
  onView: _onView, // eslint-disable-line @typescript-eslint/no-unused-vars
  onAdd,
  onRefreshRequest
}: DictListProps) {
  const router = useRouter();
  const refreshDictListRef = useRef<(() => void) | null>(null);
  
  // 使用适配器 hook 获取状态和方法
  const dictListHook = useDictListAdapter();

  // 处理查看字典数据（跳转到字典项管理页面）
  const handleViewDictItems = useCallback((dict: DictPageVO) => {
    router.push(`/system/dict-item?dictCode=${dict.dictCode}&dictName=${encodeURIComponent(dict.name)}`);
  }, [router]);

  // 定义列配置
  const columns: ColumnDef<DictPageVO>[] = useMemo(() => [
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
      key: 'name',
      label: '字典名称',
      minWidth: '150px',
      render: (item) => item.name,
    },
    {
      key: 'dictCode',
      label: '字典编码',
      minWidth: '150px',
      render: (item) => (
        <Badge color="info">{item.dictCode || '-'}</Badge>
      ),
    },
    {
      key: 'status',
      label: '状态',
      width: '100px',
      render: (item) => (
        <UserTag type="status" value={item.status}>
          {item.status === 1 ? '启用' : '禁用'}
        </UserTag>
      ),
    },
  ], []);

  // 自定义行操作
  const rowActions = useMemo(() => {
    const actions = [];
    
    if (dictButtonAuth.search()) {
      actions.push({
        key: 'viewItems',
        label: '字典数据',
        onClick: handleViewDictItems,
        className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20',
      });
    }
    
    return actions;
  }, [handleViewDictItems]);

  // 自定义搜索栏（包含状态筛选）
  const renderSearchBar = useCallback(() => {
    const { searchParams, updateSearchParams, fetchList, loading, resetSearch } = dictListHook;

    const handleSearchInputChange = (value: string) => {
      updateSearchParams({ keywords: value } as Record<string, unknown>);
    };

    const handleSearchClick = () => {
      fetchList();
    };

    const handleStatusFilter = (value: number | undefined) => {
      updateSearchParams({ status: value } as Record<string, unknown>);
    };

    const handleResetSearch = () => {
      resetSearch();
      setTimeout(() => {
        fetchList();
      }, 0);
    };

    return (
      <div className="flex gap-2 sm:items-center sm:justify-end w-full sm:w-auto flex-wrap">
        <div className="relative flex-1 sm:flex-auto sm:w-[300px]">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04199 9.37336937363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                fill=""
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="搜索字典名称、编码..."
            className="shadow-sm focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            value={(searchParams.keywords as string) || ''}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchClick();
              }
            }}
          />
        </div>

        <select
          className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 w-32"
          value={(searchParams.status as number)?.toString() || ''}
          onChange={(e) => handleStatusFilter(e.target.value ? parseInt(e.target.value) : undefined)}
        >
          <option value="">全部</option>
          <option value="1">启用</option>
          <option value="0">禁用</option>
        </select>

        <Button 
          onClick={handleSearchClick} 
          disabled={loading}
          className="bg-brand-500 hover:bg-brand-600 text-white"
        >
          搜索
        </Button>
        <Button variant="outline" onClick={handleResetSearch} disabled={loading}>
          重置
        </Button>
      </div>
    );
  }, [dictListHook]);

  return (
    <GenericList<DictPageVO>
      useListHook={useDictListAdapter}
      useOperationsHook={useDictListOperations}
      title="字典管理"
      description="管理系统字典数据和字典项"
      columns={columns}
      searchPlaceholder="搜索字典名称、编码..."
      searchFields={['name', 'dictCode']}
      onAdd={onAdd && dictButtonAuth.add() ? onAdd : undefined}
      onEdit={onEdit}
      rowActions={rowActions}
      permissions={{
        add: dictButtonAuth.add,
        edit: dictButtonAuth.edit,
        delete: dictButtonAuth.delete,
      }}
      getItemId={(item: DictPageVO) => item.id}
      onRefreshRequest={(refreshFn: () => void) => {
        refreshDictListRef.current = refreshFn;
        if (onRefreshRequest) {
          onRefreshRequest(refreshFn);
        }
      }}
      renderSearchBar={renderSearchBar}
      className={className}
    />
  );
}
