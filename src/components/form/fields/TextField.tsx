/**
 * 文本输入字段组件
 * 封装了 FormField + Input 的常用组合
 */

"use client";

import React from 'react';
import FormField from '../FormField';
import Input from '../input/InputField';

export interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password';
  layout?: 'vertical' | 'inline';
  className?: string;
  inputClassName?: string;
  validate?: (value: string) => string;
  autoManageTouched?: boolean;
  forceShowError?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
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
  type = 'text',
  layout = 'inline',
  className = '',
  inputClassName = '',
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
      <Input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
        className={inputClassName}
      />
    </FormField>
  );
};

export default TextField;

