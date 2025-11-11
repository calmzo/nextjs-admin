/**
 * 统一错误类型定义
 */

/**
 * API 错误响应接口
 */
export interface ApiErrorResponse {
  code: string | number;
  msg?: string;
  message?: string;
  data?: unknown;
  status?: number;
}

/**
 * 应用错误基类
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AppError {
  constructor(message: string = '网络连接失败，请检查网络设置') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * 业务错误（API 返回的业务错误）
 */
export class BusinessError extends AppError {
  constructor(message: string, code: string | number, data?: unknown) {
    super(message, String(code), undefined, data);
    this.name = 'BusinessError';
  }
}

/**
 * 认证错误
 */
export class AuthError extends AppError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = 'AuthError';
  }
}

/**
 * Token 过期错误
 */
export class TokenExpiredError extends AuthError {
  constructor(message: string = '登录已过期，请重新登录') {
    super(message, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

/**
 * 验证码错误
 */
export class CaptchaError extends BusinessError {
  constructor(message: string = '验证码错误，请重新输入') {
    super(message, 'A0214');
    this.name = 'CaptchaError';
  }
}

/**
 * HTTP 状态错误
 */
export class HttpError extends AppError {
  constructor(
    message: string,
    public statusCode: number,
    code?: string
  ) {
    super(message, code || `HTTP_${statusCode}`, statusCode);
    this.name = 'HttpError';
  }
}

/**
 * 错误代码常量
 */
export const ErrorCodes = {
  // 认证相关
  TOKEN_EXPIRED: 'A0230',
  REFRESH_TOKEN_EXPIRED: 'A0231',
  CAPTCHA_ERROR: 'A0214',
  LOGIN_FAILED: 'A0001',
  SESSION_EXPIRED: 'A0002',
  
  // 网络相关
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // HTTP 状态码
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 判断是否为 API 错误响应
 */
export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'msg' in error || 'message' in error)
  );
}

/**
 * 判断是否为 AppError 实例
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 从错误对象中提取错误信息
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (isApiErrorResponse(error)) {
    return error.msg || error.message || '未知错误';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '未知错误';
}

/**
 * 从错误对象中提取错误代码
 */
export function extractErrorCode(error: unknown): string | number | undefined {
  if (isAppError(error)) {
    return error.code;
  }
  
  if (isApiErrorResponse(error)) {
    return error.code;
  }
  
  return undefined;
}

