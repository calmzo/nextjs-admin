/**
 * 字典表单弹窗组件（新增/编辑）
 * 使用 AdminForm 通用表单组件
 */

"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { AdminForm } from '@/components/common/AdminForm';
import { getDictFormFields } from './DictFormFields';
import DictAPI, { DictFormData, DictPageVO } from '@/api/dict.api';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';

interface DictFormModalProps {
  visible: boolean;
  dict?: DictPageVO | null; // 编辑时传入，新增时为 null
  onClose: () => void;
  onSuccess?: () => void;
}

const DictFormModal: React.FC<DictFormModalProps> = ({
  visible,
  dict,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DictFormData & Record<string, unknown> | undefined>(undefined);

  // 加载表单数据（编辑模式）
  useEffect(() => {
    if (visible && dict?.id) {
      setLoading(true);
      DictAPI.getFormData(dict.id)
        .then((data) => {
          setFormData({
            name: data.name || '',
            dictCode: data.dictCode || '',
            status: data.status ?? 1,
            remark: data.remark || '',
          });
        })
        .catch((error: unknown) => {
          handleError(error, { showToast: false });
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (visible && !dict) {
      // 新增模式：重置表单数据
      setFormData(undefined);
    }
  }, [visible, dict]);

  // 获取表单字段配置
  const fields = useMemo(() => {
    return getDictFormFields();
  }, []);

  // 数据转换函数 - 确保数据格式正确
  const transformData = useCallback((data: DictFormData & Record<string, unknown>): DictFormData & Record<string, unknown> => {
    const submitData: DictFormData & Record<string, unknown> = {
      name: String(data.name || '').trim(),
      dictCode: String(data.dictCode || '').trim(),
      status: Number(data.status) ?? 1,
    };

    // 备注可选
    if (data.remark) {
      submitData.remark = String(data.remark).trim();
    }

    // 编辑时包含 id
    if (dict?.id) {
      submitData.id = dict.id;
    }

    return submitData;
  }, [dict?.id]);

  // 处理表单提交
  // 注意：AdminForm 会先调用 transformData 转换数据，然后调用 onSubmit
  // 所以这里接收到的 data 已经是转换后的数据
  const handleSubmit = useCallback(async (data: DictFormData & Record<string, unknown>) => {
    try {
      if (dict?.id) {
        // 更新字典
        await DictAPI.update(dict.id, data);
        toast.success('修改成功');
      } else {
        // 创建字典
        await DictAPI.create(data);
        toast.success('新增成功');
      }

      // 注意：onSuccess 和 onClose 由 AdminForm 统一处理，这里不需要调用
      // AdminForm 会在提交成功后自动调用 onSuccess，然后关闭弹窗
    } catch (error) {
      // 错误需要重新抛出，让 AdminForm 知道提交失败
      // 但错误提示已由响应拦截器统一处理，这里不需要额外处理
      throw error;
    }
  }, [dict?.id]);

  return (
    <AdminForm
      visible={visible}
      initialData={formData}
      formId={dict?.id}
      title={dict?.id ? '编辑字典' : '新增字典'}
      description={dict?.id ? '修改字典信息' : '填写字典基本信息'}
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

export default DictFormModal;

