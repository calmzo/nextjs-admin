import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import qs from 'qs';
import type { ApiResponse } from '@/types/api';
import { ResultEnum } from '@/enums/api/result.enum';
import { Auth } from '@/utils/auth';
import logger from '@/utils/logger';
import { handleApiError, createErrorFromResponse } from '@/utils/error-handler';
import type { ApiErrorResponse } from '@/types/error';

/**
 * 创建 HTTP 请求实例
 */
const service: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/prod-api',
  timeout: 50000,
  headers: { 
    'Content-Type': 'application/json;charset=utf-8' 
  },
  paramsSerializer: (params) => qs.stringify(params),
});

/**
 * 请求拦截器 - 添加 Authorization 头
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = Auth.getAccessToken();

    // 如果 Authorization 设置为 no-auth，则不携带 Token
    if (config.headers.Authorization !== 'no-auth' && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    logger.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一处理响应和错误
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 如果响应是二进制流，则直接返回（用于文件下载、Excel 导出等）
    if (response.config.responseType === 'blob') {
      return response;
    }

    const { code, data, msg } = response.data;

    // 请求成功
    if (code === ResultEnum.SUCCESS) {
      // 直接返回 data，这样调用者可以直接使用数据，而不需要访问 response.data
      // 使用双重类型断言，因为 axios 拦截器期望返回 AxiosResponse，但我们返回的是 data
      return data as unknown as AxiosResponse<unknown>;
    }
    
    // 业务错误，使用统一错误处理
    const errorResponse: ApiErrorResponse = {
      code,
      msg: msg || '系统出错',
      message: msg || '系统出错',
    };
    const error = createErrorFromResponse(errorResponse);
    handleApiError(error, { showToast: true, logError: true });
    return Promise.reject(error);
  },
  async (error) => {
    logger.error('Response interceptor error:', error);

    const { config, response } = error;

    // 网络错误或服务器无响应
    if (!response) {
      const networkError = new Error('网络连接失败，请检查网络设置');
      handleApiError(networkError, { showToast: true, logError: true });
      return Promise.reject(networkError);
    }

    const status = response.status;
    
    // 如果是blob请求且出现错误，特殊处理
    if (config.responseType === 'blob') {
      const blobError = new Error('文件下载失败');
      handleApiError(blobError, { showToast: true, logError: true });
      return Promise.reject(blobError);
    }
    
    // 尝试从响应中提取错误信息
    let code: number | string = status;
    let msg: string | undefined;
    
    try {
      // 某些情况下 response.data 可能不存在或格式不对
      if (response.data && typeof response.data === 'object') {
        const data = response.data as ApiResponse;
        code = data.code || status;
        msg = data.msg;
      }
    } catch (e) {
      // 如果解析失败，使用默认值
      logger.warn('Failed to parse error response data:', e);
    }
    
    // 根据状态码设置默认错误消息
    const defaultMsg = status === 403 
      ? '访问被拒绝，权限不足' 
      : status === 404 
        ? '请求的资源不存在' 
        : '请求失败';
    
    // 构建错误响应对象
    const errorResponse: ApiErrorResponse = {
      code,
      msg: msg || defaultMsg,
      message: msg || defaultMsg,
      status,
    };
    
    // 特殊处理Token过期情况（业务错误码或HTTP 401状态码）
    if (
      status === 401 || 
      code === ResultEnum.ACCESS_TOKEN_INVALID || 
      code === ResultEnum.REFRESH_TOKEN_INVALID
    ) {
      // Token 过期或未授权，直接跳转登录页
      await redirectToLogin('登录已过期，请重新登录');
      const authError = createErrorFromResponse(errorResponse);
      return Promise.reject(authError);
    }
    
    // 特殊处理 403 禁止访问（权限不足，但不跳转登录）
    if (status === 403) {
      // 403 表示权限不足，用户已登录但没有权限，只显示错误提示，不跳转登录
      const forbiddenError = createErrorFromResponse(errorResponse);
      handleApiError(forbiddenError, { showToast: true, logError: true });
      return Promise.reject(forbiddenError);
    }

    // 使用统一错误处理
    const apiError = createErrorFromResponse(errorResponse);
    handleApiError(apiError, { showToast: true, logError: true });
    
    // 为错误对象添加状态码信息，供组件层使用
    (error as ApiErrorResponse).status = status;
    (error as ApiErrorResponse).code = code;
    (error as ApiErrorResponse).msg = msg;
    
    return Promise.reject(apiError);
  }
);


/**
 * 重定向到登录页面
 */
async function redirectToLogin(message: string = '请重新登录'): Promise<void> {
  try {
    // 使用统一错误处理显示消息
    handleApiError(new Error(message), { showToast: true, logError: false });
    
    // 清除所有认证信息
    Auth.clearAuth();
    
    // 跳转到登录页，保留当前路由用于登录后跳转
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`;
    }
  } catch (error) {
    logger.error('Redirect to login error:', error);
  }
}



export default service;
