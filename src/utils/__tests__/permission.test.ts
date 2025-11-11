/**
 * Permission 工具函数测试
 * 测试权限检查相关的所有功能
 */

import {
  hasAuth,
  hasAuthForTest,
  hasButtonAuth,
  hasRoleAuth,
  hasAllAuth,
  hasAnyAuth,
  DEPT_BUTTON_PERMISSIONS,
  USER_BUTTON_PERMISSIONS,
  deptButtonAuth,
  userButtonAuth,
  deptButtonAuthTest,
  userButtonAuthTest,
} from '@/utils/permission';
import { useAuthStore } from '@/store/authStore';

// 定义测试用的 AuthState 类型
type AuthState = ReturnType<typeof useAuthStore.getState>;

// Mock authStore
jest.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

describe('Permission Utils', () => {
  const mockGetState = useAuthStore.getState as jest.MockedFunction<typeof useAuthStore.getState>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasAuth', () => {
    it('should return false when userInfo is null', () => {
      mockGetState.mockReturnValue({
        userInfo: null,
      } as unknown as AuthState);

      expect(hasAuth('sys:user:add')).toBe(false);
    });

    it('should return true for ROOT user with button permission', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['ROOT'],
          perms: [],
        },
      } as unknown as AuthState);

      expect(hasAuth('sys:user:add', 'button')).toBe(true);
    });

    it('should return true when user has the permission', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: ['sys:user:add', 'sys:user:edit'],
        },
      } as unknown as AuthState);

      expect(hasAuth('sys:user:add', 'button')).toBe(true);
    });

    it('should return false when user does not have the permission', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: ['sys:user:edit'],
        },
      } as unknown as AuthState);

      expect(hasAuth('sys:user:add', 'button')).toBe(false);
    });

    it('should check role permissions when type is "role"', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: [],
        },
      } as unknown as AuthState);

      expect(hasAuth('admin', 'role')).toBe(true);
      expect(hasAuth('user', 'role')).toBe(false);
    });

    it('should handle array of permissions (OR logic)', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: ['sys:user:edit'],
        },
      } as unknown as AuthState);

      expect(hasAuth(['sys:user:add', 'sys:user:edit'], 'button')).toBe(true);
      expect(hasAuth(['sys:user:add', 'sys:user:delete'], 'button')).toBe(false);
    });

    it('should return false when perms is not an array', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: null,
        },
      } as unknown as AuthState);

      expect(hasAuth('sys:user:add', 'button')).toBe(false);
    });
  });

  describe('hasAuthForTest', () => {
    it('should return true for test permissions', () => {
      expect(hasAuthForTest('sys:user:add')).toBe(true);
      expect(hasAuthForTest('sys:role:add')).toBe(true);
    });

    it('should return false for non-test permissions', () => {
      expect(hasAuthForTest('sys:user:unknown')).toBe(false);
    });

    it('should handle array of permissions', () => {
      expect(hasAuthForTest(['sys:user:add', 'sys:user:edit'])).toBe(true);
      expect(hasAuthForTest(['sys:user:unknown', 'sys:user:add'])).toBe(true);
      expect(hasAuthForTest(['sys:user:unknown1', 'sys:user:unknown2'])).toBe(false);
    });
  });

  describe('hasButtonAuth', () => {
    it('should check button permission', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: ['sys:user:add'],
        },
      } as unknown as AuthState);

      expect(hasButtonAuth('sys:user:add')).toBe(true);
      expect(hasButtonAuth('sys:user:delete')).toBe(false);
    });
  });

  describe('hasRoleAuth', () => {
    it('should check role permission', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: [],
        },
      } as unknown as AuthState);

      expect(hasRoleAuth('admin')).toBe(true);
      expect(hasRoleAuth('user')).toBe(false);
    });
  });

  describe('hasAllAuth', () => {
    it('should return true when user has all permissions', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: ['sys:user:add', 'sys:user:edit', 'sys:user:delete'],
        },
      } as unknown as AuthState);

      expect(hasAllAuth(['sys:user:add', 'sys:user:edit'], 'button')).toBe(true);
    });

    it('should return false when user missing any permission', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: ['sys:user:add'],
        },
      } as unknown as AuthState);

      expect(hasAllAuth(['sys:user:add', 'sys:user:delete'], 'button')).toBe(false);
    });
  });

  describe('hasAnyAuth', () => {
    it('should return true when user has any permission', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: ['sys:user:add'],
        },
      } as unknown as AuthState);

      expect(hasAnyAuth(['sys:user:add', 'sys:user:delete'], 'button')).toBe(true);
    });

    it('should return false when user has none of the permissions', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: ['sys:user:edit'],
        },
      } as unknown as AuthState);

      expect(hasAnyAuth(['sys:user:add', 'sys:user:delete'], 'button')).toBe(false);
    });
  });

  describe('permission constants', () => {
    it('should have correct dept button permissions', () => {
      expect(DEPT_BUTTON_PERMISSIONS.SEARCH).toBe('sys:dept:query');
      expect(DEPT_BUTTON_PERMISSIONS.ADD).toBe('sys:dept:add');
      expect(DEPT_BUTTON_PERMISSIONS.EDIT).toBe('sys:dept:edit');
      expect(DEPT_BUTTON_PERMISSIONS.DELETE).toBe('sys:dept:delete');
    });

    it('should have correct user button permissions', () => {
      expect(USER_BUTTON_PERMISSIONS.SEARCH).toBe('sys:user:query');
      expect(USER_BUTTON_PERMISSIONS.ADD).toBe('sys:user:add');
      expect(USER_BUTTON_PERMISSIONS.EDIT).toBe('sys:user:edit');
      expect(USER_BUTTON_PERMISSIONS.DELETE).toBe('sys:user:delete');
    });
  });

  describe('convenience functions', () => {
    beforeEach(() => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: ['admin'],
          perms: ['sys:dept:add', 'sys:user:add'],
        },
      } as unknown as AuthState);
    });

    it('deptButtonAuth should check dept permissions', () => {
      expect(deptButtonAuth.add()).toBe(true);
      expect(deptButtonAuth.delete()).toBe(false);
    });

    it('userButtonAuth should check user permissions', () => {
      expect(userButtonAuth.add()).toBe(true);
      expect(userButtonAuth.delete()).toBe(false);
    });

    it('deptButtonAuthTest should use test permissions', () => {
      expect(deptButtonAuthTest.add()).toBe(true);
      expect(deptButtonAuthTest.search()).toBe(true);
    });

    it('userButtonAuthTest should use test permissions', () => {
      expect(userButtonAuthTest.add()).toBe(true);
      expect(userButtonAuthTest.search()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty permission arrays', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: [],
          perms: [],
        },
      } as unknown as AuthState);

      expect(hasAuth('sys:user:add')).toBe(false);
      expect(hasAllAuth([], 'button')).toBe(true);
      expect(hasAnyAuth([], 'button')).toBe(false);
    });

    it('should handle undefined userInfo properties', () => {
      mockGetState.mockReturnValue({
        userInfo: {
          roles: undefined,
          perms: undefined,
        },
      } as unknown as AuthState);

      expect(hasAuth('sys:user:add')).toBe(false);
    });
  });
});

