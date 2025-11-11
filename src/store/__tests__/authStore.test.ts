/**
 * authStore 测试
 */

import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/store/authStore';
import { Auth } from '@/utils/auth';
import AuthAPI from '@/api/auth.api';
import UserAPI from '@/api/user.api';
import { usePermissionStore } from '@/store/permissionStore';
import logger from '@/utils/logger';

// Mock dependencies
jest.mock('@/utils/auth', () => ({
  Auth: {
    setTokens: jest.fn(),
    clearAuth: jest.fn(),
    isLoggedIn: jest.fn(),
  },
}));

jest.mock('@/api/auth.api', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/api/user.api', () => ({
  __esModule: true,
  default: {
    getInfo: jest.fn(),
  },
}));

jest.mock('@/store/permissionStore', () => ({
  usePermissionStore: {
    getState: jest.fn(() => ({
      clearCache: jest.fn(),
    })),
  },
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

const mockedAuth = Auth as jest.Mocked<typeof Auth>;
const mockedAuthAPI = AuthAPI as jest.Mocked<typeof AuthAPI>;
const mockedUserAPI = UserAPI as jest.Mocked<typeof UserAPI>;
const mockedPermissionStore = usePermissionStore as jest.Mocked<typeof usePermissionStore>;

describe('authStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置 store 状态
    useAuthStore.setState({
      isAuthenticated: false,
      userInfo: null,
      loading: false,
    });
  });

  describe('login', () => {
    it('应该成功登录并获取用户信息', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123',
        rememberMe: true,
      };

      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
      };

      mockedAuthAPI.login.mockResolvedValue(loginResult);
      mockedUserAPI.getInfo.mockResolvedValue(userInfo);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login(loginData);
      });

      expect(mockedAuthAPI.login).toHaveBeenCalledWith(loginData);
      expect(mockedAuth.setTokens).toHaveBeenCalledWith(
        'access-token',
        'refresh-token',
        true
      );
      expect(mockedUserAPI.getInfo).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.userInfo).toEqual(userInfo);
    });

    it('应该处理登录失败', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const error = new Error('登录失败');
      mockedAuthAPI.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login(loginData);
        } catch {
          // Expected error
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('应该成功登出并清除状态', async () => {
      mockedAuthAPI.logout.mockResolvedValue(undefined);
      const mockClearCache = jest.fn();
      mockedPermissionStore.getState.mockReturnValue({
        clearCache: mockClearCache,
      } as unknown as ReturnType<typeof usePermissionStore.getState>);

      const { result } = renderHook(() => useAuthStore());

      // 先设置登录状态
      useAuthStore.setState({
        isAuthenticated: true,
        userInfo: { id: '1', username: 'test', email: 'test@test.com' },
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockedAuthAPI.logout).toHaveBeenCalled();
      expect(mockedAuth.clearAuth).toHaveBeenCalled();
      expect(mockClearCache).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.userInfo).toBeNull();
    });

    it('即使登出API失败也应该清除本地状态', async () => {
      const error = new Error('登出失败');
      mockedAuthAPI.logout.mockRejectedValue(error);
      const mockClearCache = jest.fn();
      mockedPermissionStore.getState.mockReturnValue({
        clearCache: mockClearCache,
      } as unknown as ReturnType<typeof usePermissionStore.getState>);

      const { result } = renderHook(() => useAuthStore());

      // 先设置登录状态
      useAuthStore.setState({
        isAuthenticated: true,
        userInfo: { id: '1', username: 'test', email: 'test@test.com' },
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(logger.error).toHaveBeenCalledWith('登出API调用失败:', error);
      expect(mockedAuth.clearAuth).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('getUserInfo', () => {
    it('应该获取用户信息', async () => {
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
      };

      mockedUserAPI.getInfo.mockResolvedValue(userInfo);

      const { result } = renderHook(() => useAuthStore());

      let returnedUserInfo;
      await act(async () => {
        returnedUserInfo = await result.current.getUserInfo();
      });

      expect(mockedUserAPI.getInfo).toHaveBeenCalled();
      expect(result.current.userInfo).toEqual(userInfo);
      expect(result.current.isAuthenticated).toBe(true);
      expect(returnedUserInfo).toEqual(userInfo);
    });

    it('应该处理获取用户信息失败', async () => {
      const error = new Error('获取失败');
      mockedUserAPI.getInfo.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.getUserInfo();
        } catch {
          // Expected error
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.userInfo).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('应该清除所有会话信息', () => {
      const mockClearCache = jest.fn();
      mockedPermissionStore.getState.mockReturnValue({
        clearCache: mockClearCache,
      } as unknown as ReturnType<typeof usePermissionStore.getState>);

      const { result } = renderHook(() => useAuthStore());

      // 先设置登录状态
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          userInfo: { id: '1', username: 'test', email: 'test@test.com' },
        });
      });

      act(() => {
        result.current.clearSession();
      });

      expect(mockedAuth.clearAuth).toHaveBeenCalled();
      expect(mockClearCache).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.userInfo).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('应该设置加载状态', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.loading).toBe(false);
    });
  });
});

