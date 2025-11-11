/**
 * 部门表单弹窗组件（新增/编辑）
 * 使用 AdminForm 通用表单组件
 */

"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { AdminForm } from '@/components/common/AdminForm';
import { getDeptFormFields } from './DeptFormFields';
import { getDeptDetail, createDept, updateDept, DeptFormData } from '@/api/dept.api';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';
import type { DeptNode } from '@/types/dept-tree';

interface DeptFormModalProps {
  visible: boolean;
  dept?: DeptNode | null; // 编辑时传入，新增时为 null
  parentDept?: DeptNode; // 新增时的父部门
  deptOptions?: DeptNode[]; // 部门选项数据
  onClose: () => void;
  onSuccess?: () => void;
}

const DeptFormModal: React.FC<DeptFormModalProps> = ({
  visible,
  dept,
  parentDept,
  deptOptions = [],
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DeptFormData & Record<string, unknown> | undefined>(undefined);

  // 加载表单数据（编辑模式）
  useEffect(() => {
    if (visible && dept?.id) {
      setLoading(true);
      getDeptDetail(dept.id)
        .then((data) => {
          setFormData({
            name: data.name || '',
            code: data.code || '',
            parentId: data.parentId || 0,
            sort: data.sort ?? 1,
            status: data.status ?? 1,
            id: data.id,
          });
        })
        .catch((error: unknown) => {
          handleError(error, { showToast: false });
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (visible && !dept) {
      // 新增模式：重置表单数据，如果有父部门则设置默认 parentId
      setFormData({
        name: '',
        code: '',
        parentId: parentDept?.id || 0,
        sort: 1,
        status: 1,
      });
    }
  }, [visible, dept, parentDept]);

  // 获取表单字段配置
  const fields = useMemo(() => {
    return getDeptFormFields(deptOptions);
  }, [deptOptions]);

  // 数据转换函数 - 确保数据格式正确
  const transformData = useCallback((data: DeptFormData & Record<string, unknown>): DeptFormData & Record<string, unknown> => {
    const submitData: DeptFormData & Record<string, unknown> = {
      name: String(data.name || '').trim(),
      code: String(data.code || '').trim().toUpperCase(), // 确保编号为大写
      parentId: Number(data.parentId) || 0,
      sort: Number(data.sort) ?? 1,
      status: Number(data.status) ?? 1,
    };

    // 编辑时包含 id
    if (dept?.id) {
      submitData.id = dept.id;
    }

    return submitData;
  }, [dept?.id]);

  // 处理表单提交
  // 注意：AdminForm 会先调用 transformData 转换数据，然后调用 onSubmit
  // 所以这里接收到的 data 已经是转换后的数据
  const handleSubmit = useCallback(async (data: DeptFormData & Record<string, unknown>) => {
    try {
      if (dept?.id) {
        // 更新部门
        await updateDept(dept.id, data as DeptFormData);
        toast.success('修改成功');
      } else {
        // 创建部门
        await createDept(data as DeptFormData);
        toast.success('新增成功');
      }

      // 注意：onSuccess 和 onClose 由 AdminForm 统一处理，这里不需要调用
      // AdminForm 会在提交成功后自动调用 onSuccess，然后关闭弹窗
    } catch (error) {
      // 错误需要重新抛出，让 AdminForm 知道提交失败
      // 但错误提示已由响应拦截器统一处理，这里不需要额外处理
      throw error;
    }
  }, [dept?.id]);

  return (
    <AdminForm
      visible={visible}
      initialData={formData}
      formId={dept?.id}
      title={dept?.id ? '编辑部门' : '新增部门'}
      description={dept?.id ? '修改部门信息' : '填写部门基本信息'}
      fields={fields}
      onSubmit={handleSubmit}
      onCancel={onClose}
      onSuccess={() => {
        // 成功回调：刷新列表并关闭弹窗
        onSuccess?.();
        onClose();
      }}
      transformData={transformData}
      maxWidth="2xl"
      loading={loading}
    />
  );
};

export default DeptFormModal;

