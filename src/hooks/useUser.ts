/**
 * 用户管理相关 Hooks
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/common/Toaster';
import { UserAPI, UserPageQuery, UserPageVO, UserForm, UserStatus } from '@/api/user.api';
import { OptionType } from '@/types/api';
import { handleError } from '@/utils/error-handler';
import { extractErrorMessage } from '@/types/error';

// ==================== 用户列表 Hook ====================

export interface UseUserListState {
  data: UserPageVO[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  searchParams: UserPageQuery;
}

export function useUserList() {
  const [state, setState] = useState<UseUserListState>({
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
      deptId: undefined,
      createTime: undefined,
    },
  });

  // 使用 ref 保存最新的 state，避免在 setState 回调中调用 API
  const stateRef = useRef(state);
  stateRef.current = state;

  // 使用 ref 跟踪是否已经初始化，防止 React 18 开发环境下的重复调用
  const initializedRef = useRef(false);
  const fetchingRef = useRef(false);

  // 获取用户列表
  const fetchUserList = useCallback(async (params?: Partial<UserPageQuery>) => {
    // 如果正在请求中，且没有传入新参数，则跳过（防止重复调用）
    if (fetchingRef.current && !params) {
      return;
    }

    fetchingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 使用 ref 获取最新的 state 值，而不是在 setState 回调中
      const currentState = stateRef.current;
      const queryParams: UserPageQuery = {
        ...currentState.searchParams,
        ...params,
        pageNum: params?.pageNum ?? currentState.pagination.current,
        pageSize: params?.pageSize ?? currentState.pagination.pageSize,
      };

      // 在 setState 外部调用 API
      const response = await UserAPI.getPage(queryParams);
      
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
      const errorMessage = extractErrorMessage(error) || '获取用户列表失败';
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
  const updateSearchParams = useCallback((params: Partial<UserPageQuery>) => {
    setState(prev => ({
      ...prev,
      searchParams: { ...prev.searchParams, ...params },
      pagination: { ...prev.pagination, current: 1 }, // 重置到第一页
    }));
  }, []);

  // 更新分页
  const updatePagination = useCallback((pagination: Partial<UseUserListState['pagination']>) => {
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
        deptId: undefined,
        createTime: undefined,
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
    fetchUserList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    fetchUserList,
    updateSearchParams,
    updatePagination,
    resetSearch,
  };
}

// ==================== 用户操作 Hook ====================

export interface UseUserOperationsState {
  loading: boolean;
  error: string | null;
}

export function useUserOperations() {
  const [state, setState] = useState<UseUserOperationsState>({
    loading: false,
    error: null,
  });

  // 创建用户
  const create = useCallback(async (data: UserForm): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await UserAPI.create(data);
      toast.success('用户创建成功');
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error) || '创建用户失败';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
      return false;
    }
  }, []);

  // 更新用户
  const update = useCallback(async (id: number, data: UserForm): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await UserAPI.update(id, data);
      toast.success('用户更新成功');
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error) || '更新用户失败';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
      return false;
    }
  }, []);

  // 删除用户
  const remove = useCallback(async (ids: number[]): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await UserAPI.deleteByIds(ids);
      toast.success(`成功删除 ${ids.length} 个用户`);
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error) || '删除用户失败';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
      return false;
    }
  }, []);

  // 更新用户状态
  const updateStatus = useCallback(async (id: number, status: UserStatus): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await UserAPI.updateStatus(id, status);
      const statusText = status === UserStatus.ENABLED ? '启用' : '禁用';
      toast.success(`用户${statusText}成功`);
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error) || '更新用户状态失败';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      // request.ts 已经处理了错误提示，这里只更新状态
      handleError(error, { showToast: false });
      return false;
    }
  }, []);

  // 重置密码
  const resetPassword = useCallback(async (id: number, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await UserAPI.resetPassword(id, password);
      // 不再在这里显示 toast，由调用方显示更详细的提示信息（包含密码）
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error) || '重置密码失败';
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
    resetPassword,
  };
}

// ==================== 用户选项 Hook ====================

export interface UseUserOptionsState {
  options: OptionType[];
  loading: boolean;
  error: string | null;
}

export function useUserOptions() {
  const [state, setState] = useState<UseUserOptionsState>({
    options: [],
    loading: false,
    error: null,
  });

  // 获取用户选项
  const fetchOptions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const options = await UserAPI.getOptions();
      setState(prev => ({
        ...prev,
        options: options || [],
        loading: false,
      }));
    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '获取用户选项失败',
        loading: false,
      }));
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    ...state,
    fetchOptions,
  };
}

// ==================== 用户表单 Hook ====================

export interface UseUserFormState {
  formData: UserForm | null;
  loading: boolean;
  error: string | null;
}

export function useUserForm() {
  const [state, setState] = useState<UseUserFormState>({
    formData: null,
    loading: false,
    error: null,
  });

  // 获取用户表单数据
  const fetchFormData = useCallback(async (userId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const formData = await UserAPI.getFormData(userId);
      setState(prev => ({
        ...prev,
        formData,
        loading: false,
      }));
    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '获取用户信息失败',
        loading: false,
      }));
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

// ==================== 用户导入导出 Hook ====================

export function useUserImportExport() {
  const [loading, setLoading] = useState(false);

  // 导出用户
  const exportUsers = useCallback(async (queryParams: UserPageQuery) => {
    setLoading(true);
    try {
      // 直接使用axios调用，避免响应拦截器的处理
      const response = await UserAPI.export(queryParams);
      
      // 检查响应是否为blob
      if (response instanceof Blob) {
        // 如果直接返回blob，创建下载
        const fileName = `用户列表_${new Date().toISOString().slice(0, 10)}.xlsx`;
        const downloadUrl = window.URL.createObjectURL(response);
        
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = fileName;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        // 如果是完整的response对象
        const fileData = response.data;
        const fileName = decodeURI(response.headers["content-disposition"].split(";")[1].split("=")[1]);
        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

        const blob = new Blob([fileData], { type: fileType });
        const downloadUrl = window.URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = fileName;

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(downloadUrl);
      }
      
      toast.success('用户导出成功');
    } catch (error: unknown) {
      // 导出错误需要特殊处理，因为可能不是通过 request.ts
      handleError(error, { customMessage: '导出用户失败' });
    } finally {
      setLoading(false);
    }
  }, []);

  // 下载导入模板
  const downloadTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const response = await UserAPI.downloadTemplate();
      
      // 检查响应是否为blob
      if (response instanceof Blob) {
        // 如果直接返回blob，创建下载
        const fileName = `用户导入模板_${new Date().toISOString().slice(0, 10)}.xlsx`;
        const downloadUrl = window.URL.createObjectURL(response);
        
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = fileName;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        // 如果是完整的response对象
        const fileData = response.data;
        const fileName = decodeURI(response.headers["content-disposition"].split(";")[1].split("=")[1]);
        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

        const blob = new Blob([fileData], { type: fileType });
        const downloadUrl = window.URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = fileName;

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(downloadUrl);
      }
      
      toast.success('模板下载成功');
    } catch (error: unknown) {
      // 下载错误需要特殊处理，因为可能不是通过 request.ts
      handleError(error, { customMessage: '下载模板失败' });
    } finally {
      setLoading(false);
    }
  }, []);

  // 导入用户
  const importUsers = useCallback(async (deptId: number, file: File) => {
    setLoading(true);
    try {
      const result = await UserAPI.import(deptId, file);
      
      // 根据导入结果显示不同的提示信息
      if (result.validCount > 0 && result.invalidCount === 0) {
        toast.success(`导入成功，共导入 ${result.validCount} 条数据`);
      } else if (result.validCount > 0 && result.invalidCount > 0) {
        toast.warning(`部分导入成功，有效数据 ${result.validCount} 条，无效数据 ${result.invalidCount} 条`);
      } else {
        toast.error(`导入失败，所有 ${result.invalidCount} 条数据均无效`);
      }
      
      return result;
    } catch (error: unknown) {
      // 导入错误需要特殊处理
      handleError(error, { customMessage: '导入用户失败' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    exportUsers,
    downloadTemplate,
    importUsers,
  };
}
