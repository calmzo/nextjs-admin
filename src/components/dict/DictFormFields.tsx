/**
 * 字典表单字段配置
 * 用于 AdminForm 组件
 */

import { AdminFieldConfig } from '@/components/common/AdminForm/types';
import { DictFormData } from '@/api/dict.api';

/**
 * 获取字典表单字段配置
 */
export function getDictFormFields(): AdminFieldConfig<DictFormData & Record<string, unknown>>[] {
  return [
    {
      key: 'name',
      label: '字典名称',
      type: 'text',
      placeholder: '请输入字典名称',
      required: true,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '字典名称不能为空';
        }
        if (String(value).length > 50) {
          return '字典名称不能超过50个字符';
        }
        return undefined;
      },
    },
    {
      key: 'dictCode',
      label: '字典编码',
      type: 'text',
      placeholder: '如：user_status',
      required: true,
      helpText: '只能包含字母、数字和下划线',
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '字典编码不能为空';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(String(value))) {
          return '字典编码只能包含字母、数字和下划线';
        }
        if (String(value).length > 50) {
          return '字典编码不能超过50个字符';
        }
        return undefined;
      },
    },
    {
      key: 'status',
      label: '字典状态',
      type: 'radio',
      required: true,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
      defaultValue: 1,
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

