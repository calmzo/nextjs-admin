/**
 * 角色表单字段配置
 * 用于 AdminForm 通用表单组件
 */

import React from 'react';
import type { RoleForm as RoleFormType } from '@/api/role.api';
import { AdminFieldConfig } from '@/components/common/AdminForm/types';
import Input from '@/components/form/input/InputField';

/**
 * 获取角色表单字段配置
 */
export function getRoleFormFields(): AdminFieldConfig<RoleFormType & Record<string, unknown>>[] {
  return [
    {
      key: 'name',
      label: '角色名称',
      type: 'text',
      placeholder: '请输入角色名称',
      required: true,
      validate: (value) => {
        const name = String(value || '').trim();
        if (!name) {
          return '角色名称不能为空';
        }
        if (name.length > 50) {
          return '角色名称不能超过50个字符';
        }
        return undefined;
      },
    },
    {
      key: 'code',
      label: '角色编码',
      type: 'custom',
      placeholder: '如：ADMIN',
      required: true,
      validate: (value) => {
        const code = String(value || '').trim();
        if (!code) {
          return '角色编码不能为空';
        }
        if (!/^[A-Z0-9_]+$/.test(code)) {
          return '角色编码只能包含大写字母、数字和下划线';
        }
        if (code.length > 20) {
          return '角色编码不能超过20个字符';
        }
        return undefined;
      },
      render: (value, onChange) => {
        const inputValue =
          typeof value === 'string' || typeof value === 'number' ? String(value) : '';
        return (
          <Input
            value={inputValue}
            onChange={(e) => {
              const upperValue = e.target.value.toUpperCase();
              onChange(upperValue);
            }}
            placeholder="如：ADMIN"
          />
        );
      },
    },
    {
      key: 'dataScope',
      label: '数据权限',
      type: 'select',
      placeholder: '请选择数据权限',
      required: true,
      defaultValue: 2,
      options: [
        { value: 1, label: '全部数据' },
        { value: 2, label: '部门及子部门数据' },
        { value: 3, label: '本部门数据' },
        { value: 4, label: '本人数据' },
      ],
      validate: (value) => {
        const scope = Number(value);
        if (!Number.isInteger(scope)) {
          return '请选择数据权限';
        }
        if (![1, 2, 3, 4].includes(scope)) {
          return '数据权限值无效';
        }
        return undefined;
      },
    },
    {
      key: 'status',
      label: '角色状态',
      type: 'radio',
      required: true,
      defaultValue: 1,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
    {
      key: 'sort',
      label: '显示排序',
      type: 'number',
      placeholder: '排序值',
      required: true,
      defaultValue: 1,
      min: 0,
      max: 999,
      validate: (value) => {
        if (value === undefined || value === null || value === '') {
          return '请输入显示排序';
        }
        const sortValue = Number(value);
        if (Number.isNaN(sortValue)) {
          return '显示排序必须是数字';
        }
        if (sortValue < 0 || sortValue > 999) {
          return '显示排序必须在0-999之间';
        }
        return undefined;
      },
    },
  ];
}


