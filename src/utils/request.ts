import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import qs from 'qs';
import toast from 'react-hot-toast';
import type { ApiResponse } from '@/types/api';
import { ResultEnum } from '@/enums/api/result.enum';
import { Auth } from '@/utils/auth';

/**
 * 创建 HTTP 请求实例
 */
const service: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://youlai.calmchen.com',
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
    console.error('Request interceptor error:', error);
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
    console.log('response', response);

    const { code, data, msg } = response.data;

    // 请求成功
    if (code === ResultEnum.SUCCESS) {
      return data;
    }
    console.log('msg', msg);
    // 业务错误
    toast.error(msg || '系统出错');
    const businessError = new Error(msg || 'Business Error') as any;
    businessError.code = code;
    businessError.msg = msg;
    return Promise.reject(businessError);
  },
  async (error) => {
    console.error('Response interceptor error:', error);

    const { config, response } = error;

    // 网络错误或服务器无响应
    if (!response) {
      toast.error('网络连接失败，请检查网络设置');
      return Promise.reject(error);
    }

    // 处理HTTP状态码错误 - 不显示toast，让组件层处理
    const status = response.status;
    // 处理业务错误（基于response.data.code）
    const { code, msg } = response.data as ApiResponse;
    console.log('code', code);
    
    // 如果有业务错误码，优先处理业务错误
    if (code && code !== ResultEnum.SUCCESS) {
      switch (code) {
        case ResultEnum.ACCESS_TOKEN_INVALID:
          // Access Token 过期，尝试刷新
          return refreshTokenAndRetry(config);

        case ResultEnum.REFRESH_TOKEN_INVALID:
          // Refresh Token 过期，跳转登录页
          await redirectToLogin('登录已过期，请重新登录');
          return Promise.reject(new Error(msg || 'Refresh Token Invalid'));

        default:
          // 对于业务错误，不显示toast，让组件层处理
          const error = new Error(msg || 'Request Error');
          (error as any).code = code;
          (error as any).msg = msg;
          (error as any).status = status; // 保留HTTP状态码
          return Promise.reject(error);
      }
    }

    // 处理HTTP状态码错误（没有业务错误码时）
    if (status === 401 || status === 403 || status === 404 || status === 429 || status >= 500) {
      // 为错误对象添加状态码信息，供组件层使用
      error.status = status;
      return Promise.reject(error);
    }
  }
);

/**
 * 重试请求的回调函数类型
 */
type RetryCallback = () => void;

// Token 刷新相关状态
let isRefreshingToken = false;
const pendingRequests: RetryCallback[] = [];

/**
 * 刷新 Token 并重试请求
 */
async function refreshTokenAndRetry(config: InternalAxiosRequestConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    // 封装需要重试的请求
    const retryRequest = () => {
      const newToken = Auth.getAccessToken();
      if (newToken && config.headers) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
      service(config).then(resolve).catch(reject);
    };

    // 将请求加入等待队列
    pendingRequests.push(retryRequest);

    // 如果没有正在刷新，则开始刷新流程
    if (!isRefreshingToken) {
      isRefreshingToken = true;

      refreshToken()
        .then(() => {
          // 刷新成功，重试所有等待的请求
          pendingRequests.forEach((callback) => {
            try {
              callback();
            } catch (error) {
              console.error('Retry request error:', error);
            }
          });
          // 清空队列
          pendingRequests.length = 0;
        })
        .catch(async (error) => {
          console.error('Token refresh failed:', error);
          // 刷新失败，清空队列并跳转登录页
          pendingRequests.length = 0;
          await redirectToLogin('登录状态已失效，请重新登录');
          // 拒绝所有等待的请求
          pendingRequests.forEach(() => {
            reject(new Error('Token refresh failed'));
          });
        })
        .finally(() => {
          isRefreshingToken = false;
        });
    }
  });
}

/**
 * 重定向到登录页面
 */
async function redirectToLogin(message: string = '请重新登录'): Promise<void> {
  try {
    toast.error(message);
    
    // 清除所有认证信息
    Auth.clearAuth();
    
    // 跳转到登录页，保留当前路由用于登录后跳转
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`;
    }
  } catch (error) {
    console.error('Redirect to login error:', error);
  }
}


/**
 * 刷新Token函数
 */
async function refreshToken() {
  const refreshTokenValue = Auth.getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://youlai.calmchen.com'}/prod-api/admin/system/auth/refresh-token`,
      { refreshToken: refreshTokenValue },
      {
        headers: {
          Authorization: 'no-auth',
        },
      }
    );
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    const rememberMe = Auth.getRememberMe();
    Auth.setTokens(accessToken, newRefreshToken, rememberMe);
  } catch (error) {
    throw error;
  }
}

export default service;
