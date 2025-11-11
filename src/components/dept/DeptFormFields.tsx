/**
 * 部门表单字段配置
 * 用于 AdminForm 组件
 */

import React from 'react';
import { AdminFieldConfig } from '@/components/common/AdminForm/types';
import { DeptFormData } from '@/api/dept.api';
import { DeptTreeSelector } from '@/components/ui/tree';
import Input from '@/components/form/input/InputField';
import type { DeptNode } from '@/types/dept-tree';

/**
 * 获取部门表单字段配置
 */
export function getDeptFormFields(
  deptOptions: DeptNode[] = []
): AdminFieldConfig<DeptFormData & Record<string, unknown>>[] {
  return [
    {
      key: 'parentId',
      label: '上级部门',
      type: 'custom',
      helpText: '选择上级部门，不选择则创建为顶级部门',
      render: (value, onChange) => {
        return (
          <DeptTreeSelector
            data={deptOptions}
            value={value as number | undefined}
            onChange={(val, node) => {
              const selectedNode = Array.isArray(node) ? node[0] : node;
              const parentId = selectedNode?.id || 0;
              onChange(parentId);
            }}
            placeholder="选择上级部门（可选）"
            allowClear
            showSearch
            useOptionFormat={true}
          />
        );
      },
    },
    {
      key: 'name',
      label: '部门名称',
      type: 'text',
      placeholder: '请输入部门名称',
      required: true,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '部门名称不能为空';
        }
        if (String(value).length > 50) {
          return '部门名称不能超过50个字符';
        }
        return undefined;
      },
    },
    {
      key: 'code',
      label: '部门编号',
      type: 'custom',
      placeholder: '如：TECH_DEPT',
      required: true,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '部门编号不能为空';
        }
        if (!/^[A-Z0-9_]+$/.test(String(value))) {
          return '部门编号只能包含大写字母、数字和下划线';
        }
        if (String(value).length > 20) {
          return '部门编号不能超过20个字符';
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
              // 自动转换为大写
              const upperValue = e.target.value.toUpperCase();
              onChange(upperValue);
            }}
            placeholder="如：TECH_DEPT"
          />
        );
      },
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
        if (typeof value === 'number') {
          if (value < 0 || value > 999) {
            return '显示排序必须在0-999之间';
          }
        }
        return undefined;
      },
    },
    {
      key: 'status',
      label: '部门状态',
      type: 'radio',
      required: true,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
      defaultValue: 1,
    },
  ];
}

