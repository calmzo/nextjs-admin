/**
 * Auth 工具类测试
 * 测试身份验证相关的所有功能
 */

import { Auth } from '@/utils/auth';

describe('Auth', () => {
  beforeEach(() => {
    // 每个测试前清除所有存储
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('setTokens', () => {
    it('should save tokens to localStorage when rememberMe is true', () => {
      Auth.setTokens('access-token-123', 'refresh-token-456', true);

      expect(localStorage.getItem('access_token')).toBe('access-token-123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token-456');
      expect(sessionStorage.getItem('access_token')).toBeNull();
      expect(sessionStorage.getItem('refresh_token')).toBeNull();
      expect(Auth.getRememberMe()).toBe(true);
    });

    it('should save tokens to sessionStorage when rememberMe is false', () => {
      Auth.setTokens('access-token-123', 'refresh-token-456', false);

      expect(sessionStorage.getItem('access_token')).toBe('access-token-123');
      expect(sessionStorage.getItem('refresh_token')).toBe('refresh-token-456');
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(Auth.getRememberMe()).toBe(false);
    });

    it('should clear opposite storage when switching rememberMe state', () => {
      // 先设置为记住我
      Auth.setTokens('access-1', 'refresh-1', true);
      expect(localStorage.getItem('access_token')).toBe('access-1');

      // 切换为不记住我
      Auth.setTokens('access-2', 'refresh-2', false);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(sessionStorage.getItem('access_token')).toBe('access-2');
    });
  });

  describe('getAccessToken', () => {
    it('should return empty string when no token exists', () => {
      expect(Auth.getAccessToken()).toBe('');
    });

    it('should return token from localStorage when rememberMe is true', () => {
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('access_token', 'token-from-local');
      
      expect(Auth.getAccessToken()).toBe('token-from-local');
    });

    it('should return token from sessionStorage when rememberMe is false', () => {
      localStorage.setItem('remember_me', 'false');
      sessionStorage.setItem('access_token', 'token-from-session');
      
      expect(Auth.getAccessToken()).toBe('token-from-session');
    });

    it('should return empty string when window is undefined', () => {
      // 模拟 SSR 环境
      const originalWindow = global.window;
      // @ts-expect-error - 测试需要
      delete global.window;
      
      expect(Auth.getAccessToken()).toBe('');
      
      // 恢复 window
      global.window = originalWindow;
    });
  });

  describe('getRefreshToken', () => {
    it('should return empty string when no token exists', () => {
      expect(Auth.getRefreshToken()).toBe('');
    });

    it('should return token from localStorage when rememberMe is true', () => {
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('refresh_token', 'refresh-from-local');
      
      expect(Auth.getRefreshToken()).toBe('refresh-from-local');
    });

    it('should return token from sessionStorage when rememberMe is false', () => {
      localStorage.setItem('remember_me', 'false');
      sessionStorage.setItem('refresh_token', 'refresh-from-session');
      
      expect(Auth.getRefreshToken()).toBe('refresh-from-session');
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when no token exists', () => {
      expect(Auth.isLoggedIn()).toBe(false);
    });

    it('should return true when access token exists in localStorage', () => {
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('access_token', 'some-token');
      
      expect(Auth.isLoggedIn()).toBe(true);
    });

    it('should return true when access token exists in sessionStorage', () => {
      localStorage.setItem('remember_me', 'false');
      sessionStorage.setItem('access_token', 'some-token');
      
      expect(Auth.isLoggedIn()).toBe(true);
    });

    it('should return false when token is empty string', () => {
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('access_token', '');
      
      expect(Auth.isLoggedIn()).toBe(false);
    });
  });

  describe('getRememberMe', () => {
    it('should return false by default', () => {
      expect(Auth.getRememberMe()).toBe(false);
    });

    it('should return true when remember_me is set to "true"', () => {
      localStorage.setItem('remember_me', 'true');
      expect(Auth.getRememberMe()).toBe(true);
    });

    it('should return false when remember_me is set to "false"', () => {
      localStorage.setItem('remember_me', 'false');
      expect(Auth.getRememberMe()).toBe(false);
    });

    it('should return false when remember_me is set to other value', () => {
      localStorage.setItem('remember_me', 'yes');
      expect(Auth.getRememberMe()).toBe(false);
    });

    it('should return false when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - 测试需要
      delete global.window;
      
      expect(Auth.getRememberMe()).toBe(false);
      
      global.window = originalWindow;
    });
  });

  describe('clearAuth', () => {
    it('should clear all tokens from both storages', () => {
      localStorage.setItem('access_token', 'token1');
      localStorage.setItem('refresh_token', 'refresh1');
      sessionStorage.setItem('access_token', 'token2');
      sessionStorage.setItem('refresh_token', 'refresh2');

      Auth.clearAuth();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(sessionStorage.getItem('access_token')).toBeNull();
      expect(sessionStorage.getItem('refresh_token')).toBeNull();
    });

    it('should not clear remember_me preference', () => {
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('access_token', 'token');

      Auth.clearAuth();

      expect(localStorage.getItem('remember_me')).toBe('true');
      expect(localStorage.getItem('access_token')).toBeNull();
    });

    it('should handle clearing when storage is empty', () => {
      expect(() => Auth.clearAuth()).not.toThrow();
    });
  });

  describe('clearRememberMe', () => {
    it('should clear remember_me from localStorage', () => {
      localStorage.setItem('remember_me', 'true');
      
      Auth.clearRememberMe();
      
      expect(localStorage.getItem('remember_me')).toBeNull();
    });

    it('should not affect tokens', () => {
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('access_token', 'token');
      
      Auth.clearRememberMe();
      
      expect(localStorage.getItem('access_token')).toBe('token');
    });
  });

  describe('integration tests', () => {
    it('should handle complete login and logout flow', () => {
      // 登录 - 记住我
      Auth.setTokens('access-123', 'refresh-456', true);
      expect(Auth.isLoggedIn()).toBe(true);
      expect(Auth.getAccessToken()).toBe('access-123');
      expect(Auth.getRefreshToken()).toBe('refresh-456');
      expect(Auth.getRememberMe()).toBe(true);

      // 登出
      Auth.clearAuth();
      expect(Auth.isLoggedIn()).toBe(false);
      expect(Auth.getAccessToken()).toBe('');
      expect(Auth.getRefreshToken()).toBe('');
      // 记住我状态应该保留
      expect(Auth.getRememberMe()).toBe(true);

      // 清除记住我
      Auth.clearRememberMe();
      expect(Auth.getRememberMe()).toBe(false);
    });

    it('should handle switching between rememberMe states', () => {
      // 初始状态：不记住我
      Auth.setTokens('token1', 'refresh1', false);
      expect(Auth.getAccessToken()).toBe('token1');
      expect(Auth.getRememberMe()).toBe(false);

      // 切换为记住我
      Auth.setTokens('token2', 'refresh2', true);
      expect(Auth.getAccessToken()).toBe('token2');
      expect(Auth.getRememberMe()).toBe(true);
      expect(sessionStorage.getItem('access_token')).toBeNull();
    });
  });
});

