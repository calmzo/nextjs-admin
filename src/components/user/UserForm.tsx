/**
 * 用户表单组件
 * 使用 GenericForm 通用表单组件
 */

"use client";

import React, { useEffect, useMemo, useCallback } from 'react';
import GenericForm from '@/components/common/GenericForm/GenericForm';
import { useUserForm, useUserOperations } from '@/hooks/useUser';
import { useDeptOptions } from '@/hooks/useDept';
import { useRoleOptions } from '@/hooks/useRole';
import { UserForm } from '@/api/user.api';
import { getUserFormFields } from './UserFormFields';
import type { FieldConfig } from '@/components/common/GenericForm/types';

interface UserFormProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: () => void;
}

export default function UserFormModal({ 
  visible, 
  onClose, 
  userId, 
  onSuccess 
}: UserFormProps) {
  // 只保留选项相关的 hooks（这些是表单字段需要的）
  const {
    options: deptOptions,
    loading: deptOptionsLoading,
    fetchOptions: fetchDeptOptions,
  } = useDeptOptions();

  const {
    options: roleOptions,
    loading: roleOptionsLoading,
    fetchOptions: fetchRoleOptions,
  } = useRoleOptions();

  // 只在弹窗打开时加载选项数据
  useEffect(() => {
    if (visible) {
      fetchDeptOptions();
      fetchRoleOptions();
    }
  }, [visible, fetchDeptOptions, fetchRoleOptions]);

  // 生成表单字段配置
  const fields = useMemo(() => {
    const result = getUserFormFields(
      !!userId,
      deptOptions,
      roleOptions,
      deptOptionsLoading,
      roleOptionsLoading
    );
    try {
      console.debug('[UserForm] build fields', {
        userId,
        deptOptionsCount: deptOptions?.length,
        roleOptionsCount: roleOptions?.length,
        deptOptionsLoading,
        roleOptionsLoading,
        fieldsCount: result?.length,
      });
    } catch {}
    return result;
  }, [userId, deptOptions, roleOptions, deptOptionsLoading, roleOptionsLoading]);

  // 包装 useFormHook - 直接定义函数，内部调用 hook
  // 注意：虽然这个函数在每次渲染时都会创建，但 GenericForm 内部会正确调用它
  const useFormHookWrapper = () => {
    const hook = useUserForm();
    try {
      console.debug('[UserForm] useFormHookWrapper', {
        hasFetchFormData: !!hook.fetchFormData,
        hasResetFormData: !!hook.resetFormData,
        loading: hook.loading,
        hasFormData: !!hook.formData,
      });
    } catch {}
    return {
      ...hook,
      formData: hook.formData as (UserForm & Record<string, unknown>) | null,
      fetchFormData: hook.fetchFormData ? async (id: string | number) => {
        console.debug('[UserForm] fetchFormData called with id:', id);
        await hook.fetchFormData!(typeof id === 'string' ? parseInt(id) : id);
      } : undefined,
    };
  };

  // 包装 useOperationsHook - 直接定义函数，内部调用 hook
  const useOperationsHookWrapper = () => {
    const hook = useUserOperations();
    return {
      ...hook,
      create: hook.create ? async (data: UserForm & Record<string, unknown>) => {
        return hook.create!(data as UserForm);
      } : undefined,
      update: hook.update ? async (id: string | number, data: UserForm & Record<string, unknown>) => {
        return hook.update!(typeof id === 'string' ? parseInt(id) : id, data as UserForm);
      } : undefined,
    };
  };

  // 处理提交
  const handleSubmit = useCallback(async () => {
    // GenericForm 会自动调用 operationsHook 的 create 或 update
    // 这里可以做一些额外的处理，比如数据转换
  }, []);

  // 处理成功回调
  const handleSuccess = useCallback(() => {
      onSuccess?.();
    onClose();
  }, [onSuccess, onClose]);

  return (
    <GenericForm<UserForm & Record<string, unknown>>
      visible={visible}
      title={userId ? '编辑用户' : '新增用户'}
      formId={userId}
      fields={fields as unknown as FieldConfig<UserForm & Record<string, unknown>>[]}
      useFormHook={useFormHookWrapper}
      useOperationsHook={useOperationsHookWrapper}
      onSubmit={handleSubmit}
      onCancel={onClose}
      onSuccess={handleSuccess}
      width="480px"
      layout="inline"
      labelWidth="min-w-[80px]"
    />
  );
}