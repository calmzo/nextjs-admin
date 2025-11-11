"use client";

import React, { ReactNode, useMemo } from 'react';
import PaginationAdvanced from './PaginationAdvanced';

export interface Column<T = unknown> {
  key: string;
  label: string;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableFourProps<T = unknown> {
  // 数据相关
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyText?: string;

  // 分页相关
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;

  // UI 相关
  title?: string;
  description?: string;
  className?: string;
  headerActions?: ReactNode;
  searchBar?: ReactNode;
}

// TableRow 组件 - 使用 React.memo 优化性能
interface TableRowProps<T = unknown> {
  record: T;
  index: number;
  columns: Column<T>[];
}

function TableRowComponent<T>({ record, index, columns }: TableRowProps<T>) {
  const cells = useMemo(() => {
    return columns.map((column) => {
      const value = (record as Record<string, unknown>)[column.key];
      return (
        <td
          key={column.key}
          className={`px-5 h-[60px] text-sm text-gray-800 dark:text-white/90 align-middle ${
            column.align === 'center' ? 'text-center' : ''
          } ${column.align === 'right' ? 'text-right' : ''}`}
        >
          {column.render
            ? column.render(value, record, index)
            : value !== null && value !== undefined
              ? String(value)
              : '-'}
        </td>
      );
    });
  }, [record, index, columns]);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
      {cells}
    </tr>
  );
}

const TableRow = React.memo(TableRowComponent, (prevProps, nextProps) => {
  // 自定义比较函数
  if (prevProps.index !== nextProps.index) return false;
  if (prevProps.columns.length !== nextProps.columns.length) return false;
  
  // 简单比较：如果 record 是对象，比较引用；如果是基本类型，比较值
  return prevProps.record === nextProps.record;
}) as typeof TableRowComponent;

(TableRow as typeof TableRowComponent & { displayName: string }).displayName = 'TableRow';

export default function DataTableFour<T = unknown>({
  data,
  columns,
  loading = false,
  emptyText = '暂无数据',
  pagination,
  onPaginationChange,
  title,
  description,
  className = '',
  headerActions,
  searchBar,
}: DataTableFourProps<T>) {
  const showPagination = pagination && onPaginationChange;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* 页面头部 */}
      {(title || description || headerActions || searchBar) && (
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          {(title || description) && (
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
              )}
            </div>
          )}

          {/* 搜索栏和操作按钮 */}
          {(searchBar || headerActions) && (
            <div className="flex gap-2 sm:items-center sm:justify-end w-full sm:w-auto flex-wrap">
              {searchBar}
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* 数据表格 */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">加载中...</div>
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">{emptyText}</div>
          </div>
        )}
        {!loading && data.length > 0 && (
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 h-[60px] text-left text-xs font-medium text-gray-500 whitespace-nowrap dark:text-gray-400 align-middle ${
                      column.align === 'center' ? 'text-center' : ''
                    } ${column.align === 'right' ? 'text-right' : ''}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {data.map((record, index) => (
                <TableRow
                  key={index}
                  record={record}
                  index={index}
                  columns={columns}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      {!loading && data.length > 0 && showPagination && (
        <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <div className="pb-3 sm:pb-0">
            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
              显示{' '}
              <span className="text-gray-800 dark:text-white/90">
                {Math.min(
                  (pagination.current - 1) * pagination.pageSize + 1,
                  pagination.total
                )}
              </span>{' '}
              到{' '}
              <span className="text-gray-800 dark:text-white/90">
                {Math.min(pagination.current * pagination.pageSize, pagination.total)}
              </span>{' '}
              共{' '}
              <span className="text-gray-800 dark:text-white/90">
                {pagination.total}
              </span>{' '}
              条记录
            </span>
          </div>
          <PaginationAdvanced
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={onPaginationChange}
          />
        </div>
      )}
    </div>
  );
}

