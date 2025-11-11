/**
 * 系统配置表单弹窗组件（新增/编辑）
 * 使用 AdminForm 通用表单组件
 */

"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { AdminForm } from '@/components/common/AdminForm';
import { getConfigFormFields } from './ConfigFormFields';
import ConfigAPI, { ConfigFormData, ConfigPageVO } from '@/api/config.api';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';

interface ConfigFormModalProps {
  visible: boolean;
  config?: ConfigPageVO | null; // 编辑时传入，新增时为 null
  onClose: () => void;
  onSuccess?: () => void;
}

const ConfigFormModal: React.FC<ConfigFormModalProps> = ({
  visible,
  config,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ConfigFormData & Record<string, unknown> | undefined>(undefined);

  // 加载表单数据（编辑模式）
  useEffect(() => {
    if (visible && config?.id) {
      setLoading(true);
      ConfigAPI.getFormData(config.id)
        .then((data) => {
          setFormData({
            configName: data.configName || '',
            configKey: data.configKey || '',
            configValue: data.configValue || '',
            remark: data.remark || '',
          });
        })
        .catch((error: unknown) => {
          handleError(error, { showToast: false });
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (visible && !config) {
      // 新增模式：重置表单数据
      setFormData(undefined);
    }
  }, [visible, config]);

  // 获取表单字段配置
  const fields = useMemo(() => {
    return getConfigFormFields();
  }, []);

  // 数据转换函数 - 确保数据格式正确
  const transformData = useCallback((data: ConfigFormData & Record<string, unknown>): ConfigFormData & Record<string, unknown> => {
    const submitData: ConfigFormData & Record<string, unknown> = {
      configName: String(data.configName || '').trim(),
      configKey: String(data.configKey || '').trim(),
      configValue: String(data.configValue || '').trim(),
    };

    // 备注可选
    if (data.remark) {
      submitData.remark = String(data.remark).trim();
    }

    // 编辑时包含 id
    if (config?.id) {
      submitData.id = config.id;
    }

    return submitData;
  }, [config?.id]);

  // 处理表单提交
  // 注意：AdminForm 会先调用 transformData 转换数据，然后调用 onSubmit
  // 所以这里接收到的 data 已经是转换后的数据
  const handleSubmit = useCallback(async (data: ConfigFormData & Record<string, unknown>) => {
    try {
      if (config?.id) {
        // 更新配置
        await ConfigAPI.update(config.id, data);
        toast.success('编辑成功');
      } else {
        // 创建配置
        await ConfigAPI.create(data);
        toast.success('新增成功');
      }

      // 注意：onSuccess 和 onClose 由 AdminForm 统一处理，这里不需要调用
      // AdminForm 会在提交成功后自动调用 onSuccess，然后关闭弹窗
    } catch (error) {
      // 错误需要重新抛出，让 AdminForm 知道提交失败
      // 但错误提示已由响应拦截器统一处理，这里不需要额外处理
      throw error;
    }
  }, [config?.id]);

  return (
    <AdminForm
      visible={visible}
      initialData={formData}
      formId={config?.id}
      title={config?.id ? '编辑系统配置' : '新增系统配置'}
      description={config?.id ? '修改系统配置信息' : '填写系统配置信息'}
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

export default ConfigFormModal;

