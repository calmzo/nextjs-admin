/**
 * 角色表单组件
 */

"use client";

import React, { useMemo, useCallback } from 'react';
import type { RoleForm as RoleFormType } from '@/api/role.api';
import { AdminForm } from '@/components/common/AdminForm';
import { getRoleFormFields } from './RoleFormFields';

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormType) => Promise<void>;
  initialData?: Partial<RoleFormType>;
  loading?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const isEdit = !!initialData?.id;

  const fields = useMemo(() => getRoleFormFields(), []);

  const preparedInitialData = useMemo(() => {
    if (!initialData) {
      return undefined;
    }

    const data: RoleFormType & Record<string, unknown> = {
      ...initialData,
      name: initialData.name ?? '',
      code: initialData.code ?? '',
      sort: initialData.sort ?? 1,
      status: initialData.status ?? 1,
      dataScope: initialData.dataScope ?? 2,
    };

    return data;
  }, [initialData]);

  const transformData = useCallback(
    (data: RoleFormType & Record<string, unknown>): RoleFormType & Record<string, unknown> => {
      const submitData: RoleFormType = {
        name: String(data.name || '').trim(),
        code: String(data.code || '').trim().toUpperCase(),
        sort: Number.isFinite(Number(data.sort)) ? Number(data.sort) : 1,
        status: Number.isFinite(Number(data.status)) ? Number(data.status) : 1,
        dataScope: Number.isFinite(Number(data.dataScope)) ? Number(data.dataScope) : 2,
      };

      const idValue = data.id ?? initialData?.id;
      if (idValue !== undefined && idValue !== null) {
        const numericId = Number(idValue);
        if (!Number.isNaN(numericId)) {
          submitData.id = numericId;
        }
      }

      return submitData as RoleFormType & Record<string, unknown>;
    },
    [initialData?.id],
  );

  const handleSubmit = useCallback(
    async (data: RoleFormType & Record<string, unknown>) => {
      await onSubmit(data as RoleFormType);
    },
    [onSubmit],
  );

  const title = isEdit ? '编辑角色' : '新增角色';
  const description = isEdit ? '修改角色信息' : '填写角色基本信息';

  return (
    <AdminForm<RoleFormType & Record<string, unknown>>
      visible={isOpen}
      initialData={preparedInitialData}
      formId={initialData?.id}
      title={title}
      description={description}
      fields={fields}
      onSubmit={handleSubmit}
      onCancel={onClose}
      onSuccess={onClose}
      transformData={transformData}
      maxWidth="2xl"
      loading={loading}
    />
  );
};

export default RoleForm;

