/**
 * 角色列表组件
 * 使用 GenericList 通用组件
 */

"use client";

import React, { useCallback, useMemo, useState, useRef } from 'react';
import { LockIcon } from '@/icons/index';
import Button from '@/components/ui/button/Button';
import { useRoleList, useRoleOperations } from '@/hooks/useRole';
import { RolePageVO, RoleStatus, ROLE_STATUS_OPTIONS } from '@/api/role.api';
import GenericList from '@/components/common/GenericList/GenericList';
import { ColumnDef } from '@/components/common/GenericList/types';
import { ListHookReturn } from '@/components/common/GenericList/types';
import { roleButtonAuth } from '@/utils/permission';
import Badge from '@/components/ui/badge/Badge';
import UserTag from '@/components/ui/badge/UserTag';

interface RoleListProps {
  className?: string;
  onEdit?: (role: RolePageVO) => void;
  onView?: (role: RolePageVO) => void;
  onAdd?: () => void;
  onRefreshRequest?: (refreshFn: () => void) => void;
}

/**
 * 适配器：将 useRoleList 转换为 GenericList 需要的格式
 */
function useRoleListAdapter(): ListHookReturn<RolePageVO> {
  const {
    data,
    loading,
    pagination,
    searchParams,
    fetchRoleList,
    updateSearchParams,
    updatePagination: updatePaginationOriginal,
    resetSearch,
  } = useRoleList();

  // 包装 updatePagination 以匹配 GenericList 的签名
  // 注意：不要在这里调用 fetchRoleList，让 GenericList 统一处理
  const updatePagination = useCallback((page: number, pageSize: number) => {
    updatePaginationOriginal({ current: page, pageSize });
  }, [updatePaginationOriginal]);

  return {
    data,
    loading,
    pagination,
    searchParams: searchParams as Record<string, unknown>,
    fetchList: fetchRoleList as (params?: Record<string, unknown>) => Promise<void> | void,
    updateSearchParams: updateSearchParams as (params: Record<string, unknown>) => void,
    updatePagination,
    resetSearch,
  };
}

/**
 * 列表操作 Hook
 */
function useRoleListOperations() {
  const [loading, setLoading] = useState(false);
  const { remove, updateStatus } = useRoleOperations();

  const handleRemove = useCallback(async (ids: (string | number)[]): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await remove(ids as number[]);
      return success;
    } finally {
      setLoading(false);
    }
  }, [remove]);

  return {
    loading,
    remove: handleRemove,
    updateStatus,
  };
}

export default function RoleList({ 
  className = "", 
  onEdit, 
  onView, 
  onAdd,
  onRefreshRequest
}: RoleListProps) {
  // 刷新函数引用
  const refreshRoleListRef = useRef<(() => void) | null>(null);
  
  // 只获取操作 Hook，不获取列表 Hook（避免重复调用）
  const operationsHook = useRoleListOperations();

  // 处理状态切换
  const handleStatusToggle = useCallback(async (role: RolePageVO) => {
    const newStatus = role.status === RoleStatus.ENABLED ? RoleStatus.DISABLED : RoleStatus.ENABLED;
    const success = await operationsHook.updateStatus(role.id, newStatus);
    if (success && refreshRoleListRef.current) {
      refreshRoleListRef.current();
    }
  }, [operationsHook]);

  // 定义列配置
  const columns: ColumnDef<RolePageVO>[] = useMemo(() => [
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
      label: '角色名称',
      minWidth: '150px',
      render: (item) => item.name,
    },
    {
      key: 'code',
      label: '角色编码',
      minWidth: '150px',
      render: (item) => (
        <Badge color="info">{item.code || '-'}</Badge>
      ),
    },
    {
      key: 'status',
      label: '状态',
      width: '100px',
      render: (item) => (
        <span onClick={() => handleStatusToggle(item)} style={{ cursor: 'pointer' }}>
          <UserTag type="status" value={item.status}>
            {item.status === RoleStatus.ENABLED ? '启用' : '禁用'}
          </UserTag>
        </span>
      ),
    },
    {
      key: 'sort',
      label: '排序',
      width: '100px',
      render: (item) => item.sort || '-',
    },
    {
      key: 'createTime',
      label: '创建时间',
      minWidth: '150px',
      render: (item) => item.createTime || '-',
    },
  ], [handleStatusToggle]);

  // 自定义行操作
  const rowActions = useMemo(() => {
    const actions = [];
    
    if (onView && roleButtonAuth.assignPerm()) {
      actions.push({
        key: 'assign',
        label: '分配权限',
        icon: <LockIcon />,
        onClick: (role: RolePageVO) => onView(role),
        className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20',
      });
    }
    
    return actions;
  }, [onView]);

  // 自定义搜索栏（包含状态筛选）
  // 使用 useMemo 稳定依赖项，避免频繁重新创建
  const renderSearchBar = useCallback((hookReturn: ListHookReturn<RolePageVO>) => {
    const { searchParams, updateSearchParams, fetchList, loading, resetSearch } = hookReturn;

    const handleSearchInputChange = (value: string) => {
      updateSearchParams({ keywords: value } as Record<string, unknown>);
    };

    const handleSearchClick = () => {
      fetchList();
    };

    const handleStatusFilter = (value: number | undefined) => {
      updateSearchParams({ status: value } as Record<string, unknown>);
      // 状态变化时自动搜索
      fetchList();
    };

    const handleResetSearch = () => {
      resetSearch();
      fetchList();
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
            placeholder="搜索角色名称、编码..."
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
          {ROLE_STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value.toString()}>
              {option.label}
            </option>
          ))}
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
  }, []); // 依赖项为空，因为所有需要的值都来自参数

  return (
    <GenericList<RolePageVO>
      useListHook={useRoleListAdapter}
      useOperationsHook={useRoleListOperations}
      title="角色列表"
      description="管理系统角色和权限分配"
      columns={columns}
      searchPlaceholder="搜索角色名称、编码..."
      searchFields={['name', 'code']}
      onAdd={onAdd && roleButtonAuth.add() ? onAdd : undefined}
      onEdit={onEdit}
      onView={onView}
      rowActions={rowActions}
      permissions={{
        add: roleButtonAuth.add,
        edit: roleButtonAuth.edit,
        delete: roleButtonAuth.delete,
      }}
      getItemId={(item: RolePageVO) => item.id}
      onRefreshRequest={(refreshFn: () => void) => {
        refreshRoleListRef.current = refreshFn;
        if (onRefreshRequest) {
          onRefreshRequest(refreshFn);
        }
      }}
      renderSearchBar={renderSearchBar}
      className={className}
    />
  );
}
