/**
 * 通用表单组件
 * 提供统一的表单功能：字段渲染、验证、提交等
 */

"use client";

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import MultiSelect from '@/components/form/MultiSelect';
import Switch from '@/components/form/switch/Switch';
import DatePicker from '@/components/form/date-picker';
import { GenericFormProps, FieldConfig } from './types';

/**
 * 通用表单组件
 */
export default function GenericForm<T extends Record<string, unknown>>({
  visible,
  initialData,
  formId,
  useFormHook,
  useOperationsHook,
  title,
  description,
  fields,
  onSubmit,
  onCancel,
  onSuccess,
  validation,
  renderFooter,
  renderHeader,
  modalClassName = '',
  formClassName = '',
  width = '480px',
  destroyOnClose = false,
  layout = 'inline',
  labelWidth = 'min-w-[80px]',
  transformData,
}: GenericFormProps<T>) {
  // 状态管理
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, Array<{ label: string; value: string | number }>>>({});
  
  // 使用 ref 存储 fields 和 formData，避免在 useEffect/useCallback 中依赖它们
  const fieldsRef = React.useRef(fields);
  const formDataRef = React.useRef(formData);
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Hooks
  const formHook = useFormHook?.();
  const operationsHook = useOperationsHook();
  const loading = formHook?.loading || operationsHook.loading || false;
  // 稳定 fetchFormData 的引用，避免作为依赖导致循环
  const fetcherRef = React.useRef(formHook?.fetchFormData);
  useEffect(() => {
    fetcherRef.current = formHook?.fetchFormData;
  }, [formHook?.fetchFormData]);

  // 加载表单数据
  useEffect(() => {
    if (visible) {
      // 调试日志：依赖与入口状态
      try {
        // 仅在开发或调试场景打印，避免噪音
        console.debug('[GenericForm] effect(load data) enter', {
          visible,
          formId,
          hasInitialData: !!initialData,
          initialDataKeys: initialData ? Object.keys(initialData) : [],
          fieldsCount: fieldsRef.current?.length,
          hasFetcher: !!fetcherRef.current,
        });
      } catch {}
      const fetcher = fetcherRef.current;
      if (formId && fetcher) {
        console.debug('[GenericForm] calling fetchFormData with formId:', formId);
        fetcher(formId);
      } else if (initialData) {
        // 仅当内容变化时更新，避免不必要的重渲染
        setFormData(prev => {
          if (prev === initialData) return prev;
          const prevKeys = Object.keys(prev || {});
          const nextKeys = Object.keys(initialData || {});
          const sameKeys =
            prevKeys.length === nextKeys.length &&
            prevKeys.every(k => (initialData as Record<string, unknown>)[k] === (prev as Record<string, unknown>)[k]);
          if (sameKeys) {
            console.debug('[GenericForm] skip setFormData(initialData) because content equal');
            return prev;
          }
          console.debug('[GenericForm] setFormData from initialData');
          return initialData as Partial<T>;
        });
      } else {
        // 使用字段的默认值初始化
        const defaultData: Partial<T> = {};
        // 使用 ref 获取最新的 fields
        fieldsRef.current.forEach(field => {
          if (field.defaultValue !== undefined) {
            defaultData[field.key] = field.defaultValue as T[keyof T];
          }
        });
        setFormData(prev => {
          const prevKeys = Object.keys(prev || {});
          const nextKeys = Object.keys(defaultData || {});
          const sameKeys =
            prevKeys.length === nextKeys.length &&
            prevKeys.every(k => (defaultData as Record<string, unknown>)[k] === (prev as Record<string, unknown>)[k]);
          if (sameKeys) {
            console.debug('[GenericForm] skip setFormData(defaults) because content equal');
            return prev;
          }
          console.debug('[GenericForm] setFormData from defaults');
          return defaultData;
        });
      }
      setErrors({});
    }
  }, [visible, formId, initialData]);

  // 同步获取到的表单数据
  useEffect(() => {
    if (!formHook?.formData) return;
    const next = formHook.formData as Partial<T>;
    const prev = formDataRef.current as Partial<T>;
    const prevKeys = Object.keys(prev || {});
    const nextKeys = Object.keys(next || {});
    const same =
      prevKeys.length === nextKeys.length &&
      prevKeys.every(k => (next as Record<string, unknown>)[k] === (prev as Record<string, unknown>)[k]);
    if (same) return;
    console.debug('[GenericForm] sync formHook.formData -> formData');
    setFormData(next);
  }, [formHook?.formData]);

  // 加载字段选项
  useEffect(() => {
    const loadOptions = async () => {
      const optionsMap: Record<string, Array<{ label: string; value: string | number }>> = {};
      // 使用 ref 获取最新的 fields
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
      // 使用 ref 获取最新的 fields
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
    // 使用 ref 获取最新的 formData 和 fields
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
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // 使用 ref 获取最新的 formData
      const currentFormData = formDataRef.current;
      const dataToSubmit = transformData ? transformData(currentFormData as T) : (currentFormData as T);
      
      // 先调用 onSubmit 回调（用于额外的处理逻辑，如数据转换、日志记录等）
      await onSubmit(dataToSubmit);
      
      // 如果使用操作 Hook，调用相应的创建或更新方法
      let success = false;
      if (operationsHook.create && !formId) {
        success = await operationsHook.create(dataToSubmit);
      } else if (operationsHook.update && formId) {
        success = await operationsHook.update(formId, dataToSubmit);
      } else {
        // 如果没有提供 operationsHook，认为 onSubmit 已经处理了提交
        success = true;
      }
      
      // 只有成功时才调用 onSuccess
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  }, [validateForm, onSubmit, onSuccess, transformData, operationsHook, formId]);

  // 处理关闭
  const handleClose = useCallback(() => {
    if (destroyOnClose) {
      setFormData({});
    }
    setErrors({});
    if (formHook?.resetFormData) {
      formHook.resetFormData();
    }
    if (onCancel) {
      onCancel();
    }
  }, [destroyOnClose, formHook, onCancel]);

  // 渲染字段
  const renderField = useCallback((field: FieldConfig<T>) => {
    // 条件显示
    if (field.show && !field.show(formData as T)) {
      return null;
    }

    const value = formData[field.key];
    const error = errors[field.key as string];
    const fieldLayout = field.layout || layout;
    const fieldLabelWidth = field.labelWidth || labelWidth;

    const fieldContent = (
      <div className="flex-1">
        {field.render ? (
          field.render(value, (newValue) => handleFieldChange(field.key, newValue), formData as T)
        ) : (
          <>
            {(field.type === 'text' || field.type === 'email' || field.type === 'password' || field.type === 'number') && (
              <Input
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
            {field.type === 'custom' && field.render && (() => {
              const renderFn = field.render as (value: unknown, onChange: (value: unknown) => void, formData: T) => ReactNode;
              return <>{renderFn(value, (newValue: unknown) => handleFieldChange(field.key, newValue), formData as T)}</>;
            })()}
          </>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
        {field.helpText && !error && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
        )}
      </div>
    );

    if (fieldLayout === 'inline') {
      return (
        <div key={String(field.key)} className={`flex gap-4 items-${field.type === 'textarea' ? 'start' : 'center'} ${field.className || ''}`}>
          <Label required={field.required} className={`text-sm text-right whitespace-nowrap ${fieldLabelWidth} ${field.type === 'textarea' ? 'pt-3' : ''}`}>
            {field.label}
          </Label>
          {fieldContent}
        </div>
      );
    } else {
      return (
        <div key={String(field.key)} className={`flex flex-col gap-2 ${field.className || ''}`}>
          <Label required={field.required} className="text-sm">
            {field.label}
          </Label>
          {fieldContent}
        </div>
      );
    }
  }, [formData, errors, fieldOptions, layout, labelWidth, loading, handleFieldChange]);

  // 使用 Portal 将表单挂载到 body
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <div className={`fixed inset-0 z-[100000] ${visible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-500 ease-out z-[100001] ${
          visible ? 'opacity-30' : 'opacity-0'
        }`} 
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target === e.currentTarget) {
            setTimeout(() => {
              handleClose();
            }, 300);
          }
        }}
      ></div>
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform z-[100002] ${
          visible ? 'translate-x-0' : 'translate-x-full'
        } ${modalClassName}`}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
              fill="currentColor"
            />
          </svg>
        </button>
        
        <div className={`p-6 h-full overflow-y-auto ${formClassName}`}>
          {renderHeader ? renderHeader() : (
            <>
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                {title}
              </h2>
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {description}
                </p>
              )}
            </>
          )}
          
          <div className="space-y-4">
            {fields.map(field => renderField(field))}

            {/* 操作按钮 */}
            {renderFooter ? (
              renderFooter(handleSubmit, handleClose, loading)
            ) : (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {formId ? '更新' : '创建'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  取消
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

