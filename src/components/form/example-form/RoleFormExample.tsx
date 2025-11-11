/**
 * 角色表单示例 - 使用封装后的表单组件
 * 展示如何使用 useForm Hook 和封装字段组件
 */

"use client";

import React, { useEffect } from 'react';
import { useForm } from '../hooks';
import { TextField, NumberField, SelectField, RadioField } from '../fields';
import ModalForm from '../ModalForm';

type RoleFormData = {
  id?: number;
  name: string;
  code: string;
  sort: number;
  status: number;
  dataScope: number;
} & Record<string, unknown>;

interface RoleFormExampleProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  initialData?: Partial<RoleFormData>;
  loading?: boolean;
}

const RoleFormExample: React.FC<RoleFormExampleProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  // 数据权限选项
  const dataScopeOptions = [
    { value: '1', label: '全部数据' },
    { value: '2', label: '部门及子部门数据' },
    { value: '3', label: '本部门数据' },
    { value: '4', label: '本人数据' }
  ];

  // 使用 useForm Hook 管理表单
  const form = useForm<RoleFormData>({
    initialValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      sort: initialData?.sort || 1,
      status: initialData?.status ?? 1,
      dataScope: initialData?.dataScope ?? 2,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      const name = values.name || '';
      if (!name.trim()) {
        errors.name = '角色名称不能为空';
      } else if (name.length > 50) {
        errors.name = '角色名称不能超过50个字符';
      }

      const code = values.code || '';
      if (!code.trim()) {
        errors.code = '角色编码不能为空';
      } else if (!/^[A-Z0-9_]+$/.test(code)) {
        errors.code = '角色编码只能包含大写字母、数字和下划线';
      } else if (code.length > 20) {
        errors.code = '角色编码不能超过20个字符';
      }

      const sort = values.sort ?? 0;
      if (sort < 0 || sort > 999) {
        errors.sort = '显示排序必须在0-999之间';
      }

      const dataScope = values.dataScope;
      if (dataScope === undefined || dataScope === null) {
        errors.dataScope = '请选择数据权限';
      } else if (![1, 2, 3, 4].includes(dataScope)) {
        errors.dataScope = '数据权限值无效';
      }

      return errors;
    },
    onSubmit: async (values) => {
      await onSubmit(values);
      onClose();
    },
    resetOnSubmit: true,
  });

  // 当 initialData 变化时，更新表单值
  useEffect(() => {
    if (initialData) {
      form.setValues({
        name: initialData.name || '',
        code: initialData.code || '',
        sort: initialData.sort || 1,
        status: initialData.status ?? 1,
        dataScope: initialData.dataScope ?? 2,
      });
    }
  }, [initialData, isOpen, form]);

  // 当模态框关闭时重置表单
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  // 处理角色编码输入（自动转大写）
  const handleCodeChange = (value: string) => {
    form.setValue('code', value.toUpperCase());
  };

  const isEdit = !!initialData?.id;
  const title = isEdit ? '编辑角色' : '新增角色';
  const description = isEdit ? '修改角色信息' : '填写角色基本信息';

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={form.handleSubmit}
      title={title}
      description={description}
      loading={loading}
      isSubmitting={form.isSubmitting}
      submitText={isEdit ? '更新' : '创建'}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* 角色名称 - 使用 TextField */}
        <TextField
          label="角色名称"
          name="name"
          value={form.values.name}
          onChange={form.handleChange('name')}
          onBlur={form.handleBlur('name')}
          error={form.errors['name']}
          placeholder="请输入角色名称"
          required
          autoManageTouched
          forceShowError={!!form.errors['name']}
        />

        {/* 角色编码 - 使用 TextField，自定义 onChange */}
        <TextField
          label="角色编码"
          name="code"
          value={form.values.code}
          onChange={handleCodeChange}
          onBlur={form.handleBlur('code')}
          error={form.errors['code']}
          placeholder="如：ADMIN"
          required
          autoManageTouched
          forceShowError={!!form.errors['code']}
        />

        {/* 数据权限 - 使用 SelectField */}
        <SelectField
          label="数据权限"
          name="dataScope"
          value={form.values.dataScope ? String(form.values.dataScope) : '2'}
          onChange={(value) => form.setValue('dataScope', parseInt(value) || 2)}
          onBlur={form.handleBlur('dataScope')}
          options={dataScopeOptions}
          placeholder="请选择数据权限"
          error={form.errors['dataScope']}
          required
          autoManageTouched
          forceShowError={!!form.errors['dataScope']}
        />

        {/* 角色状态 - 使用 RadioField */}
        <RadioField
          label="角色状态"
          name="status"
          value={String(form.values.status)}
          onChange={(value) => form.setValue('status', parseInt(value) || 1)}
          onBlur={form.handleBlur('status')}
          options={[
            { value: '1', label: '启用' },
            { value: '0', label: '禁用' }
          ]}
          required
          autoManageTouched
          forceShowError={!!form.errors['status']}
        />

        {/* 显示排序 - 使用 NumberField */}
        <NumberField
          label="显示排序"
          name="sort"
          value={form.values.sort}
          onChange={form.handleChange('sort')}
          onBlur={form.handleBlur('sort')}
          error={form.errors['sort']}
          placeholder="排序值"
          min={0}
          max={999}
          required
          autoManageTouched
          forceShowError={!!form.errors['sort']}
        />
      </div>
    </ModalForm>
  );
};

export default RoleFormExample;

