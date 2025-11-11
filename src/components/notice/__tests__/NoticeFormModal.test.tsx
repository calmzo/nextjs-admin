/**
 * 通知表单弹窗组件测试
 * 测试新增通知表单提交功能
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NoticeFormModal from '../NoticeFormModal';
import NoticeAPI from '@/api/notice.api';
import { UserAPI } from '@/api/user.api';
import { useDictItems } from '@/hooks/useDict';
import { toast } from '@/components/common/Toaster';
import type { DictItemPageVO } from '@/api/dict.api';

// Mock 依赖
jest.mock('@/api/notice.api');
jest.mock('@/api/user.api');
jest.mock('@/hooks/useDict');
jest.mock('@/components/common/Toaster', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock 图标组件
jest.mock('@/icons', () => ({
  ChevronDownIcon: () => <svg data-testid="chevron-down-icon" />,
}));

// Mock RichTextEditor 组件（简化测试）
jest.mock('@/components/form/RichTextEditor', () => {
  return function MockRichTextEditor({ 
    value, 
    onChange, 
    placeholder 
  }: {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) {
    return (
      <div data-testid="rich-text-editor">
        <textarea
          data-testid="rich-text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  };
});

// Mock MultiSelect 组件
jest.mock('@/components/form/MultiSelect', () => {
  return function MockMultiSelect({ 
    options, 
    defaultSelected, 
    onChange 
  }: {
    options: Array<{ value: string; text: string; selected: boolean }>;
    defaultSelected?: string[];
    onChange?: (selected: string[]) => void;
  }) {
    return (
      <div data-testid="multi-select">
        {options.map((opt) => (
          <label key={opt.value}>
            <input
              type="checkbox"
              checked={opt.selected}
              onChange={(e) => {
                const newSelected = e.target.checked
                  ? [...(defaultSelected || []), opt.value]
                  : (defaultSelected || []).filter((v: string) => v !== opt.value);
                onChange?.(newSelected);
              }}
            />
            {opt.text}
          </label>
        ))}
      </div>
    );
  };
});

const mockNoticeAPI = NoticeAPI as jest.Mocked<typeof NoticeAPI>;
const mockUserAPI = UserAPI as jest.Mocked<typeof UserAPI>;
const mockUseDictItems = useDictItems as jest.MockedFunction<typeof useDictItems>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('NoticeFormModal - 新增通知表单提交', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  // 默认字典数据
  const mockNoticeTypeItems: DictItemPageVO[] = [
    { id: '1', value: '1', label: '通知', sort: 1, status: 1 },
    { id: '2', value: '2', label: '公告', sort: 2, status: 1 },
  ];

  const mockNoticeLevelItems: DictItemPageVO[] = [
    { id: '1', value: 'L', label: '低', sort: 1, status: 1 },
    { id: '2', value: 'M', label: '中', sort: 2, status: 1 },
    { id: '3', value: 'H', label: '高', sort: 3, status: 1 },
  ];

  // 默认用户选项
  const mockUserOptions = [
    { value: '1', label: '用户1' },
    { value: '2', label: '用户2' },
    { value: '3', label: '用户3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useDictItems
    mockUseDictItems.mockImplementation((dictCode: string) => {
      const refetch = jest.fn().mockResolvedValue(undefined);
      if (dictCode === 'notice_type') {
        return { items: mockNoticeTypeItems, loading: false, refetch };
      }
      if (dictCode === 'notice_level') {
        return { items: mockNoticeLevelItems, loading: false, refetch };
      }
      return { items: [], loading: false, refetch };
    });

    // Mock API 方法
    mockNoticeAPI.create.mockResolvedValue(undefined);
    mockUserAPI.getOptions = jest.fn().mockResolvedValue(mockUserOptions);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('表单渲染', () => {
    it('应该在新增模式下正确渲染表单', () => {
      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('新增通知公告')).toBeInTheDocument();
      expect(screen.getByLabelText(/通知标题/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/通知类型/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/通知等级/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/目标类型/i)).toBeInTheDocument();
    });

    it('应该显示必填字段标记', () => {
      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 检查必填字段（通过 placeholder 或 label 查找）
      const titleField = screen.getByPlaceholderText(/请输入通知标题/i);
      expect(titleField).toBeInTheDocument();
    });
  });

  describe('表单提交 - 成功场景', () => {
    it('应该成功提交新增通知表单（全体目标）', async () => {
      const user = userEvent.setup();

      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 填写表单
      const titleInput = screen.getByPlaceholderText(/请输入通知标题/i);
      await user.type(titleInput, '测试通知标题');

      // 选择通知类型
      const typeSelect = screen.getByLabelText(/通知类型/i);
      await user.click(typeSelect);
      const typeOption = screen.getByText('通知');
      await user.click(typeOption);

      // 填写内容
      const contentInput = screen.getByTestId('rich-text-input');
      await user.clear(contentInput);
      await user.type(contentInput, '这是测试通知内容');

      // 提交表单
      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      // 验证 API 调用
      await waitFor(() => {
        expect(mockNoticeAPI.create).toHaveBeenCalledTimes(1);
        expect(mockNoticeAPI.create).toHaveBeenCalledWith({
          title: '测试通知标题',
          content: '这是测试通知内容',
          type: 1,
          level: 'M',
          targetType: 1,
          targetUserIds: '',
        });
      });

      // 验证成功提示
      expect(mockToast.success).toHaveBeenCalledWith('新增成功');

      // 验证回调函数
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('应该成功提交新增通知表单（指定用户）', async () => {
      const user = userEvent.setup();

      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 填写标题
      const titleInput = screen.getByPlaceholderText(/请输入通知标题/i);
      await user.type(titleInput, '测试通知标题');

      // 选择通知类型
      const typeSelect = screen.getByLabelText(/通知类型/i);
      await user.click(typeSelect);
      const typeOption = screen.getByText('通知');
      await user.click(typeOption);

      // 选择目标类型为"指定"
      const targetTypeRadios = screen.getAllByRole('radio');
      const specifyRadio = targetTypeRadios.find(
        (radio) => (radio as HTMLInputElement).value === '2'
      );
      if (specifyRadio) {
        await user.click(specifyRadio);
      }

      // 等待用户选择器加载
      await waitFor(() => {
        expect(mockUserAPI.getOptions).toHaveBeenCalled();
      });

      // 选择用户
      await waitFor(() => {
        const multiSelect = screen.getByTestId('multi-select');
        expect(multiSelect).toBeInTheDocument();
      });

      const userCheckboxes = screen.getAllByRole('checkbox');
      if (userCheckboxes.length > 0) {
        await user.click(userCheckboxes[0]); // 选择第一个用户
      }

      // 填写内容
      const contentInput = screen.getByTestId('rich-text-input');
      await user.clear(contentInput);
      await user.type(contentInput, '这是测试通知内容');

      // 提交表单
      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      // 验证 API 调用
      await waitFor(() => {
        expect(mockNoticeAPI.create).toHaveBeenCalledTimes(1);
        const callArgs = mockNoticeAPI.create.mock.calls[0][0];
        expect(callArgs.title).toBe('测试通知标题');
        expect(callArgs.content).toBe('这是测试通知内容');
        expect(callArgs.type).toBe(1);
        expect(callArgs.targetType).toBe(2);
        expect(callArgs.targetUserIds).toBeTruthy(); // 应该包含选中的用户ID
      });

      // 验证成功提示
      expect(mockToast.success).toHaveBeenCalledWith('新增成功');
    });

    it('应该成功提交包含所有字段的通知表单', async () => {
      const user = userEvent.setup();

      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 填写标题
      const titleInput = screen.getByPlaceholderText(/请输入通知标题/i);
      await user.type(titleInput, '完整测试通知');

      // 选择通知类型为"公告"
      const typeSelect = screen.getByLabelText(/通知类型/i);
      await user.click(typeSelect);
      const announcementOption = screen.getByText('公告');
      await user.click(announcementOption);

      // 选择通知等级为"高"
      const levelSelect = screen.getByLabelText(/通知等级/i);
      await user.click(levelSelect);
      const highLevelOption = screen.getByText('高');
      await user.click(highLevelOption);

      // 填写内容
      const contentInput = screen.getByTestId('rich-text-input');
      await user.clear(contentInput);
      await user.type(contentInput, '<p>这是完整的测试内容</p>');

      // 提交表单
      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      // 验证 API 调用
      await waitFor(() => {
        expect(mockNoticeAPI.create).toHaveBeenCalledWith({
          title: '完整测试通知',
          content: '<p>这是完整的测试内容</p>',
          type: 2,
          level: 'H',
          targetType: 1,
          targetUserIds: '',
        });
      });

      expect(mockToast.success).toHaveBeenCalledWith('新增成功');
    });
  });

  describe('表单验证', () => {
    it('应该验证必填字段 - 标题为空', async () => {
      const user = userEvent.setup();

      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 不填写标题，直接提交
      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      // 验证错误提示
      await waitFor(() => {
        expect(screen.getByText(/请输入通知标题/i)).toBeInTheDocument();
      });

      // 验证 API 未被调用
      expect(mockNoticeAPI.create).not.toHaveBeenCalled();
    });

    it('应该验证必填字段 - 通知类型未选择', async () => {
      const user = userEvent.setup();

      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 只填写标题，不选择类型
      const titleInput = screen.getByPlaceholderText(/请输入通知标题/i);
      await user.type(titleInput, '测试标题');

      // 提交表单
      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      // 验证错误提示
      await waitFor(() => {
        expect(screen.getByText(/请选择通知类型/i)).toBeInTheDocument();
      });

      // 验证 API 未被调用
      expect(mockNoticeAPI.create).not.toHaveBeenCalled();
    });

    it('应该验证必填字段 - 内容为空', async () => {
      const user = userEvent.setup();

      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 填写标题和类型，但不填写内容
      const titleInput = screen.getByPlaceholderText(/请输入通知标题/i);
      await user.type(titleInput, '测试标题');

      const typeSelect = screen.getByLabelText(/通知类型/i);
      await user.click(typeSelect);
      const typeOption = screen.getByText('通知');
      await user.click(typeOption);

      // 清空内容（默认可能是空的）
      const contentInput = screen.getByTestId('rich-text-input');
      await user.clear(contentInput);

      // 提交表单
      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      // 验证错误提示
      await waitFor(() => {
        expect(screen.getByText(/请输入通知内容/i)).toBeInTheDocument();
      });

      // 验证 API 未被调用
      expect(mockNoticeAPI.create).not.toHaveBeenCalled();
    });
  });

  describe('表单提交 - 错误处理', () => {
    it('应该处理 API 调用失败的情况', async () => {
      const user = userEvent.setup();
      const errorMessage = '创建通知失败';

      // Mock API 返回错误
      mockNoticeAPI.create.mockRejectedValue(new Error(errorMessage));

      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 填写表单
      const titleInput = screen.getByPlaceholderText(/请输入通知标题/i);
      await user.type(titleInput, '测试标题');

      const typeSelect = screen.getByLabelText(/通知类型/i);
      await user.click(typeSelect);
      const typeOption = screen.getByText('通知');
      await user.click(typeOption);

      const contentInput = screen.getByTestId('rich-text-input');
      await user.clear(contentInput);
      await user.type(contentInput, '测试内容');

      // 提交表单
      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      // 验证 API 被调用
      await waitFor(() => {
        expect(mockNoticeAPI.create).toHaveBeenCalled();
      });

      // 验证错误处理（不应该调用成功回调）
      await waitFor(() => {
        expect(mockOnClose).not.toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('表单交互', () => {
    it('应该在目标类型为"指定"时显示用户选择器', async () => {
      const user = userEvent.setup();

      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 初始状态不应该显示用户选择器
      expect(screen.queryByTestId('multi-select')).not.toBeInTheDocument();

      // 选择目标类型为"指定"
      const targetTypeRadios = screen.getAllByRole('radio');
      const specifyRadio = targetTypeRadios.find(
        (radio) => (radio as HTMLInputElement).value === '2'
      );
      if (specifyRadio) {
        await user.click(specifyRadio);
      }

      // 应该显示用户选择器
      await waitFor(() => {
        expect(screen.getByTestId('multi-select')).toBeInTheDocument();
        expect(mockUserAPI.getOptions).toHaveBeenCalled();
      });
    });

    it('应该在关闭弹窗时调用 onClose', async () => {
      const user = userEvent.setup();

      render(
        <NoticeFormModal
          visible={true}
          notice={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // 查找取消按钮或关闭按钮
      const cancelButton = screen.getByRole('button', { name: /取消/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});

