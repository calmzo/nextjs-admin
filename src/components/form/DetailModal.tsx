/**
 * 通用详情模态框组件
 * 支持配置化字段定义，可复用于各种详情展示场景
 */

"use client";

import React from 'react';
import FormField from '@/components/form/FormField';
import DictLabel from '@/components/dict/DictLabel';

// 字段值获取函数类型
export type FieldValueGetter<T = Record<string, unknown>> = string | ((data: T) => unknown);

// 字段类型
export type DetailFieldType = 'text' | 'label' | 'dict' | 'html' | 'custom' | 'datetime';

// 详情字段配置
export interface DetailField<T = Record<string, unknown>> {
  /** 字段标签 */
  label: string;
  /** 字段值获取方式：字符串（数据key）或函数（自定义获取） */
  key: FieldValueGetter<T>;
  /** 字段类型：text-文本, label-标签, dict-字典, html-HTML内容, custom-自定义, datetime-日期时间 */
  type?: DetailFieldType;
  /** 字典类型（type为dict时使用） */
  dictCode?: string;
  /** 日期时间格式（type为datetime时使用，默认：yyyy-MM-dd HH:mm:ss） */
  dateFormat?: string;
  /** 标签样式类（type为label时使用） */
  labelClassName?: string | ((value: unknown, data: T) => string);
  /** 标签文本格式化函数（type为label时使用） */
  labelFormatter?: (value: unknown, data: T) => string;
  /** 自定义格式化函数（优先级高于type） */
  format?: (value: unknown, data: T) => React.ReactNode;
  /** 自定义渲染函数（优先级最高） */
  render?: (value: unknown, data: T) => React.ReactNode;
  /** 显示条件 */
  condition?: (data: T) => boolean;
  /** 字段容器样式类 */
  className?: string;
  /** 字段值的容器样式类 */
  valueClassName?: string;
}

// 详情模态框属性
export interface DetailModalProps<T = Record<string, unknown>> {
  /** 是否显示 */
  visible: boolean;
  /** 标题 */
  title?: string;
  /** 数据对象 */
  data: T;
  /** 字段配置数组 */
  fields: DetailField<T>[];
  /** 关闭回调 */
  onClose: () => void;
  /** 最大宽度，默认 max-w-3xl */
  maxWidth?: string;
  /** 自定义底部内容 */
  footer?: React.ReactNode;
  /** 是否显示底部按钮栏，默认 true */
  showFooter?: boolean;
  /** 底部按钮文本，默认"关闭" */
  footerButtonText?: string;
}

const DetailModal = <T extends Record<string, unknown> = Record<string, unknown>>({
  visible,
  title = '详情',
  data,
  fields,
  onClose,
  maxWidth = 'max-w-3xl',
  footer,
  showFooter = true,
  footerButtonText = '关闭',
}: DetailModalProps<T>): React.ReactElement | null => {
  if (!visible || !data) {
    return null;
  }

  // 获取字段值
  const getFieldValue = (field: DetailField<T>): unknown => {
    if (typeof field.key === 'function') {
      return field.key(data);
    }
    return data[field.key];
  };

  // 格式化日期时间
  const formatDateTime = (time?: string | number | Date, format?: string): string => {
    if (!time) return '-';
    try {
      const date = new Date(time);
      if (isNaN(date.getTime())) return String(time);

      if (format === 'YYYY-MM-DD' || format === 'yyyy-MM-dd') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      // 默认格式：yyyy-MM-dd HH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return String(time);
    }
  };

  // 渲染字段值
  const renderFieldValue = (field: DetailField<T>): React.ReactNode => {
    const value = getFieldValue(field);

    // 自定义渲染（优先级最高）
    if (field.render) {
      return field.render(value, data);
    }

    // 自定义格式化
    if (field.format) {
      return field.format(value, data);
    }

    // 根据类型渲染
    switch (field.type) {
      case 'dict':
        return (
          <DictLabel
            code={field.dictCode || ''}
            value={typeof value === 'string' || typeof value === 'number' ? value : undefined}
          />
        );

      case 'label':
        const labelText = field.labelFormatter
          ? field.labelFormatter(value, data)
          : String(value || '-');
        const labelClass =
          typeof field.labelClassName === 'function'
            ? field.labelClassName(value, data)
            : field.labelClassName || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${labelClass}`}
          >
            {labelText}
          </span>
        );

      case 'html':
        return (
          <div
            className={`prose prose-sm max-w-none text-gray-900 dark:text-white
              prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-900 dark:prose-p:text-white
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-code:text-gray-900 dark:prose-code:text-white
              min-h-[100px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${field.valueClassName || ''}`}
            dangerouslySetInnerHTML={{
              __html: value || '<p class="text-gray-400">-</p>',
            }}
          />
        );

      case 'datetime':
        return (
          <p className={`text-gray-900 dark:text-white text-sm ${field.valueClassName || ''}`}>
            {formatDateTime(
              typeof value === 'string' || typeof value === 'number' || value instanceof Date
                ? value
                : undefined,
              field.dateFormat
            )}
          </p>
        );

      case 'custom':
        // 自定义类型需要提供 render 或 format
        return <span className="text-gray-900 dark:text-white text-sm">-</span>;

      case 'text':
      default:
        return (
          <p className={`text-gray-900 dark:text-white text-sm ${field.valueClassName || ''}`}>
            {value !== null && value !== undefined ? String(value) : '-'}
          </p>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999">
      <div
        className="fixed inset-0 h-full w-full bg-black/50 transition-all duration-300"
        onClick={onClose}
      ></div>
      <div
        className={`relative w-full rounded-3xl bg-white dark:bg-gray-900 shadow-lg ${maxWidth} mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {fields.map((field, index) => {
              // 检查显示条件
              if (field.condition && !field.condition(data)) {
                return null;
              }

              return (
                <FormField
                  key={index}
                  label={field.label}
                  layout="inline"
                  className={field.className}
                >
                  <div className="flex-1">{renderFieldValue(field)}</div>
                </FormField>
              );
            })}
          </div>
        </div>

        {/* 底部按钮 */}
        {showFooter && (
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            {footer || (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
              >
                {footerButtonText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailModal;

