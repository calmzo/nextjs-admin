/**
 * GenericList 组件的类型定义
 */

import { ReactNode } from 'react';

/**
 * 列表 Hook 返回类型
 */
export interface ListHookReturn<T> {
  data: T[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  searchParams: Record<string, unknown>;
  fetchList: (params?: Record<string, unknown>) => Promise<void> | void;
  updateSearchParams: (params: Record<string, unknown>) => void;
  updatePagination: (page: number, pageSize: number) => void;
  resetSearch: () => void;
}

/**
 * 操作 Hook 返回类型
 */
export interface OperationsHookReturn {
  loading: boolean;
  remove?: (ids: (string | number)[]) => Promise<boolean>;
  [key: string]: unknown;
}

/**
 * 列定义
 */
export interface ColumnDef<T> {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  render?: (item: T, index: number, pagination?: { current: number; pageSize: number }) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

/**
 * 筛选器配置
 */
export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'dateRange' | 'custom';
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: string | number | undefined;
  render?: (api: {
    searchParams: Record<string, unknown>;
    updateSearchParams: (params: Record<string, unknown>) => void;
    fetchList: (params?: Record<string, unknown>) => Promise<void> | void;
    resetSearch: () => void;
    loading: boolean;
  }) => ReactNode;
  onChange?: (value: unknown) => void;
}

/**
 * 批量操作配置
 */
export interface BatchOperation {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedIds: (string | number)[]) => Promise<void> | void;
  variant?: 'default' | 'danger' | 'outline';
  permission?: () => boolean;
}

/**
 * 行操作配置
 */
export interface RowAction<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  variant?: 'default' | 'danger' | 'outline';
  permission?: (item: T) => boolean;
  className?: string;
}

/**
 * 权限配置
 */
export interface PermissionConfig {
  add?: () => boolean;
  edit?: (item: unknown) => boolean;
  delete?: (item: unknown) => boolean;
  view?: (item: unknown) => boolean;
  [key: string]: ((...args: unknown[]) => boolean) | undefined;
}

/**
 * GenericList 组件 Props
 */
export interface GenericListProps<T> {
  // 数据相关
  useListHook: () => ListHookReturn<T>;
  useOperationsHook?: () => OperationsHookReturn;
  
  // 配置相关
  title: string;
  description?: string;
  columns: ColumnDef<T>[];
  
  // 搜索相关
  searchPlaceholder?: string;
  searchFields?: string[]; // 搜索字段列表
  filters?: FilterConfig[];
  onSearch?: (keywords: string) => void;
  /**
   * 是否在输入变化时自动触发搜索（默认 false，以保持现有行为）
   */
  searchAutoOnChange?: boolean;
  /**
   * 自动搜索的去抖时间（毫秒），仅在 searchAutoOnChange 为 true 时生效，默认 300ms
   */
  searchDebounceMs?: number;
  
  // 操作相关
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => Promise<void> | void;
  batchOperations?: BatchOperation[];
  rowActions?: RowAction<T>[] | ((item: T, index: number) => RowAction<T>[]);
  
  // 权限相关
  permissions?: PermissionConfig;
  
  // 自定义渲染
  renderRow?: (item: T, index: number, isSelected: boolean, onSelect: (checked: boolean) => void) => ReactNode;
  renderSearchBar?: (hookReturn: ListHookReturn<T>) => ReactNode;
  renderActionBar?: () => ReactNode;
  renderEmpty?: () => ReactNode;
  
  // 其他
  className?: string;
  enableSelection?: boolean; // 是否启用行选择
  enablePagination?: boolean; // 是否启用分页
  onRefreshRequest?: (refreshFn: () => void) => void;
  
  // 获取唯一标识
  getItemId: (item: T) => string | number;
  
  // 自定义样式
  tableClassName?: string;
  searchBarClassName?: string;
  actionBarClassName?: string;
}

