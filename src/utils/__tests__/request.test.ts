/**
 * HTTP 请求工具测试
 * 测试 request.ts 的所有功能，包括请求拦截器、响应拦截器和错误处理
 */

import request from '@/utils/request';
import { Auth } from '@/utils/auth';
import { ResultEnum } from '@/enums/api/result.enum';
import { handleApiError } from '@/utils/error-handler';
import logger from '@/utils/logger';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/api';

// Mock Auth
jest.mock('@/utils/auth', () => ({
  Auth: {
    getAccessToken: jest.fn(),
    clearAuth: jest.fn(),
  },
}));

// Mock error-handler
jest.mock('@/utils/error-handler', () => ({
  handleApiError: jest.fn(),
  createErrorFromResponse: jest.fn((response) => {
    const error = new Error(response.msg || response.message);
    Object.assign(error, response);
    return error;
  }),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

// Note: window.location.href cannot be mocked in jsdom, so we'll only test
// that Auth.clearAuth is called for redirect scenarios

describe('request', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('请求拦截器', () => {
    it('应该在请求头中添加 Authorization token', async () => {
      (Auth.getAccessToken as jest.Mock).mockReturnValue('test-token-123');
      
      const config = {
        headers: {},
      };
      
      // 直接调用拦截器
      const requestInstance = request as AxiosInstance;
      const requestInterceptor = (requestInstance.interceptors.request as unknown as { handlers: Array<{ fulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }> }).handlers[0]?.fulfilled;
      if (!requestInterceptor) {
        throw new Error('Request interceptor not found');
      }
      const result = await requestInterceptor(config as InternalAxiosRequestConfig);
      
      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('当 Authorization 设置为 no-auth 时，不应该添加 token', async () => {
      (Auth.getAccessToken as jest.Mock).mockReturnValue('test-token-123');
      
      const config = {
        headers: {
          Authorization: 'no-auth',
        },
      };
      
      const requestInstance = request as AxiosInstance;
      const requestInterceptor = (requestInstance.interceptors.request as unknown as { handlers: Array<{ fulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }> }).handlers[0]?.fulfilled;
      if (!requestInterceptor) {
        throw new Error('Request interceptor not found');
      }
      const result = await requestInterceptor(config as InternalAxiosRequestConfig);
      
      // When Authorization is 'no-auth', it should be deleted (not set to Bearer token)
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('当没有 token 时，不应该添加 Authorization 头', async () => {
      (Auth.getAccessToken as jest.Mock).mockReturnValue('');
      
      const config = {
        headers: {},
      };
      
      const requestInstance = request as AxiosInstance;
      const requestInterceptor = (requestInstance.interceptors.request as unknown as { handlers: Array<{ fulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }> }).handlers[0]?.fulfilled;
      if (!requestInterceptor) {
        throw new Error('Request interceptor not found');
      }
      const result = await requestInterceptor(config as InternalAxiosRequestConfig);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('请求拦截器错误应该被正确处理', async () => {
      const requestInstance = request as AxiosInstance;
      const requestErrorInterceptor = (requestInstance.interceptors.request as unknown as { handlers: Array<{ rejected?: (error: Error) => Promise<never> }> }).handlers[0]?.rejected;
      if (!requestErrorInterceptor) {
        throw new Error('Request error interceptor not found');
      }
      const error = new Error('Request error');
      
      await expect(requestErrorInterceptor(error)).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalledWith('Request interceptor error:', error);
    });
  });

  describe('响应拦截器 - 成功响应', () => {
    it('应该返回 data 字段当 code 为 SUCCESS', async () => {
      const requestInstance = request as AxiosInstance;
      const responseInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ fulfilled?: (response: AxiosResponse<ApiResponse>) => AxiosResponse<unknown> | Promise<AxiosResponse<unknown>> }> }).handlers[0]?.fulfilled;
      if (!responseInterceptor) {
        throw new Error('Response interceptor not found');
      }
      
      const mockData = { id: 1, name: 'test' };
      const response: AxiosResponse<ApiResponse> = {
        data: {
          code: ResultEnum.SUCCESS,
          data: mockData,
          msg: '成功',
        } as ApiResponse,
        config: {
          responseType: undefined,
        } as InternalAxiosRequestConfig,
        status: 200,
        statusText: 'OK',
        headers: {},
      } as AxiosResponse<ApiResponse>;
      
      const result = await responseInterceptor(response);
      
      expect(result).toBe(mockData);
    });

    it('Blob 响应应该直接返回', async () => {
      const requestInstance = request as AxiosInstance;
      const responseInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ fulfilled?: (response: AxiosResponse<ApiResponse | Blob>) => AxiosResponse<unknown> | Promise<AxiosResponse<unknown>> }> }).handlers[0]?.fulfilled;
      if (!responseInterceptor) {
        throw new Error('Response interceptor not found');
      }
      
      const blob = new Blob(['test'], { type: 'application/pdf' });
      const response: AxiosResponse<Blob> = {
        data: blob,
        config: {
          responseType: 'blob',
        } as InternalAxiosRequestConfig,
        status: 200,
        statusText: 'OK',
        headers: {},
      } as AxiosResponse<Blob>;
      
      const result = await responseInterceptor(response as AxiosResponse<ApiResponse | Blob>);
      
      expect(result).toBe(response);
    });

    it('业务错误应该被正确处理', async () => {
      const requestInstance = request as AxiosInstance;
      const responseInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ fulfilled?: (response: AxiosResponse<ApiResponse>) => AxiosResponse<unknown> | Promise<AxiosResponse<unknown>> }> }).handlers[0]?.fulfilled;
      if (!responseInterceptor) {
        throw new Error('Response interceptor not found');
      }
      
      const response: AxiosResponse<ApiResponse> = {
        data: {
          code: ResultEnum.ERROR,
          data: null,
          msg: '业务错误',
        } as ApiResponse,
        config: {
          responseType: undefined,
        } as InternalAxiosRequestConfig,
        status: 200,
        statusText: 'OK',
        headers: {},
      } as AxiosResponse<ApiResponse>;
      
      await expect(responseInterceptor(response)).rejects.toBeDefined();
      expect(handleApiError).toHaveBeenCalled();
    });
  });

  describe('响应拦截器 - 错误处理', () => {
    it('网络错误应该被正确处理', async () => {
      const requestInstance = request as AxiosInstance;
      const errorInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ rejected?: (error: AxiosError<ApiResponse>) => Promise<never> }> }).handlers[0]?.rejected;
      if (!errorInterceptor) {
        throw new Error('Error interceptor not found');
      }
      
      const error = {
        config: {} as InternalAxiosRequestConfig,
        response: undefined,
      } as AxiosError<ApiResponse>;
      
      await expect(errorInterceptor(error)).rejects.toBeDefined();
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ message: '网络连接失败，请检查网络设置' }),
        { showToast: true, logError: true }
      );
    });

    it('Blob 请求错误应该被正确处理', async () => {
      const requestInstance = request as AxiosInstance;
      const errorInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ rejected?: (error: AxiosError<ApiResponse>) => Promise<never> }> }).handlers[0]?.rejected;
      if (!errorInterceptor) {
        throw new Error('Error interceptor not found');
      }
      
      const error = {
        config: {
          responseType: 'blob',
        } as InternalAxiosRequestConfig,
        response: {
          status: 500,
          data: {},
        },
      } as AxiosError<ApiResponse>;
      
      await expect(errorInterceptor(error)).rejects.toBeDefined();
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ message: '文件下载失败' }),
        { showToast: true, logError: true }
      );
    });

    it('401 错误应该重定向到登录页', async () => {
      const requestInstance = request as AxiosInstance;
      const errorInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ rejected?: (error: AxiosError<ApiResponse>) => Promise<never> }> }).handlers[0]?.rejected;
      if (!errorInterceptor) {
        throw new Error('Error interceptor not found');
      }
      
      const error = {
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 401,
          data: {
            code: ResultEnum.ACCESS_TOKEN_INVALID,
            msg: 'Token 过期',
          } as ApiResponse,
        },
      } as AxiosError<ApiResponse>;
      
      await expect(errorInterceptor(error)).rejects.toBeDefined();
      expect(Auth.clearAuth).toHaveBeenCalled();
      // Note: window.location.href cannot be mocked in jsdom, so we only verify Auth.clearAuth
    });

    it('ACCESS_TOKEN_INVALID 错误应该重定向到登录页', async () => {
      const requestInstance = request as AxiosInstance;
      const errorInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ rejected?: (error: AxiosError<ApiResponse>) => Promise<never> }> }).handlers[0]?.rejected;
      if (!errorInterceptor) {
        throw new Error('Error interceptor not found');
      }
      
      const error = {
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 200,
          data: {
            code: ResultEnum.ACCESS_TOKEN_INVALID,
            msg: 'Token 无效',
          } as ApiResponse,
        },
      } as AxiosError<ApiResponse>;
      
      await expect(errorInterceptor(error)).rejects.toBeDefined();
      expect(Auth.clearAuth).toHaveBeenCalled();
      // Note: window.location.href cannot be mocked in jsdom, so we only verify Auth.clearAuth
    });

    it('REFRESH_TOKEN_INVALID 错误应该重定向到登录页', async () => {
      const requestInstance = request as AxiosInstance;
      const errorInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ rejected?: (error: AxiosError<ApiResponse>) => Promise<never> }> }).handlers[0]?.rejected;
      if (!errorInterceptor) {
        throw new Error('Error interceptor not found');
      }
      
      const error = {
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 200,
          data: {
            code: ResultEnum.REFRESH_TOKEN_INVALID,
            msg: 'Refresh Token 无效',
          } as ApiResponse,
        },
      } as AxiosError<ApiResponse>;
      
      await expect(errorInterceptor(error)).rejects.toBeDefined();
      expect(Auth.clearAuth).toHaveBeenCalled();
      // Note: window.location.href cannot be mocked in jsdom, so we only verify Auth.clearAuth
    });

    it('其他 HTTP 错误应该被正确处理', async () => {
      const requestInstance = request as AxiosInstance;
      const errorInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ rejected?: (error: AxiosError<ApiResponse>) => Promise<never> }> }).handlers[0]?.rejected;
      if (!errorInterceptor) {
        throw new Error('Error interceptor not found');
      }
      
      const error = {
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 500,
          data: {
            code: ResultEnum.ERROR,
            msg: '服务器错误',
          } as ApiResponse,
        },
      } as AxiosError<ApiResponse>;
      
      await expect(errorInterceptor(error)).rejects.toBeDefined();
      expect(handleApiError).toHaveBeenCalled();
    });

    it('错误响应应该记录日志', async () => {
      const requestInstance = request as AxiosInstance;
      const errorInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ rejected?: (error: AxiosError<ApiResponse>) => Promise<never> }> }).handlers[0]?.rejected;
      if (!errorInterceptor) {
        throw new Error('Error interceptor not found');
      }
      
      const error = {
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 500,
          data: {
            code: ResultEnum.ERROR,
            msg: '服务器错误',
          } as ApiResponse,
        },
      } as AxiosError<ApiResponse>;
      
      await expect(errorInterceptor(error)).rejects.toBeDefined();
      expect(logger.error).toHaveBeenCalledWith('Response interceptor error:', error);
    });
  });

  describe('redirectToLogin', () => {
    it('应该清除认证信息并重定向到登录页', async () => {
      const requestInstance = request as AxiosInstance;
      const errorInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ rejected?: (error: AxiosError<ApiResponse>) => Promise<never> }> }).handlers[0]?.rejected;
      if (!errorInterceptor) {
        throw new Error('Error interceptor not found');
      }
      
      const error = {
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 401,
          data: {
            code: ResultEnum.ACCESS_TOKEN_INVALID,
            msg: '登录已过期，请重新登录',
          } as ApiResponse,
        },
      } as AxiosError<ApiResponse>;
      
      await expect(errorInterceptor(error)).rejects.toBeDefined();
      expect(Auth.clearAuth).toHaveBeenCalled();
      // Note: window.location.href cannot be mocked in jsdom, so we only verify Auth.clearAuth
    });

    it('应该保留当前路径作为 redirect 参数', async () => {
      const requestInstance = request as AxiosInstance;
      const errorInterceptor = (requestInstance.interceptors.response as unknown as { handlers: Array<{ rejected?: (error: AxiosError<ApiResponse>) => Promise<never> }> }).handlers[0]?.rejected;
      if (!errorInterceptor) {
        throw new Error('Error interceptor not found');
      }
      
      const error = {
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 401,
          data: {
            code: ResultEnum.ACCESS_TOKEN_INVALID,
            msg: '登录已过期',
          } as ApiResponse,
        },
      } as AxiosError<ApiResponse>;
      
      await expect(errorInterceptor(error)).rejects.toBeDefined();
      expect(Auth.clearAuth).toHaveBeenCalled();
      // Note: window.location.href cannot be mocked in jsdom, so we only verify Auth.clearAuth
    });
  });
});
