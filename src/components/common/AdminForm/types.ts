/**
 * AdminForm 组件的类型定义
 * 用于系统管理相关的表单（通知、部门、角色、菜单、字典等）
 */

import { ReactNode } from 'react';

/**
 * 表单字段类型
 */
export type AdminFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'select'
  | 'multiSelect'
  | 'switch'
  | 'date'
  | 'dateRange'
  | 'radio'
  | 'custom';

/**
 * 表单字段配置
 */
export interface AdminFieldConfig<T> {
  key: keyof T;
  label: string;
  type: AdminFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  defaultValue?: unknown;
  
  // Select/MultiSelect/Radio 选项
  options?: Array<{ label: string; value: string | number }>;
  loadOptions?: () => Promise<Array<{ label: string; value: string | number }>>;
  
  // 验证规则
  validate?: (value: unknown, formData: T) => string | undefined;
  
  // 自定义渲染
  render?: ((value: unknown, onChange: (value: unknown) => void, formData: T) => ReactNode) | undefined;
  
  // 条件显示
  show?: (formData: T) => boolean;
  
  // 布局相关
  layout?: 'vertical' | 'inline';
  labelWidth?: string;
  className?: string;
  
  // 字段特定配置
  min?: number;
  max?: number;
  step?: number;
  rows?: number; // textarea
  dateFormat?: string;
  mode?: 'single' | 'range'; // date picker
  
  // Radio 特定配置
  direction?: 'horizontal' | 'vertical'; // radio 选项排列方向
}

/**
 * 表单验证配置
 */
export interface AdminValidationConfig<T> {
  validate?: (formData: T) => Record<string, string>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * AdminForm 组件 Props
 */
export interface AdminFormProps<T extends Record<string, unknown>> {
  // 数据相关
  visible: boolean;
  initialData?: Partial<T>;
  formId?: string | number; // 编辑时的 ID
  
  // 配置相关
  title: string;
  description?: string;
  fields: AdminFieldConfig<T>[];
  
  // 行为相关
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  onSuccess?: () => void;
  
  // 验证相关
  validation?: AdminValidationConfig<T>;
  
  // 自定义渲染
  renderFooter?: (onSubmit: () => void, onCancel: () => void, loading: boolean) => ReactNode;
  renderHeader?: () => ReactNode;
  
  // 其他
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  destroyOnClose?: boolean;
  submitText?: string;
  
  // 布局
  layout?: 'vertical' | 'inline';
  labelWidth?: string;
  
  // 获取提交数据（用于数据转换）
  transformData?: (formData: T) => T;
  
  // 加载状态
  loading?: boolean;
}

