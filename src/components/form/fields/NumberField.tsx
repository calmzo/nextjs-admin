/**
 * 数字输入字段组件
 * 封装了 FormField + Input (type="number") 的常用组合
 */

"use client";

import React from 'react';
import FormField from '../FormField';
import Input from '../input/InputField';

export interface NumberFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  layout?: 'vertical' | 'inline';
  className?: string;
  inputClassName?: string;
  validate?: (value: number) => string;
  autoManageTouched?: boolean;
  forceShowError?: boolean;
}

const NumberField: React.FC<NumberFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
  min,
  max,
  step,
  layout = 'inline',
  className = '',
  inputClassName = '',
  validate,
  autoManageTouched = false,
  forceShowError = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
    onChange(numValue);
  };

  // 适配 validate 函数的类型：将 (value: number) => string 转换为 (value: unknown) => string
  const adaptedValidate = validate
    ? (val: unknown): string => {
        if (typeof val === 'number') {
          return validate(val);
        }
        return '';
      }
    : undefined;

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      layout={layout}
      className={className}
      validate={adaptedValidate}
      value={value}
      onValueChange={(val) => onChange(typeof val === 'number' ? val : parseFloat(String(val || 0)) || 0)}
      onBlur={onBlur}
      autoManageTouched={autoManageTouched}
      forceShowError={forceShowError}
    >
      <Input
        type="number"
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        min={min?.toString()}
        max={max?.toString()}
        step={step}
        error={!!error}
        className={inputClassName}
      />
    </FormField>
  );
};

export default NumberField;

