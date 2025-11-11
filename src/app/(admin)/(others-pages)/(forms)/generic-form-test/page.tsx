/**
 * GenericForm 组件测试页面
 * 用于测试通用表单组件的各种功能
 */

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { GenericForm } from '@/components/common/GenericForm';
import { FieldConfig } from '@/components/common/GenericForm/types';
import Button from '@/components/ui/button/Button';
import { toast } from '@/components/common/Toaster';

// 测试表单数据类型
interface TestFormData {
  // 基础字段
  name: string;
  email: string;
  password: string;
  age: number;
  description: string;
  
  // 选择字段
  status: string;
  tags: (string | number)[];
  category: string;
  
  // 开关字段
  enabled: boolean;
  isPublic: boolean;
  
  // 日期字段
  birthday: string;
  dateRange: string[];
  
  // 条件显示字段
  showAdvanced: boolean;
  advancedOption: string;
  
  // 自定义字段
  customField: string;
}

/**
 * 模拟的表单操作 Hook
 */
function useTestFormOperations() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: TestFormData): Promise<boolean> => {
    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('创建数据:', data);
      toast.success('创建成功！');
      return true;
    } catch (error) {
      console.error('创建失败:', error);
      toast.error('创建失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string | number, data: TestFormData): Promise<boolean> => {
    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('更新数据:', { id, data });
      toast.success('更新成功！');
      return true;
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    create,
    update,
  };
}

