/**
 * 多行文本输入字段组件
 * 封装了 FormField + TextArea 的常用组合
 */

"use client";

import React from 'react';
import FormField from '../FormField';
import TextArea from '../input/TextArea';

export interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  layout?: 'vertical' | 'inline';
  className?: string;
  textAreaClassName?: string;
  validate?: (value: string) => string;
  autoManageTouched?: boolean;
  forceShowError?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name: _name, // eslint-disable-line @typescript-eslint/no-unused-vars
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  required = false,
  error,
  helpText,
  disabled = false,
  layout = 'inline',
  className = '',
  textAreaClassName = '',
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
      <TextArea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={!!error}
        className={textAreaClassName}
      />
    </FormField>
  );
};

export default TextAreaField;

