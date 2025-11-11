/**
 * 角色管理相关 Hooks
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/common/Toaster';
import { RoleAPI, RolePageQuery, RolePageVO, RoleForm, RoleStatus } from '@/api/role.api';
import { OptionType } from '@/types/api';
import { handleError } from '@/utils/error-handler';
import { extractErrorMessage } from '@/types/error';

// ==================== 角色列表 Hook ====================

export interface UseRoleListState {
  data: RolePageVO[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  searchParams: RolePageQuery;
}

export function useRoleList() {
  const [state, setState] = useState<UseRoleListState>({
    data: [],
    loading: false,
    error: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    searchParams: {
      keywords: '',
      status: undefined,
    },
  });

  // 使用 ref 保存最新的 state，避免在 setState 回调中调用 API
  const stateRef = useRef(state);
  stateRef.current = state;

  // 使用 ref 跟踪是否已经初始化，防止 React 18 开发环境下的重复调用
  const initializedRef = useRef(false);
  const fetchingRef = useRef(false);

  // 获取角色列表
  const fetchRoleList = useCallback(async (params?: Partial<RolePageQuery>) => {
    // 如果正在请求中，且没有传入新参数，则跳过（防止重复调用）
    if (fetchingRef.current && !params) {
      return;
    }
    
    fetchingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 使用 ref 获取最新的 state 值，而不是在 setState 回调中
      const currentState = stateRef.current;
      const queryParams: RolePageQuery = {
        ...currentState.searchParams,
        ...params,
        pageNum: params?.pageNum ?? currentState.pagination.current,
        pageSize: params?.pageSize ?? currentState.pagination.pageSize,
      };

      // 在 setState 外部调用 API
      const response = await RoleAPI.getPage(queryParams);
      
      setState(prevState => ({
        ...prevState,
        data: response.list || [],
        pagination: {
          ...prevState.pagination,
          total: response.total || 0,
        },
        loading: false,
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error) || '获取角色列表失败';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // 更新搜索参数
  const updateSearchParams = useCallback((params: Partial<RolePageQuery>) => {
    setState(prev => ({
      ...prev,
      searchParams: { ...prev.searchParams, ...params },
      pagination: { ...prev.pagination, current: 1 },
    }));
  }, []);

  // 更新分页
  const updatePagination = useCallback((pagination: Partial<UseRoleListState['pagination']>) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...pagination },
    }));
  }, []);

  // 重置搜索
  const resetSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchParams: {
        keywords: '',
        status: undefined,
      },
      pagination: { ...prev.pagination, current: 1 },
    }));
  }, []);

  // 初始化数据
  useEffect(() => {
    // 防止 React 18 开发环境下的重复调用
    if (initializedRef.current) {
      return;
    }
    
    initializedRef.current = true;
    fetchRoleList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    fetchRoleList,
    updateSearchParams,
    updatePagination,
    resetSearch,
  };
}

// ==================== 角色操作 Hook ====================

export interface UseRoleOperationsState {
  loading: boolean;
  error: string | null;
}

export function useRoleOperations() {
  const [state, setState] = useState<UseRoleOperationsState>({
    loading: false,
    error: null,
  });

  // 创建角色
  const create = useCallback(async (data: RoleForm): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await RoleAPI.create(data);
      toast.success('角色创建成功');
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error) || '创建角色失败';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
      return false;
    }
  }, []);

  // 更新角色
  const update = useCallback(async (id: number, data: RoleForm): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await RoleAPI.update(id, data);
      toast.success('角色更新成功');
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error) || '更新角色失败';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
      return false;
    }
  }, []);

  // 删除角色
  const remove = useCallback(async (ids: number[]): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await RoleAPI.deleteByIds(ids);
      toast.success(`成功删除 ${ids.length} 个角色`);
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error) || '删除角色失败';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
      return false;
    }
  }, []);

  // 更新角色状态
  const updateStatus = useCallback(async (id: number, status: RoleStatus): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await RoleAPI.updateStatus(id, status);
      const statusText = status === RoleStatus.ENABLED ? '启用' : '禁用';
      toast.success(`角色${statusText}成功`);
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error) || '更新角色状态失败';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
      return false;
    }
  }, []);

  return {
    ...state,
    create,
    update,
    remove,
    updateStatus,
  };
}

// ==================== 角色选项 Hook ====================

export interface RoleOption {
  label: string;
  value: number;
}

export interface UseRoleOptionsReturn {
  options: RoleOption[];
  loading: boolean;
  fetchOptions: () => Promise<void>;
}

/**
 * 角色选项 Hook
 * 获取角色列表数据
 */
export const useRoleOptions = (): UseRoleOptionsReturn => {
  const [options, setOptions] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await RoleAPI.getOptions();
      setOptions(
        (response || []).map((item: OptionType) => ({
          label: item.label,
          value: typeof item.value === 'number' ? item.value : parseInt(String(item.value), 10),
        }))
      );
    } catch (error: unknown) {
      // request.ts 已经处理了错误提示
      handleError(error, { showToast: false });
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    options,
    loading,
    fetchOptions,
  };
};

// ==================== 角色表单 Hook ====================

export interface UseRoleFormState {
  formData: RoleForm | null;
  loading: boolean;
  error: string | null;
}

export function useRoleForm() {
  const [state, setState] = useState<UseRoleFormState>({
    formData: null,
    loading: false,
    error: null,
  });

  // 获取角色表单数据
  const fetchFormData = useCallback(async (roleId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const formData = await RoleAPI.getFormData(roleId);
      setState(prev => ({
        ...prev,
        formData,
        loading: false,
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error) || '获取角色信息失败';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
    }
  }, []);

  // 重置表单数据
  const resetFormData = useCallback(() => {
    setState({
      formData: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    fetchFormData,
    resetFormData,
  };
}
