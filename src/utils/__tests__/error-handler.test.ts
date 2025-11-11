/**
 * 错误处理工具测试
 */

import {
  handleError,
  handleAuthError,
  handleApiError,
  handleNetworkError,
  handleHttpError,
  handleCaptchaError,
  createErrorFromResponse,
  safeAsync,
  safeAsyncWithDefault,
} from '@/utils/error-handler';
import {
  BusinessError,
  TokenExpiredError,
  CaptchaError,
  HttpError,
  ErrorCodes,
} from '@/types/error';
import { ResultEnum } from '@/enums/api/result.enum';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

describe('error-handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('应该显示错误提示', () => {
      const error = new Error('测试错误');
      
      handleError(error);
      
      expect(toast.error).toHaveBeenCalledWith('测试错误');
    });

    it('应该记录错误日志', () => {
      const error = new Error('测试错误');
      
      handleError(error);
      
      expect(logger.error).toHaveBeenCalledWith('Error occurred:', error);
    });

    it('应该支持自定义消息', () => {
      const error = new Error('原始错误');
      
      handleError(error, { customMessage: '自定义错误消息' });
      
      expect(toast.error).toHaveBeenCalledWith('自定义错误消息');
    });

    it('应该支持禁用 toast', () => {
      const error = new Error('测试错误');
      
      handleError(error, { showToast: false });
      
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('应该支持禁用日志', () => {
      const error = new Error('测试错误');
      
      handleError(error, { logError: false });
      
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('应该执行自定义回调', () => {
      const onError = jest.fn();
      const error = new Error('测试错误');
      
      handleError(error, { onError });
      
      expect(onError).toHaveBeenCalledWith(error);
    });

    it('应该处理非 Error 对象', () => {
      handleError('字符串错误');
      
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('handleAuthError', () => {
    it('应该处理验证码错误', () => {
      const error = {
        code: ErrorCodes.CAPTCHA_ERROR,
        msg: '验证码错误',
      };
      
      const result = handleAuthError(error);
      expect(result).toBe('验证码错误');
    });

    it('应该处理 Token 过期错误', () => {
      const error = {
        code: ResultEnum.ACCESS_TOKEN_INVALID,
        msg: 'Token 过期',
      };
      
      const result = handleAuthError(error);
      expect(result).toBe('登录已过期，请重新登录');
    });

    it('应该处理 Refresh Token 过期错误', () => {
      const error = {
        code: ResultEnum.REFRESH_TOKEN_INVALID,
        msg: 'Refresh Token 过期',
      };
      
      const result = handleAuthError(error);
      expect(result).toBe('会话已过期，请重新登录');
    });

    it('应该处理登录失败错误', () => {
      const error = {
        code: ErrorCodes.LOGIN_FAILED,
        msg: '用户名或密码错误',
      };
      
      const result = handleAuthError(error);
      expect(result).toBe('用户名或密码错误');
    });

    it('应该处理普通 Error 对象', () => {
      const error = new Error('认证失败');
      const result = handleAuthError(error);
      expect(result).toBe('认证失败');
    });

    it('应该返回默认消息当错误类型未知时', () => {
      const result = handleAuthError('未知错误');
      expect(result).toBe('登录失败，请重试');
    });
  });

  describe('handleApiError', () => {
    it('应该处理 API 错误', () => {
      const error = {
        code: 'B0001',
        msg: '业务错误',
      };
      
      handleApiError(error);
      
      expect(toast.error).toHaveBeenCalled();
    });

    it('应该处理 Token 过期错误', () => {
      const error = {
        code: ResultEnum.ACCESS_TOKEN_INVALID,
        msg: 'Token 过期',
      };
      
      handleApiError(error);
      
      expect(toast.error).toHaveBeenCalledWith('登录已过期，请重新登录');
    });

    it('应该支持自定义回调', () => {
      const onError = jest.fn();
      const error = new Error('API 错误');
      
      handleApiError(error, { onError });
      
      expect(onError).toHaveBeenCalledWith(error);
    });

    it('应该记录错误日志', () => {
      const error = new Error('API 错误');
      
      handleApiError(error);
      
      expect(logger.error).toHaveBeenCalledWith('API Error:', error);
    });
  });

  describe('handleNetworkError', () => {
    it('应该处理网络错误', () => {
      const error = new Error('网络连接失败');
      
      handleNetworkError(error);
      
      expect(toast.error).toHaveBeenCalledWith('网络连接失败');
    });

    it('应该处理超时错误', () => {
      const error = new Error('timeout');
      
      handleNetworkError(error);
      
      expect(toast.error).toHaveBeenCalledWith('请求超时，请稍后重试');
    });

    it('应该处理 Network Error', () => {
      const error = new Error('Network Error');
      
      handleNetworkError(error);
      
      expect(toast.error).toHaveBeenCalledWith('网络连接失败，请检查网络设置');
    });

    it('应该使用默认消息当错误类型未知时', () => {
      handleNetworkError('未知错误');
      
      expect(toast.error).toHaveBeenCalledWith('网络连接失败，请检查网络设置');
    });

    it('应该记录错误日志', () => {
      const error = new Error('网络错误');
      
      handleNetworkError(error);
      
      expect(logger.error).toHaveBeenCalledWith('Network Error:', error);
    });
  });

  describe('handleHttpError', () => {
    it('应该处理 401 未授权错误', () => {
      const error = {
        code: ErrorCodes.UNAUTHORIZED,
        status: 401,
        msg: '未授权',
      };
      
      handleHttpError(error);
      
      expect(toast.error).toHaveBeenCalledWith('未授权，请重新登录');
    });

    it('应该处理 403 禁止访问错误', () => {
      const error = {
        code: ErrorCodes.FORBIDDEN,
        status: 403,
        msg: '禁止访问',
      };
      
      handleHttpError(error);
      
      expect(toast.error).toHaveBeenCalledWith('访问被拒绝，权限不足');
    });

    it('应该处理 404 未找到错误', () => {
      const error = {
        code: ErrorCodes.NOT_FOUND,
        status: 404,
        msg: '未找到',
      };
      
      handleHttpError(error);
      
      expect(toast.error).toHaveBeenCalledWith('请求的资源不存在');
    });

    it('应该处理 429 请求过多错误', () => {
      const error = {
        code: ErrorCodes.TOO_MANY_REQUESTS,
        status: 429,
        msg: '请求过多',
      };
      
      handleHttpError(error);
      
      expect(toast.error).toHaveBeenCalledWith('请求过于频繁，请稍后再试');
    });

    it('应该处理 500 服务器错误', () => {
      const error = {
        code: 'SERVER_ERROR',
        status: 500,
        msg: '服务器错误',
      };
      
      handleHttpError(error);
      
      expect(toast.error).toHaveBeenCalledWith('服务器错误，请稍后重试');
    });

    it('应该使用错误消息当存在时', () => {
      const error = {
        code: 'CUSTOM_ERROR',
        status: 400,
        msg: '自定义错误消息',
      };
      
      handleHttpError(error);
      
      expect(toast.error).toHaveBeenCalledWith('自定义错误消息');
    });
  });

  describe('handleCaptchaError', () => {
    it('应该处理验证码错误', () => {
      const error = {
        code: ErrorCodes.CAPTCHA_ERROR,
        msg: '验证码错误',
      };
      
      handleCaptchaError(error);
      
      expect(toast.error).toHaveBeenCalledWith('验证码错误');
    });

    it('应该调用刷新验证码回调', () => {
      const onRefreshCaptcha = jest.fn();
      const error = {
        code: ErrorCodes.CAPTCHA_ERROR,
        msg: '验证码错误',
      };
      
      handleCaptchaError(error, onRefreshCaptcha);
      
      expect(onRefreshCaptcha).toHaveBeenCalled();
    });

    it('应该使用默认消息当错误类型不匹配时', () => {
      const error = new Error('其他错误');
      
      handleCaptchaError(error);
      
      expect(toast.error).toHaveBeenCalledWith('验证码错误，请重新输入');
    });
  });

  describe('createErrorFromResponse', () => {
    it('应该创建 TokenExpiredError', () => {
      const response = {
        code: ResultEnum.ACCESS_TOKEN_INVALID,
        msg: 'Token 过期',
      };
      
      const error = createErrorFromResponse(response);
      
      expect(error).toBeInstanceOf(TokenExpiredError);
      expect(error.message).toBe('Token 过期');
    });

    it('应该创建 CaptchaError', () => {
      const response = {
        code: ErrorCodes.CAPTCHA_ERROR,
        msg: '验证码错误',
      };
      
      const error = createErrorFromResponse(response);
      
      expect(error).toBeInstanceOf(CaptchaError);
      expect(error.message).toBe('验证码错误');
    });

    it('应该创建 HttpError', () => {
      const response = {
        code: 'HTTP_ERROR',
        msg: 'HTTP 错误',
        status: 500,
      };
      
      const error = createErrorFromResponse(response);
      
      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe('HTTP 错误');
      expect((error as HttpError).statusCode).toBe(500);
    });

    it('应该创建 BusinessError', () => {
      const response = {
        code: 'B0001',
        msg: '业务错误',
        data: { field: 'value' },
      };
      
      const error = createErrorFromResponse(response);
      
      expect(error).toBeInstanceOf(BusinessError);
      expect(error.message).toBe('业务错误');
    });
  });

  describe('safeAsync', () => {
    it('应该成功执行异步函数', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      
      const result = await safeAsync(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalled();
    });

    it('应该在错误时返回 null', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('测试错误'));
      
      const result = await safeAsync(fn);
      
      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalled();
    });

    it('应该支持自定义错误处理选项', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('测试错误'));
      
      await safeAsync(fn, { showToast: false });
      
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('safeAsyncWithDefault', () => {
    it('应该成功执行异步函数', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      
      const result = await safeAsyncWithDefault(fn, 'default');
      
      expect(result).toBe('success');
    });

    it('应该在错误时返回默认值', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('测试错误'));
      
      const result = await safeAsyncWithDefault(fn, 'default');
      
      expect(result).toBe('default');
    });

    it('应该支持对象默认值', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('测试错误'));
      const defaultValue = { name: 'default' };
      
      const result = await safeAsyncWithDefault(fn, defaultValue);
      
      expect(result).toEqual(defaultValue);
    });
  });
});

