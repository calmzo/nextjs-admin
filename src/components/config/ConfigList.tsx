/**
 * 系统配置列表组件
 * 使用 GenericList 和 ConfigFormModal 通用组件
 */

"use client";

import React, { useCallback, useMemo, useState, useRef } from 'react';
import { RefreshIcon } from '@/icons/index';
import Button from '@/components/ui/button/Button';
import { useConfigList } from '@/hooks/useConfig';
import { ConfigPageVO } from '@/api/config.api';
import ConfigAPI from '@/api/config.api';
import GenericList from '@/components/common/GenericList/GenericList';
import ConfigFormModal from './ConfigFormModal';
import { ColumnDef } from '@/components/common/GenericList/types';
import { ListHookReturn } from '@/components/common/GenericList/types';
import { configButtonAuth } from '@/utils/permission';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';

interface ConfigListProps {
  className?: string;
}

/**
 * 适配器：将 useConfigList 转换为 GenericList 需要的格式
 */
function useConfigListAdapter(): ListHookReturn<ConfigPageVO> {
  const {
    data,
    loading,
    pagination,
    searchParams,
    fetchConfigList,
    updateSearchParams,
    updatePagination,
    resetSearch,
  } = useConfigList();

  // 使用 useMemo 稳定返回对象，但只依赖实际会变化的值
  // 函数引用通过 useCallback 已经稳定，不需要作为依赖
  return useMemo(() => ({
    data,
    loading,
    pagination,
    searchParams: searchParams as Record<string, unknown>,
    fetchList: fetchConfigList as (params?: Record<string, unknown>) => Promise<void> | void,
    updateSearchParams: updateSearchParams as (params: Record<string, unknown>) => void,
    updatePagination,
    resetSearch,
  }), [data, loading, pagination, searchParams, fetchConfigList, updateSearchParams, updatePagination, resetSearch]);
}

/**
 * 列表操作 Hook
 */
function useConfigListOperations() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(async (ids: (string | number)[]): Promise<boolean> => {
    setLoading(true);
    try {
      await Promise.all(ids.map(id => ConfigAPI.deleteById(String(id))));
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

export default function ConfigList({ 
  className = "", 
}: ConfigListProps) {
  // 状态管理
  const [formVisible, setFormVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ConfigPageVO | null>(null);
  const [refreshCacheLoading, setRefreshCacheLoading] = useState(false);
  
  // 刷新函数引用
  const refreshConfigListRef = useRef<(() => void) | null>(null);
  
  // 使用适配器 hook 获取状态和方法
  const configListHook = useConfigListAdapter();

  // 定义列配置
  const columns: ColumnDef<ConfigPageVO>[] = useMemo(() => [
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
      key: 'configName',
      label: '配置名称',
      render: (item) => item.configName,
    },
    {
      key: 'configKey',
      label: '配置键',
      render: (item) => (
        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
          {item.configKey}
        </code>
      ),
    },
    {
      key: 'configValue',
      label: '配置值',
      render: (item) => (
        <div className="text-sm text-gray-700 dark:text-gray-400 max-w-xs truncate" title={item.configValue}>
          {item.configValue}
        </div>
      ),
    },
    {
      key: 'remark',
      label: '备注',
      render: (item) => (
        <div className="text-sm text-gray-700 dark:text-gray-400 max-w-xs truncate" title={item.remark || ''}>
          {item.remark || '-'}
        </div>
      ),
    },
  ], []);

  // 处理新增配置
  const handleAdd = useCallback(() => {
    setCurrentConfig(null);
    setFormVisible(true);
  }, []);

  // 处理编辑配置
  const handleEdit = useCallback((config: ConfigPageVO) => {
    setCurrentConfig(config);
    setFormVisible(true);
  }, []);

  // 处理刷新缓存
  const handleRefreshCache = useCallback(async () => {
    if (refreshCacheLoading) return;
    setRefreshCacheLoading(true);
    try {
      await ConfigAPI.refreshCache();
      toast.success('缓存刷新成功');
    } catch (error: unknown) {
      handleError(error, { showToast: false });
    } finally {
      setRefreshCacheLoading(false);
    }
  }, [refreshCacheLoading]);

  // 自定义工具栏，添加刷新缓存按钮
  const renderActionBar = useCallback(() => {
    const handleRefresh = () => {
      if (refreshConfigListRef.current) {
        refreshConfigListRef.current();
      }
    };
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          {configButtonAuth.add() && (
            <Button onClick={handleAdd}>
              新增
            </Button>
          )}
          {configButtonAuth.refresh() && (
            <Button
              variant="outline"
              onClick={handleRefreshCache}
              disabled={refreshCacheLoading}
            >
              <RefreshIcon />
              刷新缓存
            </Button>
          )}
        </div>
        <div className="flex gap-3 ml-auto">
          <Button variant="outline" onClick={handleRefresh} disabled={configListHook.loading}>
            <RefreshIcon />
            刷新
          </Button>
        </div>
      </div>
    );
  }, [handleAdd, handleRefreshCache, refreshCacheLoading, configListHook.loading]);

  return (
    <>
      <GenericList<ConfigPageVO>
        useListHook={useConfigListAdapter}
        useOperationsHook={useConfigListOperations}
        title="系统配置管理"
        description="管理系统配置信息"
        columns={columns}
        searchPlaceholder="搜索配置名称或配置键..."
        searchFields={['configName', 'configKey']}
        onAdd={configButtonAuth.add() ? handleAdd : undefined}
        onEdit={handleEdit}
        permissions={{
          add: configButtonAuth.add,
          edit: configButtonAuth.edit,
          delete: configButtonAuth.delete,
        }}
        getItemId={(item: ConfigPageVO) => item.id}
        onRefreshRequest={(refreshFn: () => void) => {
          refreshConfigListRef.current = refreshFn;
        }}
        renderActionBar={renderActionBar}
        className={className}
      />

      {/* 配置表单弹窗 - 使用 ConfigFormModal */}
      <ConfigFormModal
        visible={formVisible}
        config={currentConfig}
        onClose={() => {
          setFormVisible(false);
          setCurrentConfig(null);
        }}
        onSuccess={() => {
          // 刷新配置列表
          if (refreshConfigListRef.current) {
            refreshConfigListRef.current();
          }
        }}
      />
    </>
  );
}
