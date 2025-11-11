/**
 * 通用管理表单组件
 * 用于系统管理相关的表单（通知、部门、角色、菜单、字典等）
 * 基于 ModalForm 和字段配置实现
 */

"use client";

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import ModalForm from '@/components/form/ModalForm';
import FormField from '@/components/form/FormField';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import MultiSelect from '@/components/form/MultiSelect';
import Switch from '@/components/form/switch/Switch';
import DatePicker from '@/components/form/date-picker';
import Radio from '@/components/form/input/Radio';
import { AdminFormProps, AdminFieldConfig } from './types';

/**
 * 通用管理表单组件
 */
export default function AdminForm<T extends Record<string, unknown>>({
  visible,
  initialData,
  formId,
  title,
  description,
  fields,
  onSubmit,
  onCancel,
  onSuccess,
  validation,
  renderFooter,
  renderHeader,
  maxWidth = '2xl',
  destroyOnClose = false,
  layout = 'inline',
  transformData,
  loading = false,
  submitText,
}: AdminFormProps<T>) {
  // 状态管理
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, Array<{ label: string; value: string | number }>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 使用 ref 存储 fields 和 formData，避免在 useEffect/useCallback 中依赖它们
  const fieldsRef = React.useRef(fields);
  const formDataRef = React.useRef(formData);
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // 加载表单数据
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setFormData(initialData);
      } else {
        // 使用字段的默认值初始化
        const defaultData: Partial<T> = {};
        fieldsRef.current.forEach(field => {
          if (field.defaultValue !== undefined) {
            defaultData[field.key] = field.defaultValue as T[keyof T];
          }
        });
        setFormData(defaultData);
      }
      setErrors({});
    }
  }, [visible, initialData]);

  // 加载字段选项
  useEffect(() => {
    const loadOptions = async () => {
      const optionsMap: Record<string, Array<{ label: string; value: string | number }>> = {};
      for (const field of fieldsRef.current) {
        if (field.loadOptions) {
          try {
            const options = await field.loadOptions();
            optionsMap[field.key as string] = options;
          } catch (error) {
            console.error(`Failed to load options for field ${String(field.key)}:`, error);
          }
        }
      }
      setFieldOptions(optionsMap);
    };
    if (visible) {
      loadOptions();
    }
  }, [visible]);

  // 处理字段变化
  const handleFieldChange = useCallback((fieldKey: keyof T, value: unknown) => {
    setFormData(prev => {
      const newFormData = { ...prev, [fieldKey]: value };
      
      // 清除该字段的错误
      setErrors(prevErrors => {
        if (!prevErrors[fieldKey as string]) {
          return prevErrors;
        }
        const newErrors = { ...prevErrors };
        delete newErrors[fieldKey as string];
        return newErrors;
      });

      // 字段级验证（使用最新的 formData）
      const field = fieldsRef.current.find(f => f.key === fieldKey);
      if (field?.validate) {
        const error = field.validate(value, newFormData as T);
        if (error) {
          setErrors(prevErrors => ({ ...prevErrors, [fieldKey as string]: error }));
        }
      }
      
      return newFormData;
    });
  }, []);

  // 验证表单
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const currentFormData = formDataRef.current;

    // 字段级验证
    fieldsRef.current.forEach(field => {
      // 条件显示检查
      if (field.show && !field.show(currentFormData as T)) {
        return; // 跳过隐藏字段
      }

      const value = currentFormData[field.key];
      
      // 必填验证
      if (field.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
        newErrors[field.key as string] = `请输入${field.label}`;
        return;
      }

      // 自定义验证
      if (field.validate && value !== undefined && value !== null && value !== '') {
        const error = field.validate(value, currentFormData as T);
        if (error) {
          newErrors[field.key as string] = error;
        }
      }
    });

    // 表单级验证
    if (validation?.validate) {
      const formErrors = validation.validate(currentFormData as T);
      Object.assign(newErrors, formErrors);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validation]);

  // 处理提交
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const currentFormData = formDataRef.current;
      const dataToSubmit = transformData ? transformData(currentFormData as T) : (currentFormData as T);
      
      await onSubmit(dataToSubmit);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, onSuccess, transformData]);

  // 处理关闭
  const handleClose = useCallback(() => {
    if (destroyOnClose) {
      setFormData({});
    }
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  }, [destroyOnClose, onCancel]);

  // 提供无参的提交触发器，满足 renderFooter 的签名
  const triggerSubmit = useCallback(() => {
    const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
    void handleSubmit(fakeEvent);
  }, [handleSubmit]);

  // 渲染字段
  const renderField = useCallback((field: AdminFieldConfig<T>) => {
    // 条件显示
    if (field.show && !field.show(formData as T)) {
      return null;
    }

    const value = formData[field.key];
    const error = errors[field.key as string];
    const fieldLayout = field.layout || layout;

    // 字段内容，错误和帮助文本由 FormField 统一处理
    const inputId = `${String(field.key)}-input`;
    const labelId = `${String(field.key)}-label`;
    const fieldContent = (
      <div className="flex-1">
        {field.render ? (
          field.render(value, (newValue) => handleFieldChange(field.key, newValue), formData as T)
        ) : (
          <>
            {(field.type === 'text' || field.type === 'email' || field.type === 'password' || field.type === 'number') && (
              <Input
                id={inputId}
                type={field.type === 'number' ? 'number' : field.type}
                value={String(value || '')}
                onChange={(e) => handleFieldChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={field.placeholder}
                error={!!error}
                disabled={field.disabled || loading}
                min={field.min?.toString()}
                max={field.max?.toString()}
                step={field.step}
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                id={inputId}
                value={String(value || '')}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 4}
                disabled={field.disabled || loading}
                className={`h-auto w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 ${
                  error ? 'border-error-500 focus:border-error-300 focus:ring-error-500/20' : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10'
                } ${field.disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700`}
              />
            )}
            {field.type === 'select' && (
              <Select
                id={inputId}
                options={(field.options || fieldOptions[field.key as string] || []).map(opt => ({
                  label: opt.label,
                  value: String(opt.value),
                }))}
                value={String(value || '')}
                onChange={(val) => handleFieldChange(field.key, val)}
                placeholder={field.placeholder}
                className={error ? 'border-red-500' : ''}
              />
            )}
            {field.type === 'multiSelect' && (
              <MultiSelect
                label=""
                options={(field.options || fieldOptions[field.key as string] || []).map(opt => ({
                  value: String(opt.value),
                  text: opt.label,
                  selected: false,
                }))}
                defaultSelected={Array.isArray(value) ? value.map(v => String(v)) : []}
                onChange={(selectedValues) => {
                  const typedValues = field.options?.[0]?.value !== undefined && typeof field.options[0].value === 'number'
                    ? selectedValues.map(v => Number(v))
                    : selectedValues;
                  handleFieldChange(field.key, typedValues);
                }}
                disabled={field.disabled || loading}
              />
            )}
            {field.type === 'switch' && (
              <Switch
                defaultChecked={Boolean(value)}
                onChange={(checked) => handleFieldChange(field.key, checked)}
                disabled={field.disabled || loading}
                color="blue"
              />
            )}
            {field.type === 'date' && (
              <DatePicker
                id={`${String(field.key)}-picker`}
                mode={field.mode || 'single'}
                placeholder={field.placeholder}
                onChange={(dates) => {
                  if (field.mode === 'range' && Array.isArray(dates)) {
                    handleFieldChange(field.key, dates);
                  } else if (!Array.isArray(dates)) {
                    handleFieldChange(field.key, dates);
                  }
                }}
                defaultDate={value as string | Date | undefined}
              />
            )}
            {field.type === 'radio' && (
              <div
                role="radiogroup"
                aria-labelledby={labelId}
                className={`flex ${
                  field.direction === 'vertical' ? 'flex-col gap-3' : 'flex-row items-center gap-6'
                }`}
              >
                {(field.options || []).map((option) => (
                  <Radio
                    key={option.value}
                    id={`${String(field.key)}-${option.value}`}
                    name={String(field.key)}
                    value={String(option.value)}
                    checked={String(value || '') === String(option.value)}
                    onChange={(val) => {
                      // 根据选项值的类型转换
                      const convertedValue = typeof option.value === 'number' ? Number(val) : val;
                      handleFieldChange(field.key, convertedValue);
                    }}
                    label={option.label}
                    disabled={field.disabled || loading}
                  />
                ))}
              </div>
            )}
            {field.type === 'custom' && field.render && (() => {
              const renderFn = field.render as (value: unknown, onChange: (value: unknown) => void, formData: T) => ReactNode;
              return <>{renderFn(value, (newValue: unknown) => handleFieldChange(field.key, newValue), formData as T)}</>;
            })()}
          </>
        )}
      </div>
    );

    return (
      <FormField
        key={String(field.key)}
        label={field.label}
        required={field.required}
        htmlFor={field.type === 'radio' ? undefined : inputId}
        labelId={field.type === 'radio' ? labelId : undefined}
        forceShowError
        error={error}
        helpText={field.helpText}
        layout={fieldLayout}
        className={field.className}
      >
        {fieldContent}
      </FormField>
    );
  }, [formData, errors, fieldOptions, layout, loading, handleFieldChange]);

  return (
    <ModalForm
      isOpen={visible}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={title}
      description={description}
      loading={loading}
      isSubmitting={isSubmitting}
      submitText={submitText || (formId ? '更新' : '创建')}
      maxWidth={maxWidth}
      showFooter={!renderFooter}
    >
      {renderHeader ? renderHeader() : null}
      
      <div className="space-y-4">
        {fields.map(field => renderField(field))}
      </div>

      {renderFooter && renderFooter(triggerSubmit, handleClose, loading || isSubmitting)}
    </ModalForm>
  );
}