export default function GenericFormTestPage() {
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<TestFormData> | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);

  // 表单字段配置
  const formFields: FieldConfig<TestFormData>[] = useMemo(() => [
    {
      key: 'name',
      label: '姓名',
      type: 'text',
      required: true,
      placeholder: '请输入姓名',
      validate: (value: unknown) => {
        if (!value || !String(value).trim()) {
          return '姓名不能为空';
        }
        if (String(value).length < 2) {
          return '姓名至少需要2个字符';
        }
        return undefined;
      },
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'email',
      required: true,
      placeholder: '请输入邮箱地址',
      validate: (value: unknown) => {
        if (!value || !String(value).trim()) {
          return '邮箱不能为空';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return '请输入有效的邮箱地址';
        }
        return undefined;
      },
    },
    {
      key: 'password',
      label: '密码',
      type: 'password',
      required: true,
      placeholder: '请输入密码',
      validate: (value: unknown) => {
        if (!value || !String(value).trim()) {
          return '密码不能为空';
        }
        if (String(value).length < 6) {
          return '密码至少需要6个字符';
        }
        return undefined;
      },
    },
    {
      key: 'age',
      label: '年龄',
      type: 'number',
      required: true,
      placeholder: '请输入年龄',
      min: 1,
      max: 150,
      validate: (value: unknown) => {
        if (value === undefined || value === null || value === '') {
          return '年龄不能为空';
        }
        const num = Number(value);
        if (isNaN(num) || num < 1 || num > 150) {
          return '年龄必须在1-150之间';
        }
        return undefined;
      },
    },
    {
      key: 'description',
      label: '描述',
      type: 'textarea',
      placeholder: '请输入描述信息',
      rows: 4,
      validate: (value: unknown) => {
        if (value && String(value).length > 500) {
          return '描述不能超过500个字符';
        }
        return undefined;
      },
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      required: true,
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
        { label: '待审核', value: 'pending' },
      ],
    },
    {
      key: 'tags',
      label: '标签',
      type: 'multiSelect',
      placeholder: '请选择标签',
      options: [
        { label: '标签1', value: 'tag1' },
        { label: '标签2', value: 'tag2' },
        { label: '标签3', value: 'tag3' },
        { label: '标签4', value: 'tag4' },
      ],
    },
    {
      key: 'category',
      label: '分类',
      type: 'select',
      placeholder: '请选择分类',
      // 模拟异步加载选项
      loadOptions: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
          { label: '分类A', value: 'category_a' },
          { label: '分类B', value: 'category_b' },
          { label: '分类C', value: 'category_c' },
        ];
      },
    },
    {
      key: 'enabled',
      label: '启用',
      type: 'switch',
      defaultValue: true,
    },
    {
      key: 'isPublic',
      label: '公开',
      type: 'switch',
      defaultValue: false,
    },
    {
      key: 'birthday',
      label: '生日',
      type: 'date',
      placeholder: '请选择生日',
    },
    {
      key: 'dateRange',
      label: '日期范围',
      type: 'dateRange',
      placeholder: '请选择日期范围',
    },
    {
      key: 'showAdvanced',
      label: '显示高级选项',
      type: 'switch',
      defaultValue: false,
    },
    {
      key: 'advancedOption',
      label: '高级选项',
      type: 'text',
      placeholder: '请输入高级选项',
      // 条件显示：只有当 showAdvanced 为 true 时才显示
      show: (data: TestFormData) => data.showAdvanced === true,
    },
    {
      key: 'customField',
      label: '自定义字段',
      type: 'custom',
      placeholder: '自定义输入',
      render: (value: unknown, onChange: (value: unknown) => void) => {
        return (
          <div className="flex gap-2">
            <input
              type="text"
              value={String(value || '')}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              placeholder="自定义输入框"
            />
            <button
              type="button"
              onClick={() => onChange('预设值')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              设置预设值
            </button>
          </div>
        );
      },
    },
  ], []);

  // 处理新增
  const handleAdd = useCallback(() => {
    setFormData(undefined);
    setIsEditMode(false);
    setFormVisible(true);
  }, []);

  // 处理编辑（使用示例数据）
  const handleEdit = useCallback(() => {
    setFormData({
      name: '张三',
      email: 'zhangsan@example.com',
      password: '123456',
      age: 25,
      description: '这是一个测试描述',
      status: 'active',
      tags: ['tag1', 'tag2'],
      category: 'category_a',
      enabled: true,
      isPublic: false,
      birthday: '1998-01-01',
      dateRange: ['2024-01-01', '2024-12-31'],
      showAdvanced: true,
      advancedOption: '高级选项值',
      customField: '自定义字段值',
    });
    setIsEditMode(true);
    setFormVisible(true);
  }, []);

  // 处理表单提交
  const handleFormSubmit = useCallback(async (data: TestFormData) => {
    console.log('表单提交数据:', data);
    // 可以在这里添加额外的处理逻辑
  }, []);

  // 处理表单成功
  const handleFormSuccess = useCallback(() => {
    setFormVisible(false);
    setFormData(undefined);
  }, []);

  // 处理取消
  const handleCancel = useCallback(() => {
    setFormVisible(false);
    setFormData(undefined);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">GenericForm 组件测试</h1>
        <p className="text-gray-600 dark:text-gray-400">
          测试通用表单组件的各种功能，包括字段类型、验证、条件显示等
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">测试操作</h2>
        <div className="flex gap-4">
          <Button onClick={handleAdd} variant="primary">
            新增表单
          </Button>
          <Button onClick={handleEdit} variant="secondary">
            编辑表单（示例数据）
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">功能说明</h2>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <strong>基础字段类型：</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>文本输入（text）</li>
              <li>邮箱输入（email）</li>
              <li>密码输入（password）</li>
              <li>数字输入（number）</li>
              <li>多行文本（textarea）</li>
            </ul>
          </div>
          <div>
            <strong>选择字段：</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>单选（select）- 静态选项</li>
              <li>多选（multiSelect）</li>
              <li>异步加载选项（loadOptions）</li>
            </ul>
          </div>
          <div>
            <strong>其他字段：</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>开关（switch）</li>
              <li>日期选择（date）</li>
              <li>日期范围（dateRange）</li>
              <li>自定义字段（custom）</li>
            </ul>
          </div>
          <div>
            <strong>验证功能：</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>必填验证</li>
              <li>自定义验证规则</li>
              <li>实时验证</li>
            </ul>
          </div>
          <div>
            <strong>条件显示：</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>根据其他字段值动态显示/隐藏字段</li>
            </ul>
          </div>
        </div>
      </div>

      {/* GenericForm 组件 */}
      <GenericForm<TestFormData & Record<string, unknown>>
        visible={formVisible}
        title={isEditMode ? '编辑表单' : '新增表单'}
        description={isEditMode ? '修改表单数据' : '创建新的表单数据'}
        fields={formFields}
        initialData={formData}
        formId={isEditMode ? 1 : undefined}
        useOperationsHook={useTestFormOperations}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        onSuccess={handleFormSuccess}
        width="600px"
        layout="inline"
        labelWidth="min-w-[120px]"
      />
    </div>
  );
}

