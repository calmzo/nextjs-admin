/**
 * 统一错误处理工具
 */

import toast from 'react-hot-toast';
import logger from '@/utils/logger';
import {
  AppError,
  BusinessError,
  TokenExpiredError,
  CaptchaError,
  HttpError,
  ApiErrorResponse,
  ErrorCodes,
  isApiErrorResponse,
  extractErrorMessage,
} from '@/types/error';
import { ResultEnum } from '@/enums/api/result.enum';

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  /**
   * 是否显示错误提示（默认：true）
   */
  showToast?: boolean;
  
  /**
   * 是否记录错误日志（默认：true）
   */
  logError?: boolean;
  
  /**
   * 自定义错误消息
   */
  customMessage?: string;
  
  /**
   * 错误回调函数
   */
  onError?: (error: unknown) => void;
}

/**
 * 统一错误处理函数
 * 
 * @param error - 错误对象
 * @param options - 处理选项
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    logError = true,
    customMessage,
    onError,
  } = options;

  // 执行自定义回调
  if (onError) {
    onError(error);
  }

  // 记录错误日志
  if (logError) {
    logger.error('Error occurred:', error);
  }

  // 提取错误消息
  const errorMessage = customMessage || extractErrorMessage(error);

  // 显示错误提示
  if (showToast) {
    toast.error(errorMessage);
  }
}

/**
 * 处理认证相关错误
 * 
 * @param error - 错误对象
 * @returns 错误消息字符串
 */
export function handleAuthError(error: unknown): string {
  if (isApiErrorResponse(error)) {
    const code = String(error.code);
    
    // 验证码错误
    if (code === ErrorCodes.CAPTCHA_ERROR) {
      return error.msg || '验证码错误，请重新输入';
    }
    
    // Token 过期
    if (code === ErrorCodes.TOKEN_EXPIRED || code === ResultEnum.ACCESS_TOKEN_INVALID) {
      return '登录已过期，请重新登录';
    }
    
    // Refresh Token 过期
    if (code === ErrorCodes.REFRESH_TOKEN_EXPIRED || code === ResultEnum.REFRESH_TOKEN_INVALID) {
      return '会话已过期，请重新登录';
    }
    
    // 登录失败
    if (code === ErrorCodes.LOGIN_FAILED || code === ErrorCodes.SESSION_EXPIRED) {
      return error.msg || '登录失败，请重试';
    }
    
    // 其他业务错误
    if (error.msg) {
      return error.msg;
    }
    
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '登录失败，请重试';
}

/**
 * 处理 API 错误响应
 * 
 * @param error - 错误对象
 * @param options - 处理选项
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    logError = true,
    customMessage,
    onError,
  } = options;

  // 执行自定义回调
  if (onError) {
    onError(error);
  }

  // 记录错误日志
  if (logError) {
    logger.error('API Error:', error);
  }

  // 处理认证错误（Token 过期等）
  if (isApiErrorResponse(error)) {
    const code = String(error.code);
    
    if (
      code === ErrorCodes.TOKEN_EXPIRED ||
      code === ErrorCodes.REFRESH_TOKEN_EXPIRED ||
      code === ResultEnum.ACCESS_TOKEN_INVALID ||
      code === ResultEnum.REFRESH_TOKEN_INVALID
    ) {
      // Token 过期，不在这里处理跳转，由 request.ts 统一处理
      const message = customMessage || handleAuthError(error);
      if (showToast) {
        toast.error(message);
      }
      return;
    }
  }

  // 显示错误提示
  const errorMessage = customMessage || extractErrorMessage(error);
  if (showToast) {
    toast.error(errorMessage);
  }
}

/**
 * 处理网络错误
 * 
 * @param error - 错误对象
 * @param options - 处理选项
 */
export function handleNetworkError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    logError = true,
  } = options;

  if (logError) {
    logger.error('Network Error:', error);
  }

  let errorMessage = '网络连接失败，请检查网络设置';
  
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      errorMessage = '请求超时，请稍后重试';
    } else if (error.message.includes('Network Error')) {
      errorMessage = '网络连接失败，请检查网络设置';
    } else {
      errorMessage = error.message;
    }
  }

  if (showToast) {
    toast.error(errorMessage);
  }
}

