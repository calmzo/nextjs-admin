/**
 * 通用列表组件
 * 提供统一的列表页面功能：搜索、筛选、分页、选择、操作等
 */

"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PlusIcon, RefreshIcon, SearchIcon } from '@/icons/index';
import { simpleConfirm } from '@/utils/simpleConfirmDialog';
import Button from '@/components/ui/button/Button';
import { EditButton, DeleteButton } from '@/components/ui/buttons/ActionButtons';
import PaginationAdvanced from '@/components/tables/DataTables/TableFour/PaginationAdvanced';
import Select from '@/components/form/Select';
import { GenericListProps } from './types';

/**
 * 通用列表组件
 */
export default function GenericList<T extends { id?: string | number }>({
  useListHook,
  useOperationsHook,
  title,
  description,
  columns,
  searchPlaceholder = '搜索...',
  filters = [],
  onSearch,
  searchAutoOnChange = false,
  searchDebounceMs = 300,
  onAdd,
  onEdit,
  onView,
  onDelete,
  batchOperations = [],
  rowActions = [],
  permissions,
  renderRow,
  renderSearchBar,
  renderActionBar,
  renderEmpty,
  className = '',
  enableSelection = true,
  enablePagination = true,
  onRefreshRequest,
  getItemId,
  tableClassName = '',
  searchBarClassName = '',
  actionBarClassName = '',
}: GenericListProps<T>) {
  // 状态管理
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
  const [operationLoading, setOperationLoading] = useState(false);

  // Hooks
  const {
    data,
    loading,
    pagination,
    searchParams,
    fetchList,
    updateSearchParams,
    updatePagination,
    resetSearch,
  } = useListHook();

  const operationsHook = useOperationsHook?.();
  const operationsLoading = operationsHook?.loading || false;

  // 初始化数据加载（只在首次渲染时调用一次）
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  // 暴露刷新函数给父组件
  const handleRefreshRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    handleRefreshRef.current = handleRefresh;
  }, [handleRefresh]);

  useEffect(() => {
    if (onRefreshRequest) {
      onRefreshRequest(() => {
        if (handleRefreshRef.current) {
          handleRefreshRef.current();
        }
      });
    }
  }, [onRefreshRequest]);

  // 使用 ref 保存搜索关键词的最新值，避免 state 更新延迟导致的问题
  const searchKeywordsRef = useRef<string>('');
  useEffect(() => {
    searchKeywordsRef.current = (searchParams.keywords as string) || '';
  }, [searchParams.keywords]);

  // 用于在自动搜索时，引用最新的 fetchList 函数
  const fetchListRef = useRef(fetchList);
  useEffect(() => {
    fetchListRef.current = fetchList;
  }, [fetchList]);

  // 搜索去抖定时器
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerDebouncedSearch = useCallback(() => {
    if (!searchAutoOnChange) return;
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }
    searchDebounceTimerRef.current = setTimeout(() => {
      // 自动搜索时固定跳到第一页，使用最新的 keywords
      fetchListRef.current({
        ...searchParams,
        keywords: searchKeywordsRef.current,
        pageNum: 1,
      });
    }, Math.max(0, searchDebounceMs || 0));
  }, [searchAutoOnChange, searchDebounceMs, searchParams]);

  // 卸载时清理定时器
  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  // 处理搜索输入变化
  const handleSearchInputChange = useCallback((value: string) => {
    searchKeywordsRef.current = value; // 立即更新 ref
    updateSearchParams({ keywords: value });
    // 可选的自动搜索（去抖）
    if (searchAutoOnChange) {
      triggerDebouncedSearch();
    }
  }, [updateSearchParams, searchAutoOnChange, triggerDebouncedSearch]);

  // 处理搜索按钮点击
  const handleSearchClick = useCallback(() => {
    if (onSearch) {
      onSearch(searchKeywordsRef.current || '');
    } else {
      // 搜索时重置到第一页，使用 ref 中的最新值，确保使用最新的搜索条件
      fetchList({ 
        ...searchParams,
        keywords: searchKeywordsRef.current,
        pageNum: 1 
      });
    }
  }, [onSearch, searchParams, fetchList]);


  // 处理分页变化
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    updatePagination(page, pageSize);
    // 直接传入新的分页参数，避免使用旧的 state
    fetchList({ pageNum: page, pageSize });
  }, [updatePagination, fetchList]);

  // 处理选择变化
  const handleItemSelectChange = useCallback((itemId: string | number, checked: boolean) => {
    setSelectedItems(prev => {
      if (checked) {
        return [...prev, itemId];
      } else {
        return prev.filter(id => id !== itemId);
      }
    });
  }, []);

  // 处理全选
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(data.map(item => getItemId(item)));
    } else {
      setSelectedItems([]);
    }
  }, [data, getItemId]);

  // 处理删除
  const handleDelete = useCallback(async (item: T) => {
    if (operationLoading || operationsLoading) return;
    
    const itemId = getItemId(item);
    const itemName = (item as { name?: string; username?: string; title?: string }).name 
      || (item as { name?: string; username?: string; title?: string }).username
      || (item as { name?: string; username?: string; title?: string }).title
      || '该项';

    const confirmed = await simpleConfirm.danger(
      `确定要删除 "${itemName}" 吗？删除后无法恢复！`,
      '确认删除'
    );
    if (!confirmed) return;

    setOperationLoading(true);
    try {
      if (onDelete) {
        await onDelete(item);
      } else if (operationsHook?.remove) {
        const success = await operationsHook.remove([itemId]);
        if (success) {
          fetchList();
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setOperationLoading(false);
    }
  }, [operationLoading, operationsLoading, getItemId, onDelete, operationsHook, fetchList]);

  // 处理批量删除
  const handleBatchDelete = useCallback(async () => {
    if (operationLoading || operationsLoading || selectedItems.length === 0) return;
    
    const confirmed = await simpleConfirm.danger(
      `确定要删除选中的 ${selectedItems.length} 项吗？删除后无法恢复！`,
      '确认删除'
    );
    if (!confirmed) return;

    setOperationLoading(true);
    try {
      if (operationsHook?.remove) {
        const success = await operationsHook.remove(selectedItems);
        if (success) {
          setSelectedItems([]);
          fetchList();
        }
      }
    } catch (error) {
      console.error('Batch delete error:', error);
    } finally {
      setOperationLoading(false);
    }
  }, [operationLoading, operationsLoading, selectedItems, operationsHook, fetchList]);


  // 渲染单元格内容，自动为字符串/数字包裹样式
  const renderCellContent = useCallback((content: React.ReactNode): React.ReactNode => {
    // 如果是字符串或数字，自动包裹样式
    if (typeof content === 'string' || typeof content === 'number') {
      return (
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {content || '-'}
        </span>
      );
    }
    // 如果是 null 或 undefined，返回默认值
    if (content == null) {
      return (
        <span className="text-sm text-gray-700 dark:text-gray-400">
          -
        </span>
      );
    }
    // 其他情况（React 元素）直接返回
    return content;
  }, []);

  // 默认行渲染
  const defaultRenderRow = useCallback((item: T, index: number) => {
    const itemId = getItemId(item);
    const isSelected = selectedItems.includes(itemId);

    return (
      <tr
        key={itemId}
        className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
      >
        {enableSelection && (
          <td className="w-14 px-5 py-4 whitespace-nowrap">
            <label className="cursor-pointer text-sm font-medium text-gray-700 select-none dark:text-gray-400">
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                onChange={(e) => handleItemSelectChange(itemId, e.target.checked)}
              />
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${
                  isSelected
                    ? "border-brand-500 bg-brand-500"
                    : "bg-transparent border-gray-300 dark:border-gray-700"
                }`}
              >
                <span className={isSelected ? "" : "opacity-0"}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="white"
                      strokeWidth="1.6666"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </label>
          </td>
        )}
        {columns.map((column) => (
          <td
            key={column.key}
            className={`px-5 py-4 whitespace-nowrap ${column.className || ''} ${column.minWidth ? `min-w-[${column.minWidth}]` : ''} ${column.width ? `w-[${column.width}]` : ''}`}
          >
            {column.render ? (
              renderCellContent(column.render(item, index, pagination))
            ) : (
              <span className="text-sm text-gray-700 dark:text-gray-400">
                {(item as Record<string, unknown>)[column.key] as string || '-'}
              </span>
            )}
          </td>
        ))}
        {(() => {
          const actions = Array.isArray(rowActions) ? rowActions : (rowActions ? rowActions(item, index) : []);
          return (onEdit || onView || onDelete || operationsHook?.remove || actions.length > 0);
        })() && (
          <td className="px-5 py-4 whitespace-nowrap w-[220px] min-w-[220px] sticky right-0 z-30 bg-white border-l border-gray-200 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-1">
              {onView && (!permissions?.view || permissions.view(item)) && (
                <button
                  onClick={() => onView(item)}
                  className="inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                  title="查看"
                >
                  查看
                </button>
              )}
              {onEdit && (!permissions?.edit || permissions.edit(item)) && (
                <EditButton onClick={() => onEdit(item)} />
              )}
              {(onDelete || operationsHook?.remove) && (!permissions?.delete || permissions.delete(item)) && (
                <DeleteButton
                  onClick={() => handleDelete(item)}
                  className={operationLoading || operationsLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                />
              )}
              {(Array.isArray(rowActions) ? rowActions : (rowActions ? rowActions(item, index) : [])).map((action) => {
                if (action.permission && !action.permission(item)) return null;
                return (
                  <button
                    key={action.key}
                    onClick={() => action.onClick(item)}
                    className={`inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs rounded-md transition-colors duration-200 ${action.className || ''}`}
                    title={action.label}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                );
              })}
            </div>
          </td>
        )}
      </tr>
    );
  }, [
    enableSelection,
    selectedItems,
    columns,
    onEdit,
    onView,
    onDelete,
    rowActions,
    permissions,
    operationLoading,
    operationsLoading,
    handleItemSelectChange,
    handleDelete,
    getItemId,
    operationsHook?.remove,
    pagination,
    renderCellContent,
  ]);

  // 默认搜索栏
  const defaultSearchBar = (
    <div className={`flex gap-2 sm:items-center sm:justify-end w-full sm:w-auto ${searchBarClassName}`}>
      <div className="relative flex-1 sm:flex-auto">
        <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <SearchIcon className="w-5 h-5" />
        </span>
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="shadow-sm focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none sm:w-[300px] sm:min-w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          value={(searchParams.keywords as string) || ''}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearchClick();
            }
          }}
        />
      </div>
      {filters.map((filter) => {
        if (filter.type === 'select' && filter.options) {
          return (
            <Select
              key={filter.key}
              placeholder={filter.placeholder || filter.label}
              className="w-32"
              defaultValue={filter.defaultValue?.toString() || ''}
              onChange={(value) => {
                const filterValue = value ? (filter.options?.find(opt => opt.value.toString() === value)?.value) : undefined;
                updateSearchParams({ [filter.key]: filterValue });
                if (filter.onChange) {
                  filter.onChange(filterValue);
                }
              }}
              options={[
                { label: '全部', value: '' },
                ...filter.options.map(opt => ({
                  label: opt.label,
                  value: opt.value.toString(),
                })),
              ]}
            />
          );
        }
        if (filter.type === 'dateRange') {
          return (
            <div key={filter.key} className="flex items-center gap-2">
              <input
                type="date"
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                onChange={(e) => {
                  const start = e.target.value || undefined;
                  const current = (searchParams[filter.key] as unknown as string[] | undefined) || [undefined, undefined];
                  updateSearchParams({ [filter.key]: [start, current?.[1]] });
                  filter.onChange?.([start, current?.[1]]);
                }}
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="date"
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                onChange={(e) => {
                  const end = e.target.value || undefined;
                  const current = (searchParams[filter.key] as unknown as string[] | undefined) || [undefined, undefined];
                  updateSearchParams({ [filter.key]: [current?.[0], end] });
                  filter.onChange?.([current?.[0], end]);
                }}
              />
            </div>
          );
        }
        if (filter.type === 'custom' && filter.render) {
          return (
            <React.Fragment key={filter.key}>
              {filter.render({
                searchParams,
                updateSearchParams,
                fetchList,
                resetSearch,
                loading,
              })}
            </React.Fragment>
          );
        }
        return null;
      })}
      <Button 
        onClick={handleSearchClick} 
        disabled={loading}
        className="bg-brand-500 hover:bg-brand-600 text-white"
      >
        <SearchIcon />
        搜索
      </Button>
      <Button variant="outline" onClick={handleRefresh} disabled={loading}>
        <RefreshIcon />
        刷新
      </Button>
    </div>
  );

  // 默认操作栏
  const defaultActionBar = (
    <div className={`flex items-center gap-3 ${actionBarClassName}`}>
      {/* 左侧：新增 + 已选择计数 + 批量删除 */}
      <div className="flex items-center gap-3">
        {onAdd && (!permissions?.add || permissions.add()) && (
          <Button onClick={onAdd}>
            <PlusIcon />
            新增
          </Button>
        )}
        {enableSelection && operationsHook?.remove && (!permissions?.delete || (() => {
          const deletePerm = permissions?.delete;
          return deletePerm ? deletePerm(undefined as unknown as T) : true;
        })()) && (
          <>
            <Button
              variant="outline"
              onClick={handleBatchDelete}
              disabled={selectedItems.length === 0 || operationLoading || operationsLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              批量删除
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              已选择 <span className="font-medium text-gray-800 dark:text-white">{selectedItems.length}</span> 项
            </div>
          </>
        )}
        {batchOperations.map((operation) => {
          if (operation.permission && !operation.permission()) return null;
          return (
            <Button
              key={operation.key}
              variant="outline"
              onClick={() => operation.onClick(selectedItems)}
              disabled={selectedItems.length === 0 || operationLoading || operationsLoading}
              className={operation.variant === 'danger' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}
            >
              {operation.icon}
              {operation.label}
            </Button>
          );
        })}
      </div>
    </div>
  );

  const allSelected = data.length > 0 && selectedItems.length === data.length;

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      {/* 页面头部 */}
      <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
        {(title || description) && (
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}

        {/* 搜索模块 */}
        {renderSearchBar ? renderSearchBar({
          data,
          loading,
          pagination,
          searchParams,
          fetchList,
          updateSearchParams,
          updatePagination,
          resetSearch,
        }) : defaultSearchBar}
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 min-w-0">
        {/* 工具栏 */}
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
          {renderActionBar ? renderActionBar() : defaultActionBar}
        </div>

        {/* 表格 */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className={`w-full ${tableClassName}`}>
            <thead>
              <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {enableSelection && (
                  <th className="w-14 px-5 py-4 text-left">
                    <label className="cursor-pointer text-sm font-medium text-gray-700 select-none dark:text-gray-400">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${
                          allSelected
                            ? "border-brand-500 bg-brand-500"
                            : "bg-transparent border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <span className={allSelected ? "" : "opacity-0"}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="white"
                              strokeWidth="1.6666"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>
                    </label>
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 py-4 text-left text-xs font-medium text-gray-500 whitespace-nowrap dark:text-gray-400 ${column.headerClassName || ''} ${column.minWidth ? `min-w-[${column.minWidth}]` : ''} ${column.width ? `w-[${column.width}]` : ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                {(() => {
                  const hasActions = Array.isArray(rowActions) ? rowActions.length > 0 : !!rowActions;
                  return (onEdit || onView || onDelete || operationsHook?.remove || hasActions);
                })() && (
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 whitespace-nowrap w-[220px] min-w-[220px] sticky right-0 z-30 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 dark:text-gray-400">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (enableSelection ? 1 : 0) + ((onEdit || onView || onDelete || (Array.isArray(rowActions) ? rowActions.length > 0 : !!rowActions)) ? 1 : 0)}
                    className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    加载中...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (enableSelection ? 1 : 0) + ((onEdit || onView || onDelete || (Array.isArray(rowActions) ? rowActions.length > 0 : !!rowActions)) ? 1 : 0)}
                    className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {renderEmpty ? renderEmpty() : '暂无数据'}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  renderRow ? renderRow(item, index, selectedItems.includes(getItemId(item)), (checked) => handleItemSelectChange(getItemId(item), checked)) : defaultRenderRow(item, index)
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {enablePagination && pagination.total > 0 && (
          <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
            <div className="pb-3 sm:pb-0">
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                显示{" "}
                <span className="text-gray-800 dark:text-white/90">
                  {Math.min((pagination.current - 1) * pagination.pageSize + 1, pagination.total)}
                </span>{" "}
                到{" "}
                <span className="text-gray-800 dark:text-white/90">
                  {Math.min(pagination.current * pagination.pageSize, pagination.total)}
                </span>{" "}
                共{" "}
                <span className="text-gray-800 dark:text-white/90">
                  {pagination.total}
                </span>{" "}
                条记录
              </span>
            </div>
            <PaginationAdvanced
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onPageChange={(page, pageSize) => handlePaginationChange(page, pageSize)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

