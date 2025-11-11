/**
 * 系统配置管理Hook
 */

import { useState, useCallback, useRef } from 'react';
import ConfigAPI, { ConfigQueryParams, ConfigPageVO } from '@/api/config.api';
import { handleError } from '@/utils/error-handler';
import { extractErrorMessage } from '@/types/error';

export interface UseConfigListState {
  data: ConfigPageVO[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  searchParams: ConfigQueryParams;
}

export function useConfigList() {
  const [state, setState] = useState<UseConfigListState>({
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
    },
  });

  // 使用 ref 保存最新的 state，避免在 setState 回调中调用 API
  const stateRef = useRef(state);
  stateRef.current = state;

  // 使用 ref 跟踪是否正在请求中，防止重复调用
  const fetchingRef = useRef(false);

  // 获取配置列表
  const fetchConfigList = useCallback(async (params?: Partial<ConfigQueryParams>) => {
    // 如果正在请求中，且没有传入新参数，则跳过（防止重复调用）
    if (fetchingRef.current && !params) {
      return;
    }

    fetchingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 使用 ref 获取最新的 state 值，而不是在 setState 回调中
      const currentState = stateRef.current;
      const queryParams: ConfigQueryParams = {
        ...currentState.searchParams,
        ...params,
        pageNum: params?.pageNum ?? currentState.pagination.current,
        pageSize: params?.pageSize ?? currentState.pagination.pageSize,
      };

      // 在 setState 外部调用 API
      const response = await ConfigAPI.getPage(queryParams);
      
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
      const errorMessage = extractErrorMessage(error) || '获取配置列表失败';
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
  const updateSearchParams = useCallback((params: Partial<ConfigQueryParams>) => {
    setState(prev => ({
      ...prev,
      searchParams: { ...prev.searchParams, ...params },
      pagination: { ...prev.pagination, current: 1 },
    }));
  }, []);

  // 更新分页
  const updatePagination = useCallback((current: number, pageSize: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, current, pageSize },
    }));
  }, []);

  // 重置搜索
  const resetSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchParams: { keywords: '' },
      pagination: { ...prev.pagination, current: 1 },
    }));
  }, []);

  // 注意：不在这里初始化数据，让 GenericList 统一管理初始化调用
  // 这样可以避免重复调用接口

  return {
    ...state,
    fetchConfigList,
    updateSearchParams,
    updatePagination,
    resetSearch,
  };
}

