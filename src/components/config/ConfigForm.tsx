/**
 * 系统配置表单组件
 */

"use client";

import React, { useState, useEffect } from 'react';
import ModalForm from '@/components/form/ModalForm';
import FormField from '@/components/form/FormField';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import type { ConfigFormData } from '@/api/config.api';
import { handleError } from '@/utils/error-handler';

interface ConfigFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConfigFormData) => Promise<void>;
  initialData?: Partial<ConfigFormData>;
  loading?: boolean;
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ConfigFormData>({
    configName: '',
    configKey: '',
    configValue: '',
    remark: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        configName: initialData.configName || '',
        configKey: initialData.configKey || '',
        configValue: initialData.configValue || '',
        remark: initialData.remark || '',
        ...(initialData.id && { id: initialData.id })
      });
    } else {
      setFormData({
        configName: '',
        configKey: '',
        configValue: '',
        remark: ''
      });
    }
    // 重置错误
    setErrors({});
  }, [initialData, isOpen]);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.configName.trim()) {
      newErrors.configName = '配置名称不能为空';
    } else if (formData.configName.length > 50) {
      newErrors.configName = '配置名称不能超过50个字符';
    }

    if (!formData.configKey.trim()) {
      newErrors.configKey = '配置键不能为空';
    } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.configKey)) {
      newErrors.configKey = '配置键只能包含字母、数字、下划线和点';
    } else if (formData.configKey.length > 100) {
      newErrors.configKey = '配置键不能超过100个字符';
    }

    if (!formData.configValue.trim()) {
      newErrors.configValue = '配置值不能为空';
    } else if (formData.configValue.length > 500) {
      newErrors.configValue = '配置值不能超过500个字符';
    }

    if (formData.remark && formData.remark.length > 200) {
      newErrors.remark = '描述不能超过200个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // request.ts 已经处理了错误提示，这里只记录日志
      handleError(error, { showToast: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof ConfigFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isEdit = !!initialData?.id;
  const title = isEdit ? '编辑配置' : '新增配置';
  const description = isEdit ? '修改配置信息' : '填写配置基本信息';

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={title}
      description={description}
      loading={loading}
      isSubmitting={isSubmitting}
      submitText={isEdit ? '更新' : '创建'}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* 配置名称 */}
        <FormField
          label="配置名称"
          required
          error={errors.configName}
          layout="inline"
        >
          <Input
            value={formData.configName}
            onChange={(e) => handleInputChange('configName', e.target.value)}
            placeholder="请输入配置名称"
            error={!!errors.configName}
          />
        </FormField>

        {/* 配置键 */}
        <FormField
          label="配置键"
          required
          error={errors.configKey}
          layout="inline"
        >
          <Input
            value={formData.configKey}
            onChange={(e) => handleInputChange('configKey', e.target.value)}
            placeholder="如：sys.name"
            error={!!errors.configKey}
          />
        </FormField>

        {/* 配置值 */}
        <FormField
          label="配置值"
          required
          error={errors.configValue}
          layout="inline"
        >
          <Input
            value={formData.configValue}
            onChange={(e) => handleInputChange('configValue', e.target.value)}
            placeholder="请输入配置值"
            error={!!errors.configValue}
          />
        </FormField>

        {/* 描述 */}
        <FormField
          label="描述"
          error={errors.remark}
          layout="inline"
        >
          <TextArea
            value={formData.remark || ''}
            onChange={(value) => handleInputChange('remark', value)}
            placeholder="请输入描述（可选）"
            error={!!errors.remark}
            rows={4}
          />
        </FormField>
      </div>
    </ModalForm>
  );
};

export default ConfigForm;

