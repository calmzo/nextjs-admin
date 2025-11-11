/**
 * 字典项表单弹窗组件（新增/编辑）
 * 使用 AdminForm 通用表单组件
 */

"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { AdminForm } from '@/components/common/AdminForm';
import { getDictItemFormFields } from './DictItemFormFields';
import DictAPI, { DictItemFormData, DictItemPageVO } from '@/api/dict.api';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';

interface DictItemFormModalProps {
  visible: boolean;
  dictCode: string; // 字典编码
  dictItem?: DictItemPageVO | null; // 编辑时传入，新增时为 null
  dictName?: string; // 字典名称，用于标签类型下拉框默认显示
  onClose: () => void;
  onSuccess?: () => void;
}

const DictItemFormModal: React.FC<DictItemFormModalProps> = ({
  visible,
  dictCode,
  dictItem,
  dictName,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DictItemFormData & Record<string, unknown> | undefined>(undefined);

  // 加载表单数据（编辑模式）
  useEffect(() => {
    if (visible && dictItem?.id) {
      setLoading(true);
      DictAPI.getDictItemFormData(dictCode, dictItem.id)
        .then((data) => {
          setFormData({
            label: data.label || '',
            value: data.value || '',
            sort: data.sort ?? 1,
            status: data.status ?? 1,
            tagType: data.tagType || '',
            remark: data.remark || '',
            id: data.id,
          });
        })
        .catch((error: unknown) => {
          handleError(error, { showToast: false });
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (visible && !dictItem) {
      // 新增模式：重置表单数据
      setFormData(undefined);
    }
  }, [visible, dictItem, dictCode]);

  // 获取表单字段配置
  // 使用 formData?.label 作为 displayText，如果没有则使用 dictName
  const fields = useMemo(() => {
    return getDictItemFormFields(formData?.label as string || dictName);
  }, [formData?.label, dictName]);

  // 数据转换函数 - 确保数据格式正确
  const transformData = useCallback((data: DictItemFormData & Record<string, unknown>): DictItemFormData & Record<string, unknown> => {
    const submitData: DictItemFormData & Record<string, unknown> = {
      label: String(data.label || '').trim(),
      value: String(data.value || '').trim(),
      sort: Number(data.sort) ?? 1,
      status: Number(data.status) ?? 1,
    };

    // 标签类型可选
    if (data.tagType !== undefined && data.tagType !== null) {
      submitData.tagType = String(data.tagType).trim() as DictItemFormData['tagType'];
    }

    // 备注可选
    if (data.remark) {
      submitData.remark = String(data.remark).trim();
    }

    // 编辑时包含 id
    if (dictItem?.id) {
      submitData.id = dictItem.id;
    }

    return submitData;
  }, [dictItem?.id]);

  // 处理表单提交
  // 注意：AdminForm 会先调用 transformData 转换数据，然后调用 onSubmit
  // 所以这里接收到的 data 已经是转换后的数据
  const handleSubmit = useCallback(async (data: DictItemFormData & Record<string, unknown>) => {
    try {
      if (dictItem?.id) {
        // 更新字典项
        await DictAPI.updateDictItem(dictCode, dictItem.id, data);
        toast.success('修改成功');
      } else {
        // 创建字典项
        await DictAPI.createDictItem(dictCode, data);
        toast.success('新增成功');
      }

      // 注意：onSuccess 和 onClose 由 AdminForm 统一处理，这里不需要调用
      // AdminForm 会在提交成功后自动调用 onSuccess，然后关闭弹窗
    } catch (error) {
      // 错误需要重新抛出，让 AdminForm 知道提交失败
      // 但错误提示已由响应拦截器统一处理，这里不需要额外处理
      throw error;
    }
  }, [dictCode, dictItem?.id]);

  return (
    <AdminForm
      visible={visible}
      initialData={formData}
      formId={dictItem?.id}
      title={dictItem?.id ? '编辑字典项' : '新增字典项'}
      description={dictItem?.id ? '修改字典项信息' : '填写字典项基本信息'}
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

export default DictItemFormModal;

