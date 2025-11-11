/**
 * 表单管理 Hook
 * 提供统一的表单状态管理、验证和提交逻辑
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => FormErrors<T>;
  onReset?: () => void;
  resetOnSubmit?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  isSubmitting: boolean;
  touched: Partial<Record<keyof T, boolean>>;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(field: K, error: string | undefined) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
  handleBlur: <K extends keyof T>(field: K) => () => void;
  validateField: <K extends keyof T>(field: K) => string | undefined;
  validateForm: () => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  resetErrors: () => void;
}

/**
 * 表单管理 Hook
 * @param options 表单配置选项
 * @returns 表单状态和方法
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    onSubmit,
    validate,
    onReset,
    resetOnSubmit = false,
  } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 使用 ref 存储上一次的 initialValues 的序列化值，用于深度比较
  const prevInitialValuesRef = useRef<string | undefined>(undefined);

  // 初始化表单值（当 initialValues 真正变化时）
  useEffect(() => {
    // 使用 JSON.stringify 进行深度比较（对于简单对象足够）
    const currentInitialValuesStr = JSON.stringify(initialValues);
    const prevInitialValuesStr = prevInitialValuesRef.current;

    // 只有当 initialValues 真正变化时才更新
    if (prevInitialValuesStr !== currentInitialValuesStr) {
      setValuesState(initialValues);
      setErrorsState({});
      setTouchedState({});
      prevInitialValuesRef.current = currentInitialValuesStr;
    }
  }, [initialValues]);

  // 设置单个字段值
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // 批量设置字段值
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  // 设置单个字段错误
  const setError = useCallback(<K extends keyof T>(field: K, error: string | undefined) => {
    setErrorsState(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
    });
  }, []);

  // 批量设置错误
  const setErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrorsState(newErrors);
  }, []);

  // 设置字段触摸状态
  const setTouched = useCallback(<K extends keyof T>(field: K, isTouched: boolean) => {
    setTouchedState(prev => ({
      ...prev,
      [field]: isTouched,
    }));
  }, []);

  // 创建字段变化处理器
  const handleChange = useCallback(<K extends keyof T>(field: K) => {
    return (value: T[K]) => {
      setValue(field, value);
    };
  }, [setValue]);

  // 创建字段失焦处理器
  const handleBlur = useCallback(<K extends keyof T>(field: K) => {
    return () => {
      setTouched(field, true);
      // 如果有验证函数，执行验证
      if (validate) {
        const fieldErrors = validate(values);
        if (fieldErrors[field]) {
          setError(field, fieldErrors[field]);
        }
      }
    };
  }, [setTouched, validate, values, setError]);

  // 验证单个字段
  const validateField = useCallback(<K extends keyof T>(field: K): string | undefined => {
    if (!validate) return undefined;
    const fieldErrors = validate(values);
    return fieldErrors[field];
  }, [validate, values]);

  // 验证整个表单
  const validateForm = useCallback((): boolean => {
    if (!validate) return true;
    const newErrors = validate(values);
    setErrorsState(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validate, values]);

  // 重置表单
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
    if (onReset) {
      onReset();
    }
  }, [initialValues, onReset]);

  // 重置错误
  const resetErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  // 处理表单提交
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (isSubmitting) {
      return;
    }

    // 先验证表单
    if (!validateForm()) {
      // 验证失败，标记所有字段为已触摸
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      Object.keys(values).forEach(key => {
        allTouched[key as keyof T] = true;
      });
      setTouchedState(allTouched);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      // 错误处理由调用方负责（如 request.ts）
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateForm, onSubmit, values, resetOnSubmit, reset]);

  return {
    values,
    errors,
    isSubmitting,
    touched,
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    resetErrors,
  };
}

