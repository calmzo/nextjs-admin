/**
 * 菜单管理相关hooks
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  getMenuTree, 
  getMenuList, 
  getMenuDetail, 
  createMenu, 
  updateMenu, 
  deleteMenu, 
  updateMenuStatus,
  getMenuOptions,
  type MenuQueryParams,
  type MenuFormData
} from '@/api/menu.api';
import type { MenuNode } from '@/types/menu-tree';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';

// 菜单列表状态
export interface UseMenuListState {
  data: MenuNode[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// 菜单树状态
export interface UseMenuTreeState {
  data: MenuNode[];
  loading: boolean;
  error: string | null;
  expandedKeys: Set<number>;
  selectedKeys: Set<number>;
}

/**
 * 菜单列表管理hook
 */
export const useMenuList = (initialParams: MenuQueryParams = {}) => {
  const [state, setState] = useState<UseMenuListState>({
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  });

  const [params, setParams] = useState<MenuQueryParams>(initialParams);

  // 获取菜单列表
  const fetchMenuList = useCallback(async (newParams?: Partial<MenuQueryParams>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const queryParams = { ...params, ...newParams };
      const response = await getMenuList(queryParams);
      setState(prev => ({
        ...prev,
        data: response,
        pagination: {
          page: 1,
          pageSize: 10,
          total: response.length
        },
        loading: false
      }));
      setParams(queryParams);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '获取菜单列表失败',
        loading: false
      }));
    }
  }, [params]);

  // 搜索菜单
  const searchMenus = useCallback((searchParams: Partial<MenuQueryParams>) => {
    fetchMenuList({ ...searchParams, page: 1 });
  }, [fetchMenuList]);

  // 分页变化
  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    fetchMenuList({ page, pageSize });
  }, [fetchMenuList]);

  // 刷新列表
  const refresh = useCallback(() => {
    fetchMenuList();
  }, [fetchMenuList]);

  return {
    ...state,
    params,
    fetchMenuList,
    searchMenus,
    handlePageChange,
    refresh,
    setParams
  };
};

/**
 * 菜单树管理hook
 */
export const useMenuTree = () => {
  const [state, setState] = useState<UseMenuTreeState>({
    data: [],
    loading: false,
    error: null,
    expandedKeys: new Set(),
    selectedKeys: new Set()
  });

  // 获取菜单树
  const fetchMenuTree = useCallback(async (params?: MenuQueryParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await getMenuTree(params);
      setState(prev => ({
        ...prev,
        data: response,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '获取菜单树失败',
        loading: false
      }));
    }
  }, []);

  // 展开/折叠节点
  const toggleExpanded = useCallback((key: number) => {
    setState(prev => {
      const newExpandedKeys = new Set(prev.expandedKeys);
      if (newExpandedKeys.has(key)) {
        newExpandedKeys.delete(key);
      } else {
        newExpandedKeys.add(key);
      }
      return {
        ...prev,
        expandedKeys: newExpandedKeys
      };
    });
  }, []);

  // 选择节点
  const setSelectedKeys = useCallback((keys: Set<number>) => {
    setState(prev => ({
      ...prev,
      selectedKeys: keys
    }));
  }, []);

  // 设置展开的节点
  const setExpandedKeys = useCallback((keys: Set<number>) => {
    setState(prev => ({
      ...prev,
      expandedKeys: keys
    }));
  }, []);

  return {
    ...state,
    fetchMenuTree,
    toggleExpanded,
    setSelectedKeys,
    setExpandedKeys
  };
};

/**
 * 菜单详情管理hook
 */
export const useMenuDetail = () => {
  const [data, setData] = useState<MenuNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMenuDetail(id);
      setData(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取菜单详情失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchMenuDetail,
    clear
  };
};

/**
 * 菜单操作管理hook
 */
export const useMenuOperations = () => {
  const [loading, setLoading] = useState(false);

  // 创建菜单
  const create = useCallback(async (data: MenuFormData) => {
    setLoading(true);
    try {
      const response = await createMenu(data);
      toast.success('菜单创建成功！');
      return response;
    } catch (error) {
      // request.ts 已经处理了错误提示
      handleError(error, { showToast: false });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新菜单
  const update = useCallback(async (id: number, data: MenuFormData) => {
    setLoading(true);
    try {
      const response = await updateMenu(id, data);
      toast.success('菜单更新成功！');
      return response;
    } catch (error) {
      // request.ts 已经处理了错误提示
      handleError(error, { showToast: false });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除菜单
  const remove = useCallback(async (id: number | string) => {
    setLoading(true);
    try {
      const response = await deleteMenu(id);
      // 判断是批量删除还是单个删除
      const isBatchDelete = typeof id === 'string' && id.includes(',');
      toast.success(isBatchDelete ? '批量删除成功！' : '菜单删除成功！');
      return response;
    } catch (error) {
      // request.ts 已经处理了错误提示
      handleError(error, { showToast: false });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新菜单状态
  const updateStatus = useCallback(async (id: number, status: number) => {
    setLoading(true);
    try {
      const response = await updateMenuStatus(id, status);
      const statusText = status === 1 ? '启用' : '禁用';
      toast.success(`菜单${statusText}成功！`);
      return response;
    } catch (error) {
      // request.ts 已经处理了错误提示
      handleError(error, { showToast: false });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    create,
    update,
    remove,
    updateStatus
  };
};

/**
 * 菜单选项管理hook
 */
export const useMenuOptions = () => {
  const [options, setOptions] = useState<MenuNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMenuOptions();
      setOptions(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取菜单选项失败');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    options,
    loading,
    error,
    fetchOptions
  };
};

/**
 * 菜单搜索hook
 */
export const useMenuSearch = () => {
  const [searchParams, setSearchParams] = useState<MenuQueryParams>({});
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback((params: MenuQueryParams) => {
    setSearchParams(params);
    setIsSearching(true);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams({});
    setIsSearching(false);
  }, []);

  const searchResults = useMemo(() => {
    return {
      hasSearch: Object.keys(searchParams).length > 0,
      params: searchParams,
      isSearching
    };
  }, [searchParams, isSearching]);

  return {
    searchParams,
    isSearching,
    search,
    clearSearch,
    searchResults
  };
};

