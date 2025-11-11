/**
 * 用户列表组件
 */

"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { 
  DownloadIcon,
  ExportIcon,
} from '@/icons/index';
import { useUserList, useUserOperations, useUserImportExport } from '@/hooks/useUser';
import { useDeptOptions } from '@/hooks/useDept';
import DeptTreeSelector from '@/components/ui/tree/DeptTreeSelector';
import { UserPageVO, UserStatus } from '@/api/user.api';
import { useModal } from '@/hooks/useModal';
import { userButtonAuth } from '@/utils/permission';
import UserImportModal from './UserImportModal';
import ResetPasswordModal from './ResetPasswordModal';
import UserTag from '@/components/ui/badge/UserTag';
import DictLabel from '@/components/dict/DictLabel';
import { GenericList } from '@/components/common/GenericList';
import type { ColumnDef, ListHookReturn } from '@/components/common/GenericList';

// 适配器：useListHook
function useUserListAdapter(): ListHookReturn<UserPageVO> {
  const {
    data,
    loading,
    pagination,
    searchParams,
    fetchUserList,
    updateSearchParams,
    updatePagination,
    resetSearch,
  } = useUserList();

  const updatePaginationWrapped = useCallback((page: number, pageSize: number) => {
    updatePagination({ current: page, pageSize });
  }, [updatePagination]);

  return {
    data,
    loading,
    pagination,
    searchParams: searchParams as unknown as Record<string, unknown>,
    fetchList: fetchUserList as (params?: Record<string, unknown>) => Promise<void> | void,
    updateSearchParams: updateSearchParams as (params: Record<string, unknown>) => void,
    updatePagination: updatePaginationWrapped,
    resetSearch,
  };
}

