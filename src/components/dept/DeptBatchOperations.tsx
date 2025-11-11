/**
 * 部门批量操作组件
 */

"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { 
  TrashBinIcon, 
  ArrowUpIcon,
  ArrowDownIcon
} from '@/icons/index';
import { simpleConfirm } from '@/utils/simpleConfirmDialog';

interface DeptBatchOperationsProps {
  selectedCount: number;
  selectedIds: number[];
  onBatchDelete: (ids: number[]) => Promise<void>;
  onBatchEnable: (ids: number[]) => Promise<void>;
  onBatchDisable: (ids: number[]) => Promise<void>;
  onClearSelection: () => void;
  loading?: boolean;
}

const DeptBatchOperations: React.FC<DeptBatchOperationsProps> = ({
  selectedCount,
  selectedIds,
  onBatchDelete,
  onBatchEnable,
  onBatchDisable,
  onClearSelection,
  loading = false
}) => {
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  // 处理批量删除
  const handleBatchDelete = async () => {
    const result = await simpleConfirm.danger(
      `确定要删除选中的 ${selectedCount} 个部门吗？删除后无法恢复！`,
      '确认删除'
    );

    if (result) {
      setOperationLoading('delete');
      try {
        await onBatchDelete(selectedIds);
      } finally {
        setOperationLoading(null);
      }
    }
  };

  // 处理批量启用
  const handleBatchEnable = async () => {
    const result = await simpleConfirm.confirm(
      `确定要启用选中的 ${selectedCount} 个部门吗？`,
      {
        title: '确认启用',
        type: 'info',
        confirmText: '启用',
        cancelText: '取消'
      }
    );

    if (result) {
      setOperationLoading('enable');
      try {
        await onBatchEnable(selectedIds);
      } finally {
        setOperationLoading(null);
      }
    }
  };

  // 处理批量禁用
  const handleBatchDisable = async () => {
    const result = await simpleConfirm.warning(
      `确定要禁用选中的 ${selectedCount} 个部门吗？`,
      '确认禁用'
    );

    if (result) {
      setOperationLoading('disable');
      try {
        await onBatchDisable(selectedIds);
      } finally {
        setOperationLoading(null);
      }
    }
  };

  // 如果没有选中项，不显示组件
  if (selectedCount === 0) {
    return null;
  }

  const isOperationLoading = operationLoading !== null;
  const isDisabled = loading || isOperationLoading;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              已选择
            </span>
            <Badge color="primary" size="sm">
              {selectedCount}
            </Badge>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              个部门
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 批量启用 */}
          <Button
            onClick={handleBatchEnable}
            disabled={isDisabled}
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
          >
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            {operationLoading === 'enable' ? '启用中...' : '批量启用'}
          </Button>

          {/* 批量禁用 */}
          <Button
            onClick={handleBatchDisable}
            disabled={isDisabled}
            variant="outline"
            size="sm"
            className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
          >
            <ArrowDownIcon className="w-4 h-4 mr-1" />
            {operationLoading === 'disable' ? '禁用中...' : '批量禁用'}
          </Button>

          {/* 批量删除 */}
          <Button
            onClick={handleBatchDelete}
            disabled={isDisabled}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <TrashBinIcon className="w-4 h-4 mr-1" />
            {operationLoading === 'delete' ? '删除中...' : '批量删除'}
          </Button>

          {/* 清除选择 */}
          <Button
            onClick={onClearSelection}
            disabled={isDisabled}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            清除选择
          </Button>
        </div>
      </div>

      {/* 加载状态 */}
      {isOperationLoading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          {operationLoading === 'delete' && '正在删除部门...'}
          {operationLoading === 'enable' && '正在启用部门...'}
          {operationLoading === 'disable' && '正在禁用部门...'}
        </div>
      )}
    </div>
  );
};

export default DeptBatchOperations;
