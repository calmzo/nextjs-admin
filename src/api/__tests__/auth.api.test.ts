/**
 * Auth API 测试
 */

import { AuthAPI } from '@/api/auth.api';
import request from '@/utils/request';
import type { LoginFormData, LoginResult, CaptchaInfo } from '@/types/api';

// Mock request
jest.mock('@/utils/request', () => {
  const mockRequest = jest.fn();
  return {
    __esModule: true,
    default: mockRequest,
  };
});

const mockedRequest = request as jest.MockedFunction<typeof request>;

describe('AuthAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('应该使用正确的参数调用登录接口', async () => {
      const loginData: LoginFormData = {
        username: 'testuser',
        password: 'password123',
        captchaKey: 'key123',
        captchaCode: 'code123',
        rememberMe: true,
      };

      const mockResult: LoginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      mockedRequest.mockResolvedValue(mockResult);

      const result = await AuthAPI.login(loginData);

      expect(mockedRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/admin/system/auth/login',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      expect(result).toEqual(mockResult);
    });

    it('应该正确处理没有验证码的登录', async () => {
      const loginData: LoginFormData = {
        username: 'testuser',
        password: 'password123',
      };

      const mockResult: LoginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      mockedRequest.mockResolvedValue(mockResult);

      await AuthAPI.login(loginData);

      expect(mockedRequest).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('应该使用正确的参数调用刷新Token接口', async () => {
      const refreshToken = 'refresh-token-123';
      const mockResult: LoginResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      mockedRequest.mockResolvedValue(mockResult);

      const result = await AuthAPI.refreshToken(refreshToken);

      expect(mockedRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/admin/system/auth/refresh-token',
          method: 'post',
          params: { refreshToken },
          headers: {
            Authorization: 'no-auth',
          },
        })
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('logout', () => {
    it('应该调用登出接口', async () => {
      mockedRequest.mockResolvedValue(undefined);

      await AuthAPI.logout();

      expect(mockedRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/admin/system/auth/logout',
          method: 'delete',
        })
      );
    });
  });

  describe('getCaptcha', () => {
    it('应该获取验证码信息', async () => {
      const mockCaptcha: CaptchaInfo = {
        captchaKey: 'key123',
        captchaImage: 'data:image/png;base64,...',
      };

      mockedRequest.mockResolvedValue(mockCaptcha);

      const result = await AuthAPI.getCaptcha();

      expect(mockedRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/admin/system/auth/captcha',
          method: 'get',
          headers: {
            Authorization: 'no-auth',
          },
        })
      );

      expect(result).toEqual(mockCaptcha);
    });
  });

  describe('forgotPassword', () => {
    it('应该调用忘记密码接口', async () => {
      const email = 'test@example.com';

      mockedRequest.mockResolvedValue(undefined);

      await AuthAPI.forgotPassword(email);

      expect(mockedRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/admin/system/auth/forgot-password',
          method: 'post',
          data: { email },
        })
      );
    });
  });

  describe('resetPassword', () => {
    it('应该调用重置密码接口', async () => {
      const resetData = {
        token: 'reset-token',
        password: 'newpassword',
        confirmPassword: 'newpassword',
      };

      mockedRequest.mockResolvedValue(undefined);

      await AuthAPI.resetPassword(resetData);

      expect(mockedRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/admin/system/auth/reset-password',
          method: 'post',
          data: resetData,
        })
      );
    });
  });
});

