/**
 * GenericForm 组件的类型定义
 */

import { ReactNode } from 'react';

/**
 * 表单字段类型
 */
export type FieldType = 
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
  | 'custom';

/**
 * 表单字段配置
 */
export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  defaultValue?: unknown;
  
  // Select/MultiSelect 选项
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
}

/**
 * 表单 Hook 返回类型
 */
export interface FormHookReturn<T> {
  formData: T | null;
  loading: boolean;
  fetchFormData?: (id: string | number) => Promise<void>;
  resetFormData?: () => void;
}

/**
 * 表单操作 Hook 返回类型
 */
export interface FormOperationsHookReturn<T> {
  loading: boolean;
  create?: (data: T) => Promise<boolean>;
  update?: (id: string | number, data: T) => Promise<boolean>;
  [key: string]: unknown;
}

/**
 * 表单验证配置
 */
export interface ValidationConfig<T> {
  validate?: (formData: T) => Record<string, string>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * GenericForm 组件 Props
 */
export interface GenericFormProps<T extends Record<string, unknown>> {
  // 数据相关
  visible: boolean;
  initialData?: Partial<T>;
  formId?: string | number; // 编辑时的 ID
  useFormHook?: () => FormHookReturn<T>;
  useOperationsHook: () => FormOperationsHookReturn<T>;
  
  // 配置相关
  title: string;
  description?: string;
  fields: FieldConfig<T>[];
  
  // 行为相关
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  onSuccess?: () => void;
  
  // 验证相关
  validation?: ValidationConfig<T>;
  
  // 自定义渲染
  renderFooter?: (onSubmit: () => void, onCancel: () => void, loading: boolean) => ReactNode;
  renderHeader?: () => ReactNode;
  
  // 其他
  className?: string;
  modalClassName?: string;
  formClassName?: string;
  width?: string | number;
  destroyOnClose?: boolean;
  
  // 布局
  layout?: 'vertical' | 'inline';
  labelWidth?: string;
  
  // 获取提交数据（用于数据转换）
  transformData?: (formData: T) => T;
}

