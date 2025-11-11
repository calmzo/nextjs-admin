/**
 * 用户表单字段配置
 */

import type { AdminFieldConfig } from '@/components/common/AdminForm/types';
import { UserForm, USER_GENDER_OPTIONS } from '@/api/user.api';
import DeptTreeSelector from '@/components/ui/tree/DeptTreeSelector';
import MultiSelect from '@/components/form/MultiSelect';
import Select from '@/components/form/Select';
import type { DeptNode } from '@/types/dept-tree';

/**
 * 获取用户表单字段配置
 * @param isEdit 是否为编辑模式
 * @param deptOptions 部门选项
 * @param roleOptions 角色选项
 * @param deptOptionsLoading 部门选项加载状态
 * @param roleOptionsLoading 角色选项加载状态
 */
export function getUserFormFields(
  isEdit: boolean,
  deptOptions: DeptNode[],
  roleOptions: Array<{ label: string; value: number }>,
  deptOptionsLoading: boolean,
  roleOptionsLoading: boolean,
): AdminFieldConfig<UserForm & Record<string, unknown>>[] {
  return [
    {
      key: 'username',
      label: '用户名',
      type: 'text',
      placeholder: '请输入用户名',
      required: true,
      disabled: isEdit,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '用户名不能为空';
        }
        return undefined;
      },
    },
    {
      key: 'nickname',
      label: '用户昵称',
      type: 'text',
      placeholder: '请输入昵称',
      required: true,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '昵称不能为空';
        }
        return undefined;
      },
    },
    {
      key: 'deptId',
      label: '所属部门',
      type: 'custom',
      required: true,
      render: (value, onChange) => (
        <DeptTreeSelector
          data={deptOptions}
          value={typeof value === 'number' ? value : undefined}
          onChange={(v) => {
            if (typeof v === 'number') {
              onChange(v);
            } else if (Array.isArray(v) && v.length > 0) {
              onChange(v[0]);
            } else {
              onChange(undefined);
            }
          }}
          placeholder="请选择部门"
          loading={deptOptionsLoading}
          allowClear
          showSearch
          useOptionFormat
        />
      ),
      validate: (value) => {
        if (value === undefined || value === null) {
          return '所属部门不能为空';
        }
        return undefined;
      },
    },
    {
      key: 'gender',
      label: '性别',
      type: 'custom',
      render: (value, onChange) => (
        <Select
          options={USER_GENDER_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value.toString(),
          }))}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={(val) => {
            if (val === '') {
              onChange(undefined);
            } else {
              const numericValue = Number(val);
              onChange(Number.isNaN(numericValue) ? undefined : numericValue);
            }
          }}
          placeholder="请选择性别"
        />
      ),
    },
    {
      key: 'roleIds',
      label: '角色',
      type: 'custom',
      render: (value, onChange) => {
        if (roleOptionsLoading) {
          return (
            <div className="flex items-center justify-center rounded-lg border border-gray-300 py-4 dark:border-gray-700">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          );
        }

        const selectedValues = Array.isArray(value)
          ? value.map((v) => v?.toString()).filter(Boolean) as string[]
          : [];

        return (
          <div onClick={(event) => event.stopPropagation()}>
            <MultiSelect
              key={`role-${isEdit ? 'edit' : 'new'}`}
              label=""
              options={roleOptions.map((option) => ({
                value: option.value.toString(),
                text: option.label,
                selected: false,
              }))}
              defaultSelected={selectedValues}
              onChange={(selected) => {
                const roleIds = selected
                  .map((val) => Number(val))
                  .filter((id) => Number.isInteger(id) && id > 0);
                onChange(roleIds);
              }}
              disabled={roleOptionsLoading}
            />
          </div>
        );
      },
    },
    {
      key: 'mobile',
      label: '手机号码',
      type: 'text',
      placeholder: '请输入手机号码',
      validate: (value) => {
        if (value && !/^1[3-9]\d{9}$/.test(String(value))) {
          return '手机号格式不正确';
        }
        return undefined;
      },
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'email',
      placeholder: '请输入邮箱',
      validate: (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          return '邮箱格式不正确';
        }
        return undefined;
      },
    },
    {
      key: 'status',
      label: '状态',
      type: 'switch',
      defaultValue: true,
    },
    {
      key: 'password',
      label: '密码',
      type: 'password',
      placeholder: '请输入密码',
      required: !isEdit,
      show: () => !isEdit,
      validate: (value) => {
        if (!isEdit && (!value || !String(value).trim())) {
          return '密码不能为空';
        }
        return undefined;
      },
    },
  ];
}