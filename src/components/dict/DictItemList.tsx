/**
 * 字典项列表组件
 * 参考字典列表的设计
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import UserTag from '@/components/ui/badge/UserTag';
import DictAPI, { DictItemQueryParams, DictItemPageVO } from '@/api/dict.api';
import { removeDictCache } from '@/hooks/useDict';
import { dictItemButtonAuth } from '@/utils/permission';
import { handleError } from '@/utils/error-handler';
import { GenericList } from '@/components/common/GenericList';
import type { ColumnDef, ListHookReturn } from '@/components/common/GenericList';
import Badge from '@/components/ui/badge/Badge';

interface DictItemListProps {
  dictCode: string;  // 字典编码
  dictName?: string; // 字典名称（用于显示）
  className?: string;
  onEdit?: (item: DictItemPageVO) => void;
  onAdd?: () => void;
  onRefreshRequest?: (refreshFn: () => void) => void;
}

export default function DictItemList({ 
  dictCode,
  dictName,
  className = "", 
  onEdit, 
  onAdd,
  onRefreshRequest,
}: DictItemListProps) {
  // 使用 ref 存储 dictCode，避免在 useCallback 依赖中引用外部作用域的值
  const dictCodeRef = useRef(dictCode);
  // 使用版本号跟踪 dictCode 的变化，用于触发数据重新获取
  const [dictCodeVersion, setDictCodeVersion] = useState(0);
  useEffect(() => {
    dictCodeRef.current = dictCode;
    setDictCodeVersion(prev => prev + 1);
  }, [dictCode]);

  // ==================== 适配器：useListHook ====================
  function useDictItemListAdapter(): ListHookReturn<DictItemPageVO> {
    const [data, setData] = useState<DictItemPageVO[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchParams, setSearchParams] = useState<DictItemQueryParams>({
      keywords: '',
      status: undefined,
      pageNum: 1,
      pageSize: 10,
    });
    const searchParamsRef = useRef(searchParams);
    useEffect(() => {
      searchParamsRef.current = searchParams;
    }, [searchParams]);

    const fetchList = useCallback(async (params?: Record<string, unknown>) => {
      const currentDictCode = dictCodeRef.current;
      if (!currentDictCode) return;
      setLoading(true);
      try {
        // 优先使用传入的参数，否则使用 ref 中的最新 searchParams
        const queryParams = (params as DictItemQueryParams) || searchParamsRef.current;
        const response = await DictAPI.getDictItemPage(currentDictCode, queryParams);
        setData(response.list || []);
        setPagination({
          current: queryParams.pageNum || 1,
          pageSize: queryParams.pageSize || 10,
          total: response.total || 0,
        });
      } catch (error) {
        handleError(error, { showToast: false });
        setData([]);
      } finally {
        setLoading(false);
      }
    }, []);

    const updateSearchParamsWrapped = useCallback((params: Record<string, unknown>) => {
      setSearchParams(prev => ({ ...prev, ...(params as Partial<DictItemQueryParams>) }));
    }, []);

    const updatePagination = useCallback((page: number, pageSize: number) => {
      setSearchParams(prev => ({ ...prev, pageNum: page, pageSize }));
    }, []);

    const resetSearch = useCallback(() => {
      setSearchParams(prev => ({ 
        keywords: '', 
        status: undefined, 
        pageNum: 1, 
        pageSize: prev.pageSize 
      }));
    }, []);

    // 初次加载或参数变化自动拉取
    useEffect(() => {
      fetchList();
    }, [fetchList, searchParams.pageNum, searchParams.pageSize, searchParams.keywords, searchParams.status]);

    // 当 dictCode 变化时，重置并重新获取数据
    // 使用版本号作为依赖，避免直接依赖外部作用域的值
    useEffect(() => {
      if (dictCodeRef.current) {
        setSearchParams(prev => ({ ...prev, pageNum: 1 }));
        fetchList();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dictCodeVersion, fetchList]);

    return {
      data,
      loading,
      pagination,
      searchParams: searchParams as unknown as Record<string, unknown>,
      fetchList,
      updateSearchParams: updateSearchParamsWrapped,
      updatePagination,
      resetSearch,
    };
  }

  // ==================== 操作 Hook（删除/批量删除） ====================
  function useDictItemOperations() {
    const [loading, setLoading] = useState(false);
    const handleRemove = useCallback(async (ids: (string | number)[]): Promise<boolean> => {
      const currentDictCode = dictCodeRef.current;
      if (!currentDictCode) return false;
      setLoading(true);
      try {
        const idsString = ids.join(',');
        await DictAPI.deleteDictItemByIds(currentDictCode, idsString);
        removeDictCache(currentDictCode);
        return true;
      } catch (error) {
        handleError(error, { showToast: false });
        return false;
      } finally {
        setLoading(false);
      }
    }, []);

    return {
      loading,
      remove: handleRemove,
    };
  }

  // ==================== 列定义 ====================
  const columns: ColumnDef<DictItemPageVO>[] = useMemo(() => [
    {
      key: 'label',
      label: '字典项标签',
      minWidth: '150px',
      render: (item) => item.label,
    },
    {
      key: 'value',
      label: '字典项值',
      minWidth: '150px',
      render: (item) => <Badge color="info">{item.value || '-'}</Badge>,
    },
    {
      key: 'sort',
      label: '排序',
      width: '100px',
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-400">{item.sort}</span>,
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

  // 使用 GenericList 内置搜索和工具栏（通过 filters 配置）

  return (
    <GenericList<DictItemPageVO>
      useListHook={useDictItemListAdapter}
      useOperationsHook={useDictItemOperations}
      title={dictName ? `${dictName}字典数据` : '字典项管理'}
      description="管理字典的具体项数据"
      columns={columns}
      searchPlaceholder="搜索字典项标签、值..."
      searchFields={['label', 'value']}
      filters={[
          {
            key: 'status',
            label: '状态',
            type: 'select',
            options: [
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 },
            ],
          },
        ]}
      onAdd={onAdd && dictItemButtonAuth.add() ? onAdd : undefined}
      onEdit={onEdit}
      permissions={{
        add: dictItemButtonAuth.add,
        edit: dictItemButtonAuth.edit,
        delete: dictItemButtonAuth.delete,
      }}
      getItemId={(item: DictItemPageVO) => item.id}
      onRefreshRequest={onRefreshRequest}
      className={className}
    />
  );
}

