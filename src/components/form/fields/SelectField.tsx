/**
 * 下拉选择字段组件
 * 封装了 FormField + Select 的常用组合
 */

"use client";

import React from 'react';
import FormField from '../FormField';
import Select from '../Select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  layout?: 'vertical' | 'inline';
  className?: string;
  selectClassName?: string;
  validate?: (value: string) => string;
  autoManageTouched?: boolean;
  forceShowError?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name: _name, // eslint-disable-line @typescript-eslint/no-unused-vars
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
  layout = 'inline',
  className = '',
  selectClassName = '',
  validate,
  autoManageTouched = false,
  forceShowError = false,
}) => {
  // 适配 validate 函数的类型：将 (value: string) => string 转换为 (value: unknown) => string
  const adaptedValidate = validate
    ? (val: unknown): string => {
        if (typeof val === 'string') {
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
      onValueChange={(val) => onChange(String(val || ''))}
      onBlur={onBlur}
      autoManageTouched={autoManageTouched}
      forceShowError={forceShowError}
    >
      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${error ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${selectClassName}`}
      />
    </FormField>
  );
};

export default SelectField;

