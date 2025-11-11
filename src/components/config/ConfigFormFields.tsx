/**
 * 系统配置表单字段配置
 * 用于 AdminForm 组件
 */

import { AdminFieldConfig } from '@/components/common/AdminForm/types';
import { ConfigFormData } from '@/api/config.api';

/**
 * 获取系统配置表单字段配置
 */
export function getConfigFormFields(): AdminFieldConfig<ConfigFormData & Record<string, unknown>>[] {
  return [
    {
      key: 'configName',
      label: '配置名称',
      type: 'text',
      placeholder: '请输入配置名称',
      required: true,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '配置名称不能为空';
        }
        if (String(value).length > 50) {
          return '配置名称不能超过50个字符';
        }
        return undefined;
      },
    },
    {
      key: 'configKey',
      label: '配置键',
      type: 'text',
      placeholder: '请输入配置键（如：system.name）',
      required: true,
      helpText: '只能包含字母、数字、下划线和点',
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '配置键不能为空';
        }
        if (!/^[a-zA-Z0-9_.]+$/.test(String(value))) {
          return '配置键只能包含字母、数字、下划线和点';
        }
        if (String(value).length > 100) {
          return '配置键不能超过100个字符';
        }
        return undefined;
      },
    },
    {
      key: 'configValue',
      label: '配置值',
      type: 'textarea',
      placeholder: '请输入配置值',
      required: true,
      rows: 4,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '配置值不能为空';
        }
        if (String(value).length > 500) {
          return '配置值不能超过500个字符';
        }
        return undefined;
      },
    },
    {
      key: 'remark',
      label: '备注',
      type: 'textarea',
      placeholder: '请输入备注信息（可选）',
      rows: 4,
      validate: (value) => {
        if (value && String(value).length > 200) {
          return '备注不能超过200个字符';
        }
        return undefined;
      },
    },
  ];
}

