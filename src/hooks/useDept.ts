/**
 * 部门管理相关hooks
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  getDeptTree, 
  getDeptList, 
  getDeptDetail, 
  createDept, 
  updateDept, 
  deleteDept, 
  updateDeptStatus,
  getDeptOptions,
  type DeptQueryParams,
  type DeptFormData
} from '@/api/dept.api';
import type { DeptNode } from '@/types/dept-tree';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';

// 部门列表状态
export interface UseDeptListState {
  data: DeptNode[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// 部门树状态
export interface UseDeptTreeState {
  data: DeptNode[];
  loading: boolean;
  error: string | null;
  expandedKeys: Set<number>;
  selectedKeys: Set<number>;
}

/**
 * 部门列表管理hook
 */
export const useDeptList = (initialParams: DeptQueryParams = {}) => {
  const [state, setState] = useState<UseDeptListState>({
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  });

  const [params, setParams] = useState<DeptQueryParams>(initialParams);

  // 获取部门列表
  const fetchDeptList = useCallback(async (newParams?: Partial<DeptQueryParams>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const queryParams = { ...params, ...newParams };
      const response = await getDeptList(queryParams);
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
        error: error instanceof Error ? error.message : '获取部门列表失败',
        loading: false
      }));
    }
  }, [params]);

  // 搜索部门
  const searchDepts = useCallback((searchParams: Partial<DeptQueryParams>) => {
    fetchDeptList({ ...searchParams, page: 1 });
  }, [fetchDeptList]);

  // 分页变化
  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    fetchDeptList({ page, pageSize });
  }, [fetchDeptList]);

  // 刷新列表
  const refresh = useCallback(() => {
    fetchDeptList();
  }, [fetchDeptList]);

  return {
    ...state,
    params,
    fetchDeptList,
    searchDepts,
    handlePageChange,
    refresh,
    setParams
  };
};

/**
 * 部门树管理hook
 */
export const useDeptTree = () => {
  const [state, setState] = useState<UseDeptTreeState>({
    data: [],
    loading: false,
    error: null,
    expandedKeys: new Set(),
    selectedKeys: new Set()
  });

  // 获取部门树
  const fetchDeptTree = useCallback(async (params?: DeptQueryParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await getDeptTree(params);
      setState(prev => ({
        ...prev,
        data: response,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '获取部门树失败',
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
    fetchDeptTree,
    toggleExpanded,
    setSelectedKeys,
    setExpandedKeys
  };
};

/**
 * 部门详情管理hook
 */
export const useDeptDetail = () => {
  const [data, setData] = useState<DeptNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeptDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getDeptDetail(id);
      setData(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取部门详情失败');
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
    fetchDeptDetail,
    clear
  };
};

/**
 * 部门操作管理hook
 */
export const useDeptOperations = () => {
  const [loading, setLoading] = useState(false);

  // 创建部门
  const create = useCallback(async (data: DeptFormData) => {
    setLoading(true);
    try {
      const response = await createDept(data);
      toast.success('部门创建成功！');
      return response;
    } catch (error) {
      // request.ts 已经处理了错误提示
      handleError(error, { showToast: false });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新部门
  const update = useCallback(async (id: number, data: DeptFormData) => {
    setLoading(true);
    try {
      const response = await updateDept(id, data);
      toast.success('部门更新成功！');
      return response;
    } catch (error) {
      // request.ts 已经处理了错误提示
      handleError(error, { showToast: false });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除部门
  const remove = useCallback(async (id: number | string) => {
    setLoading(true);
    try {
      const response = await deleteDept(id);
      // 判断是批量删除还是单个删除
      const isBatchDelete = typeof id === 'string' && id.includes(',');
      toast.success(isBatchDelete ? '批量删除成功！' : '部门删除成功！');
      return response;
    } catch (error) {
      // request.ts 已经处理了错误提示
      handleError(error, { showToast: false });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新部门状态
  const updateStatus = useCallback(async (id: number, status: number) => {
    setLoading(true);
    try {
      const response = await updateDeptStatus(id, status);
      const statusText = status === 1 ? '启用' : '禁用';
      toast.success(`部门${statusText}成功！`);
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
 * 部门选项管理hook
 */
export const useDeptOptions = () => {
  const [options, setOptions] = useState<DeptNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getDeptOptions();
      setOptions(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取部门选项失败');
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
 * 部门搜索hook
 */
export const useDeptSearch = () => {
  const [searchParams, setSearchParams] = useState<DeptQueryParams>({});
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback((params: DeptQueryParams) => {
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
