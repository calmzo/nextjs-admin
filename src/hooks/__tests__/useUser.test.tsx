/**
 * useUser Hooks 测试
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useUserList,
  useUserOperations,
  useUserOptions,
  useUserForm,
  useUserImportExport,
} from '@/hooks/useUser';
import { UserAPI, UserStatus } from '@/api/user.api';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';

// Mock UserAPI
jest.mock('@/api/user.api', () => {
  const actual = jest.requireActual('@/api/user.api');
  return {
    ...actual,
    UserAPI: {
      getPage: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteByIds: jest.fn(),
      updateStatus: jest.fn(),
      resetPassword: jest.fn(),
      getOptions: jest.fn(),
      getFormData: jest.fn(),
      export: jest.fn(),
      downloadTemplate: jest.fn(),
      import: jest.fn(),
    },
  };
});

// Mock toast
jest.mock('@/components/common/Toaster', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock error-handler
jest.mock('@/utils/error-handler', () => ({
  handleError: jest.fn(() => {
    // Don't throw, just handle the error silently in tests
  }),
  extractErrorMessage: jest.fn((error) => {
    if (error instanceof Error) return error.message;
    return 'Unknown error';
  }),
}));

const mockedUserAPI = UserAPI as jest.Mocked<typeof UserAPI>;
const mockedToast = toast as jest.Mocked<typeof toast>;

describe('useUser Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useUserList', () => {
    it('应该初始化并获取用户列表', async () => {
      const mockResponse = {
        list: [
          { id: 1, username: 'user1', email: 'user1@test.com' },
          { id: 2, username: 'user2', email: 'user2@test.com' },
        ],
        total: 2,
        pageNum: 1,
        pageSize: 10,
      };

      mockedUserAPI.getPage.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUserList());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockResponse.list);
      expect(result.current.pagination.total).toBe(2);
    });

    it('应该处理获取用户列表的错误', async () => {
      const error = new Error('获取失败');
      mockedUserAPI.getPage.mockRejectedValue(error);

      const { result } = renderHook(() => useUserList());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 3000 }
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(handleError).toHaveBeenCalled();
    });

    it('应该更新搜索参数', () => {
      const { result } = renderHook(() => useUserList());

      act(() => {
        result.current.updateSearchParams({ keywords: 'test' });
      });

      expect(result.current.searchParams.keywords).toBe('test');
      expect(result.current.pagination.current).toBe(1);
    });

    it('应该更新分页', () => {
      const { result } = renderHook(() => useUserList());

      act(() => {
        result.current.updatePagination({ current: 2, pageSize: 20 });
      });

      expect(result.current.pagination.current).toBe(2);
      expect(result.current.pagination.pageSize).toBe(20);
    });

    it('应该重置搜索', () => {
      const { result } = renderHook(() => useUserList());

      act(() => {
        result.current.updateSearchParams({ keywords: 'test' });
      });

      act(() => {
        result.current.resetSearch();
      });

      expect(result.current.searchParams.keywords).toBe('');
      expect(result.current.pagination.current).toBe(1);
    });

    it('应该手动调用 fetchUserList', async () => {
      const mockResponse = {
        list: [{ id: 1, username: 'user1' }],
        total: 1,
        pageNum: 1,
        pageSize: 10,
      };

      mockedUserAPI.getPage.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUserList());

      // 等待初始化完成
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 手动调用 fetchUserList
      await act(async () => {
        await result.current.fetchUserList({ keywords: 'test' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockedUserAPI.getPage).toHaveBeenCalled();
    });
  });

  describe('useUserOperations', () => {
    it('应该创建用户', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
      };

      mockedUserAPI.create.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUserOperations());

      let success = false;
      await act(async () => {
        success = await result.current.create(userData);
      });

      expect(success).toBe(true);
      expect(mockedUserAPI.create).toHaveBeenCalledWith(userData);
      expect(mockedToast.success).toHaveBeenCalledWith('用户创建成功');
    });

    it('应该处理创建用户失败', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
      };

      const error = new Error('创建失败');
      mockedUserAPI.create.mockRejectedValue(error);

      const { result } = renderHook(() => useUserOperations());

      let success = true;
      await act(async () => {
        success = await result.current.create(userData);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeDefined();
    });

    it('应该更新用户', async () => {
      const userData = {
        username: 'updateduser',
        email: 'updated@test.com',
      };

      mockedUserAPI.update.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUserOperations());

      let success = false;
      await act(async () => {
        success = await result.current.update(1, userData);
      });

      expect(success).toBe(true);
      expect(mockedUserAPI.update).toHaveBeenCalledWith(1, userData);
      expect(mockedToast.success).toHaveBeenCalledWith('用户更新成功');
    });

    it('应该处理更新用户失败', async () => {
      const userData = {
        username: 'updateduser',
        email: 'updated@test.com',
      };

      const error = new Error('更新失败');
      mockedUserAPI.update.mockRejectedValue(error);

      const { result } = renderHook(() => useUserOperations());

      let success = true;
      await act(async () => {
        success = await result.current.update(1, userData);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeDefined();
    });

    it('应该删除用户', async () => {
      const ids = [1, 2, 3];

      mockedUserAPI.deleteByIds.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUserOperations());

      let success = false;
      await act(async () => {
        success = await result.current.remove(ids);
      });

      expect(success).toBe(true);
      expect(mockedUserAPI.deleteByIds).toHaveBeenCalledWith(ids);
      expect(mockedToast.success).toHaveBeenCalledWith('成功删除 3 个用户');
    });

    it('应该处理删除用户失败', async () => {
      const ids = [1, 2, 3];
      const error = new Error('删除失败');
      mockedUserAPI.deleteByIds.mockRejectedValue(error);

      const { result } = renderHook(() => useUserOperations());

      let success = true;
      await act(async () => {
        success = await result.current.remove(ids);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeDefined();
    });

    it('应该更新用户状态为启用', async () => {
      mockedUserAPI.updateStatus.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUserOperations());

      let success = false;
      await act(async () => {
        success = await result.current.updateStatus(1, UserStatus.ENABLED);
      });

      expect(success).toBe(true);
      expect(mockedUserAPI.updateStatus).toHaveBeenCalledWith(1, UserStatus.ENABLED);
      expect(mockedToast.success).toHaveBeenCalledWith('用户启用成功');
    });

    it('应该更新用户状态为禁用', async () => {
      mockedUserAPI.updateStatus.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUserOperations());

      let success = false;
      await act(async () => {
        success = await result.current.updateStatus(1, UserStatus.DISABLED);
      });

      expect(success).toBe(true);
      expect(mockedUserAPI.updateStatus).toHaveBeenCalledWith(1, UserStatus.DISABLED);
      expect(mockedToast.success).toHaveBeenCalledWith('用户禁用成功');
    });

    it('应该处理更新用户状态失败', async () => {
      const error = new Error('更新状态失败');
      mockedUserAPI.updateStatus.mockRejectedValue(error);

      const { result } = renderHook(() => useUserOperations());

      let success = true;
      await act(async () => {
        success = await result.current.updateStatus(1, UserStatus.ENABLED);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeDefined();
    });

    it('应该重置密码', async () => {
      mockedUserAPI.resetPassword.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUserOperations());

      let success = false;
      await act(async () => {
        success = await result.current.resetPassword(1, 'newpassword');
      });

      expect(success).toBe(true);
      expect(mockedUserAPI.resetPassword).toHaveBeenCalledWith(1, 'newpassword');
    });

    it('应该处理重置密码失败', async () => {
      const error = new Error('重置密码失败');
      mockedUserAPI.resetPassword.mockRejectedValue(error);

      const { result } = renderHook(() => useUserOperations());

      let success = true;
      await act(async () => {
        success = await result.current.resetPassword(1, 'newpassword');
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useUserOptions', () => {
    it('应该获取用户选项', async () => {
      const mockOptions = [
        { label: 'User 1', value: 1 },
        { label: 'User 2', value: 2 },
      ];

      mockedUserAPI.getOptions.mockResolvedValue(mockOptions);

      const { result } = renderHook(() => useUserOptions());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.options).toEqual(mockOptions);
    });

    it('应该处理获取选项失败', async () => {
      const error = new Error('获取失败');
      mockedUserAPI.getOptions.mockRejectedValue(error);

      const { result } = renderHook(() => useUserOptions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('应该手动调用 fetchOptions', async () => {
      const mockOptions = [
        { label: 'User 1', value: 1 },
        { label: 'User 2', value: 2 },
      ];

      mockedUserAPI.getOptions.mockResolvedValue(mockOptions);

      const { result } = renderHook(() => useUserOptions());

      // 等待初始化完成
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 手动调用 fetchOptions
      await act(async () => {
        await result.current.fetchOptions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockedUserAPI.getOptions).toHaveBeenCalled();
    });
  });

  describe('useUserForm', () => {
    it('应该获取用户表单数据', async () => {
      const mockFormData = {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
      };

      mockedUserAPI.getFormData.mockResolvedValue(mockFormData);

      const { result } = renderHook(() => useUserForm());

      await act(async () => {
        await result.current.fetchFormData(1);
      });

      expect(result.current.formData).toEqual(mockFormData);
      expect(result.current.loading).toBe(false);
    });

    it('应该处理获取表单数据失败', async () => {
      const error = new Error('获取失败');
      mockedUserAPI.getFormData.mockRejectedValue(error);

      const { result } = renderHook(() => useUserForm());

      await act(async () => {
        await result.current.fetchFormData(1);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    it('应该重置表单数据', () => {
      const { result } = renderHook(() => useUserForm());

      act(() => {
        result.current.resetFormData();
      });

      expect(result.current.formData).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('useUserImportExport', () => {
    // Mock window.URL and document methods
    const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = jest.fn();
    const mockClick = jest.fn();
    let mockLinkElement: HTMLElement;

    beforeEach(() => {
      // Create a mock link element
      mockLinkElement = {
        click: mockClick,
        href: '',
        download: '',
      } as unknown as HTMLAnchorElement;

      // Ensure document.body exists
      if (!document.body) {
        const body = document.createElement('body');
        document.body = body;
      }

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
      
      // Store original createElement
      const originalCreateElement = document.createElement.bind(document);
      
      // Mock document.createElement to return our mock link for 'a' tags
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLinkElement as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

      // Mock appendChild and removeChild
      jest.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => node);
      jest.spyOn(document.body, 'removeChild').mockImplementation((node: Node) => node);
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it('应该导出用户（Blob响应）', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mockedUserAPI.export = jest.fn().mockResolvedValue(mockBlob);

      const { result } = renderHook(() => useUserImportExport());

      await act(async () => {
        await result.current.exportUsers({ keywords: 'test' });
      });

      expect(mockedUserAPI.export).toHaveBeenCalledWith({ keywords: 'test' });
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockedToast.success).toHaveBeenCalledWith('用户导出成功');
    });

    it('应该导出用户（Response对象）', async () => {
      const mockResponse = {
        data: new Blob(['test']),
        headers: {
          'content-disposition': 'attachment; filename="test.xlsx"',
        },
      };
      mockedUserAPI.export = jest.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUserImportExport());

      await act(async () => {
        await result.current.exportUsers({ keywords: 'test' });
      });

      expect(mockedUserAPI.export).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockedToast.success).toHaveBeenCalledWith('用户导出成功');
    });

    it('应该处理导出用户失败', async () => {
      const error = new Error('导出失败');
      mockedUserAPI.export = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useUserImportExport());

      await act(async () => {
        await result.current.exportUsers({ keywords: 'test' });
      });

      expect(handleError).toHaveBeenCalledWith(error, { customMessage: '导出用户失败' });
    });

    it('应该下载导入模板（Blob响应）', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mockedUserAPI.downloadTemplate = jest.fn().mockResolvedValue(mockBlob);

      const { result } = renderHook(() => useUserImportExport());

      await act(async () => {
        await result.current.downloadTemplate();
      });

      expect(mockedUserAPI.downloadTemplate).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockedToast.success).toHaveBeenCalledWith('模板下载成功');
    });

    it('应该处理下载模板失败', async () => {
      const error = new Error('下载失败');
      mockedUserAPI.downloadTemplate = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useUserImportExport());

      await act(async () => {
        await result.current.downloadTemplate();
      });

      expect(handleError).toHaveBeenCalledWith(error, { customMessage: '下载模板失败' });
    });

    it('应该导入用户（全部成功）', async () => {
      const mockResult = {
        code: '0',
        validCount: 10,
        invalidCount: 0,
        messageList: [],
      };
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mockedUserAPI.import = jest.fn().mockResolvedValue(mockResult);

      const { result } = renderHook(() => useUserImportExport());

      let importResult;
      await act(async () => {
        importResult = await result.current.importUsers(1, mockFile);
      });

      expect(mockedUserAPI.import).toHaveBeenCalledWith(1, mockFile);
      expect(mockedToast.success).toHaveBeenCalledWith('导入成功，共导入 10 条数据');
      expect(importResult).toEqual(mockResult);
    });

    it('应该导入用户（部分成功）', async () => {
      const mockResult = {
        code: '0',
        validCount: 8,
        invalidCount: 2,
        messageList: ['错误1', '错误2'],
      };
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mockedUserAPI.import = jest.fn().mockResolvedValue(mockResult);

      const { result } = renderHook(() => useUserImportExport());

      await act(async () => {
        await result.current.importUsers(1, mockFile);
      });

      expect(mockedToast.warning).toHaveBeenCalledWith('部分导入成功，有效数据 8 条，无效数据 2 条');
    });

    it('应该导入用户（全部失败）', async () => {
      const mockResult = {
        code: '0',
        validCount: 0,
        invalidCount: 5,
        messageList: ['错误1', '错误2', '错误3', '错误4', '错误5'],
      };
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mockedUserAPI.import = jest.fn().mockResolvedValue(mockResult);

      const { result } = renderHook(() => useUserImportExport());

      await act(async () => {
        await result.current.importUsers(1, mockFile);
      });

      expect(mockedToast.error).toHaveBeenCalledWith('导入失败，所有 5 条数据均无效');
    });

    it('应该处理导入用户失败', async () => {
      const error = new Error('导入失败');
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mockedUserAPI.import = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useUserImportExport());

      await expect(
        act(async () => {
          await result.current.importUsers(1, mockFile);
        })
      ).rejects.toThrow('导入失败');

      expect(handleError).toHaveBeenCalledWith(error, { customMessage: '导入用户失败' });
    });
  });
});