// 列表操作 Hook
function useUserListOperations() {
  const { remove, updateStatus } = useUserOperations();
  const [loading, setLoading] = useState(false);

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


interface UserListProps {
  className?: string;
  onEdit?: (user: UserPageVO) => void;
  onView?: (user: UserPageVO) => void;
  onAdd?: () => void;
  onRefreshRequest?: (refreshFn: () => void) => void;
}

export default function UserList({ 
  className = "", 
  onEdit, 
  onView, 
  onAdd,
  onRefreshRequest
}: UserListProps) {
  const { isOpen: isImportOpen, openModal: openImportModal, closeModal: closeImportModal } = useModal();
  const { isOpen: isResetPasswordOpen, openModal: openResetPasswordModal, closeModal: closeResetPasswordModal } = useModal();
  const [resetPasswordUser, setResetPasswordUser] = useState<UserPageVO | null>(null);

  const {
    exportUsers,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    importUsers,
  } = useUserImportExport();

  // 部门树数据
  const { options: deptOptions, loading: deptOptionsLoading, fetchOptions: fetchDeptOptions } = useDeptOptions();
  const deptOptionsInitializedRef = useRef(false);
  useEffect(() => {
    if (!deptOptionsInitializedRef.current) {
      deptOptionsInitializedRef.current = true;
      fetchDeptOptions();
    }
    // 注意：fetchDeptOptions 是稳定的（空依赖），不需要放在依赖数组中
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResetPassword = useCallback((user: UserPageVO) => {
    if (!user.id) return;
    setResetPasswordUser(user);
    openResetPasswordModal();
  }, [openResetPasswordModal]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResetPasswordSuccess = useCallback(() => {}, []);

  // 处理关闭重置密码弹窗
  const handleCloseResetPassword = useCallback(() => {
    setResetPasswordUser(null);
    closeResetPasswordModal();
  }, [closeResetPasswordModal]);

  // 列定义
  const columns: ColumnDef<UserPageVO>[] = useMemo(() => [
    {
      key: 'username',
      label: '用户名',
      minWidth: '150px',
      render: (item) => <span className="text-sm font-medium text-gray-700 dark:text-gray-400">{item.username}</span>,
    },
    {
      key: 'nickname',
      label: '昵称',
      minWidth: '150px',
      render: (item) => <span className="text-sm text-gray-500 dark:text-gray-400">{item.nickname}</span>,
    },
    {
      key: 'gender',
      label: '性别',
      width: '100px',
      render: (item) => (item.gender !== undefined && item.gender !== null
        ? <DictLabel code="gender" value={item.gender} />
        : <span className="text-gray-400">-</span>),
    },
    {
      key: 'deptName',
      label: '部门',
      minWidth: '120px',
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-400">{item.deptName || '-'}</span>,
    },
    {
      key: 'mobile',
      label: '手机号码',
      minWidth: '120px',
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-400">{item.mobile || '-'}</span>,
    },
    {
      key: 'email',
      label: '邮箱',
      minWidth: '160px',
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-400">{item.email || '-'}</span>,
    },
    {
      key: 'status',
      label: '状态',
      width: '80px',
      render: (item) => (
        <UserTag type="status" value={item.status}>
          {item.status === UserStatus.ENABLED ? '启用' : '禁用'}
        </UserTag>
      ),
    },
    {
      key: 'createTime',
      label: '创建时间',
      minWidth: '150px',
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-400">{item.createTime || '-'}</span>,
    },
  ], []);

  // 共享的列表 Hook（让左侧部门筛选与右侧列表使用同一份状态）
  const sharedListHook = useUserListAdapter();
  const fetchListRef = useRef(sharedListHook.fetchList);
  useEffect(() => {
    fetchListRef.current = sharedListHook.fetchList;
  }, [sharedListHook.fetchList]);

  const deptFilterDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerDeptFilterFetch = useCallback((params: Record<string, unknown>) => {
    if (deptFilterDebounceTimerRef.current) {
      clearTimeout(deptFilterDebounceTimerRef.current);
    }
    deptFilterDebounceTimerRef.current = setTimeout(() => {
      fetchListRef.current?.(params);
    }, 250);
  }, []);

  useEffect(() => {
    return () => {
      if (deptFilterDebounceTimerRef.current) {
        clearTimeout(deptFilterDebounceTimerRef.current);
      }
    };
  }, []);
  
  // 通过批量操作扩展导入/导出（不依赖选中项）

  const refreshRef = useRef<(() => void) | null>(null);

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* 左侧：部门筛选侧栏（占据整个列表区域左侧） */}
      <div className="hidden md:block w-52 min-w-[12rem] self-stretch">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-4 py-3">
          <h3 className="text-xs font-normal text-gray-700 dark:text-gray-400 mb-3">部门筛选</h3>
          <DeptTreeSelector
            data={deptOptions}
            value={sharedListHook.searchParams.deptId as number | undefined}
            onChange={(v) => {
              const deptId = typeof v === 'number' ? v : Array.isArray(v) && v.length > 0 ? v[0] : undefined;
              const nextParams = { deptId } as Record<string, unknown>;
              sharedListHook.updateSearchParams(nextParams);
              // 采用去抖策略避免快速频繁切换部门时触发多次请求，仅保留最后一次选择
              triggerDeptFilterFetch(nextParams);
            }}
            placeholder="选择部门"
            loading={deptOptionsLoading}
            allowClear
            showSearch
            hideCode
          />
        </div>
      </div>

      {/* 右侧：用户列表卡片 */}
      <div className="flex-1 min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <GenericList<UserPageVO>
        useListHook={() => sharedListHook}
        useOperationsHook={useUserListOperations}
        title="用户列表"
        description="管理系统用户账号和权限信息"
        columns={columns}
        searchPlaceholder="搜索用户名、昵称、邮箱..."
        searchFields={['username', 'nickname', 'email']}
        filters={[
          {
            key: 'status',
            label: '用户状态',
            type: 'select',
            options: [
              { label: '启用', value: UserStatus.ENABLED },
              { label: '禁用', value: UserStatus.DISABLED },
            ],
          },
          {
            key: 'createTime',
            label: '创建时间',
            type: 'dateRange',
          },
        ]}
        onAdd={onAdd && userButtonAuth.add() ? onAdd : undefined}
        onEdit={onEdit}
        onView={onView}
        permissions={{
          add: userButtonAuth.add,
          edit: userButtonAuth.edit,
          delete: userButtonAuth.delete,
          view: userButtonAuth.view,
        }}
        batchOperations={[
          {
            key: 'import',
            label: '导入',
            icon: <DownloadIcon />,
            onClick: () => openImportModal(),
            permission: userButtonAuth.import,
          },
          {
            key: 'export',
            label: '导出',
            icon: <ExportIcon />,
            onClick: () => exportUsers({}),
            permission: userButtonAuth.export,
          },
        ]}
        getItemId={(item: UserPageVO) => item.id}
        onRefreshRequest={(refreshFn: () => void) => {
          refreshRef.current = refreshFn;
          if (onRefreshRequest) onRefreshRequest(refreshFn);
        }}
        className={className}
        />

        {/* 批量操作条已并入工具栏，避免重复 */}

        {/* 导入模态框 */}
        <UserImportModal
          visible={isImportOpen}
          onClose={closeImportModal}
          onSuccess={() => {
            if (refreshRef.current) refreshRef.current();
          }}
        />

        {/* 重置密码模态框 */}
        <ResetPasswordModal
          visible={isResetPasswordOpen}
          onClose={handleCloseResetPassword}
          user={resetPasswordUser && resetPasswordUser.username ? {
            id: resetPasswordUser.id,
            username: resetPasswordUser.username,
            nickname: resetPasswordUser.nickname,
          } : undefined}
          onSuccess={() => {
            if (refreshRef.current) refreshRef.current();
          }}
        />
      </div>
    </div>
  );
}
