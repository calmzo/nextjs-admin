/**
 * 字典项表单字段配置
 * 用于 AdminForm 组件
 */

import React from 'react';
import { AdminFieldConfig } from '@/components/common/AdminForm/types';
import { DictItemFormData } from '@/api/dict.api';
import TagTypeSelect from './TagTypeSelect';

/**
 * 获取字典项表单字段配置
 */
export function getDictItemFormFields(
  displayText?: string
): AdminFieldConfig<DictItemFormData & Record<string, unknown>>[] {
  // 标签类型选项
  const tagTypeOptions = [
    { value: 'success', label: 'success' },
    { value: 'warning', label: 'warning' },
    { value: 'info', label: 'info' },
    { value: 'primary', label: 'primary' },
    { value: 'danger', label: 'danger' },
    { value: '', label: '清空' },
  ];

  return [
    {
      key: 'label',
      label: '字典项标签',
      type: 'text',
      placeholder: '请输入字典项标签',
      required: true,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '请输入字典项标签';
        }
        if (String(value).length > 50) {
          return '字典项标签不能超过50个字符';
        }
        return undefined;
      },
    },
    {
      key: 'value',
      label: '字典项值',
      type: 'text',
      placeholder: '请输入字典项值',
      required: true,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '请输入字典项值';
        }
        if (String(value).length > 50) {
          return '字典项值不能超过50个字符';
        }
        return undefined;
      },
    },
    {
      key: 'status',
      label: '状态',
      type: 'radio',
      required: true,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
      defaultValue: 1,
    },
    {
      key: 'sort',
      label: '排序',
      type: 'number',
      placeholder: '请输入排序值',
      defaultValue: 1,
      min: 0,
      validate: (value) => {
        if (typeof value === 'number' && value < 0) {
          return '排序值不能小于0';
        }
        return undefined;
      },
    },
    {
      key: 'tagType',
      label: '标签类型',
      type: 'custom',
      helpText: '回显样式，为空时则显示"文本"',
      render: (value, onChange) => {
        return (
          <TagTypeSelect
            options={tagTypeOptions}
            placeholder="请选择标签类型"
            value={String(value || '')}
            onChange={(val) => onChange(val)}
            displayText={displayText}
          />
        );
      },
    },
    {
      key: 'remark',
      label: '备注',
      type: 'textarea',
      placeholder: '请输入备注（可选）',
      rows: 3,
      validate: (value) => {
        if (value && String(value).length > 200) {
          return '备注不能超过200个字符';
        }
        return undefined;
      },
    },
  ];
}