/**
 * 处理 HTTP 状态错误
 * 
 * @param error - 错误对象
 * @param options - 处理选项
 */
export function handleHttpError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    logError = true,
  } = options;

  if (logError) {
    logger.error('HTTP Error:', error);
  }

  let errorMessage = '请求失败，请重试';
  let statusCode: number | undefined;

  if (isApiErrorResponse(error)) {
    statusCode = error.status;
    
    switch (statusCode) {
      case ErrorCodes.UNAUTHORIZED:
        errorMessage = '未授权，请重新登录';
        break;
      case ErrorCodes.FORBIDDEN:
        errorMessage = '访问被拒绝，权限不足';
        break;
      case ErrorCodes.NOT_FOUND:
        errorMessage = '请求的资源不存在';
        break;
      case ErrorCodes.TOO_MANY_REQUESTS:
        errorMessage = '请求过于频繁，请稍后再试';
        break;
      default:
        if (statusCode && statusCode >= 500) {
          errorMessage = '服务器错误，请稍后重试';
        } else if (error.msg) {
          errorMessage = error.msg;
        } else if (error.message) {
          errorMessage = error.message;
        }
    }
  } else if (error instanceof Error && 'status' in error) {
    statusCode = (error as { status?: number }).status;
    errorMessage = error.message;
  }

  if (showToast) {
    toast.error(errorMessage);
  }
}

/**
 * 处理验证码错误（特殊处理，需要刷新验证码）
 * 
 * @param error - 错误对象
 * @param onRefreshCaptcha - 刷新验证码的回调函数
 * @param options - 处理选项
 */
export function handleCaptchaError(
  error: unknown,
  onRefreshCaptcha?: () => void,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    logError = true,
  } = options;

  if (logError) {
    logger.error('Captcha Error:', error);
  }

  const errorMessage = isApiErrorResponse(error) && error.code === ErrorCodes.CAPTCHA_ERROR
    ? (error.msg || '验证码错误，请重新输入')
    : '验证码错误，请重新输入';

  if (showToast) {
    toast.error(errorMessage);
  }

  // 自动刷新验证码
  if (onRefreshCaptcha) {
    onRefreshCaptcha();
  }
}

/**
 * 创建错误对象（从 API 响应）
 * 
 * @param response - API 错误响应
 * @returns 错误对象
 */
export function createErrorFromResponse(response: ApiErrorResponse): AppError {
  const code = String(response.code);
  const message = response.msg || response.message || '未知错误';

  // 认证错误
  if (
    code === ErrorCodes.TOKEN_EXPIRED ||
    code === ResultEnum.ACCESS_TOKEN_INVALID
  ) {
    return new TokenExpiredError(message);
  }

  if (code === ErrorCodes.REFRESH_TOKEN_EXPIRED || code === ResultEnum.REFRESH_TOKEN_INVALID) {
    return new TokenExpiredError(message);
  }

  // 验证码错误
  if (code === ErrorCodes.CAPTCHA_ERROR) {
    return new CaptchaError(message);
  }

  // HTTP 状态错误
  if (response.status) {
    return new HttpError(message, response.status, code);
  }

  // 业务错误
  return new BusinessError(message, code, response.data);
}

/**
 * 安全地执行异步操作并处理错误
 * 
 * @param fn - 异步函数
 * @param options - 错误处理选项
 * @returns Promise
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, options);
    return null;
  }
}

/**
 * 安全地执行异步操作并处理错误（返回默认值）
 * 
 * @param fn - 异步函数
 * @param defaultValue - 默认值
 * @param options - 错误处理选项
 * @returns Promise
 */
export async function safeAsyncWithDefault<T>(
  fn: () => Promise<T>,
  defaultValue: T,
  options: ErrorHandlerOptions = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, options);
    return defaultValue;
  }
}

