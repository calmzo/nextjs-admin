/**
 * 日期选择器字段组件
 * 封装了 FormField + DatePicker 的常用组合
 */

"use client";

import React, { useEffect, useRef } from 'react';
import FormField from '../FormField';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { CalenderIcon } from '../../../icons';
import Hook = flatpickr.Options.Hook;

export interface DateFieldProps {
  label: string;
  name: string;
  value: string; // 日期字符串，格式为 YYYY-MM-DD
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  mode?: 'single' | 'multiple' | 'range' | 'time';
  dateFormat?: string; // 默认 'Y-m-d'
  layout?: 'vertical' | 'inline';
  className?: string;
  inputClassName?: string;
  validate?: (value: string) => string;
  autoManageTouched?: boolean;
  forceShowError?: boolean;
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder = '请选择日期',
  required = false,
  error,
  helpText,
  disabled = false,
  mode = 'single',
  dateFormat = 'Y-m-d',
  layout = 'inline',
  className = '',
  inputClassName = '',
  validate,
  autoManageTouched = false,
  forceShowError = false,
}) => {
  const inputId = `date-field-${name}`;
  const flatpickrInstanceRef = useRef<flatpickr.Instance | null>(null);

  // 初始化 flatpickr
  useEffect(() => {
    if (disabled) {
      return;
    }

    const inputElement = document.getElementById(inputId);
    if (!inputElement) {
      return;
    }

    const handleChange: Hook = (selectedDates, dateStr) => {
      if (mode === 'single' && dateStr) {
        onChange(dateStr);
      } else if (mode === 'multiple' || mode === 'range') {
        onChange(dateStr);
      }
    };

    const flatPickr = flatpickr(`#${inputId}`, {
      mode: mode,
      static: true,
      monthSelectorType: 'static',
      dateFormat: dateFormat,
      defaultDate: value || undefined,
      onChange: handleChange,
      appendTo: typeof window !== 'undefined' ? document.body : undefined,
    });

    // flatpickr 可能返回单个实例或数组，我们只处理单个实例的情况
    if (!Array.isArray(flatPickr)) {
      flatpickrInstanceRef.current = flatPickr;
    }

    return () => {
      if (flatPickr && !Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, dateFormat, disabled, inputId, value, onChange]);

  // 当 value 变化时，更新 flatpickr 的值
  useEffect(() => {
    if (flatpickrInstanceRef.current && value) {
      flatpickrInstanceRef.current.setDate(value, false);
    } else if (flatpickrInstanceRef.current && !value) {
      flatpickrInstanceRef.current.clear();
    }
  }, [value]);

  // 处理输入框的 onBlur
  const handleInputBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      layout={layout}
      className={className}
      validate={validate ? (val: unknown) => validate(String(val || '')) : undefined}
      value={value}
      onValueChange={(val) => onChange(String(val || ''))}
      onBlur={handleInputBlur}
      autoManageTouched={autoManageTouched}
      forceShowError={forceShowError}
    >
      <div className="relative">
        <input
          id={inputId}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${inputClassName}`}
          onBlur={handleInputBlur}
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </FormField>
  );
};

export default DateField;

