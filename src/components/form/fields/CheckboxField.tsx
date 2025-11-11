/**
 * 复选框字段组件
 * 封装了 FormField + Checkbox 的常用组合
 * 支持单个复选框和多个复选框（多选）
 */

"use client";

import React from 'react';
import FormField from '../FormField';
import Checkbox from '../input/Checkbox';

export interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxFieldProps {
  label: string;
  name: string;
  // 单个复选框模式：value 为 boolean
  // 多个复选框模式：value 为 string[]（选中的值数组）
  value: boolean | string[];
  onChange: (value: boolean | string[]) => void;
  onBlur?: () => void;
  // 单个复选框模式：不提供 options，使用 checkboxLabel 作为复选框标签
  // 多个复选框模式：提供 options 数组
  options?: CheckboxOption[];
  checkboxLabel?: string; // 单个复选框模式的标签（可选，如果不提供则不显示 FormField 的 label）
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  layout?: 'vertical' | 'inline';
  direction?: 'horizontal' | 'vertical'; // 选项的排列方向（仅多选模式）
  className?: string;
  checkboxClassName?: string;
  validate?: (value: boolean | string[]) => string;
  autoManageTouched?: boolean;
  forceShowError?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  checkboxLabel,
  required = false,
  error,
  helpText,
  disabled = false,
  layout = 'inline',
  direction = 'horizontal',
  className = '',
  checkboxClassName = '',
  validate,
  autoManageTouched = false,
  forceShowError = false,
}) => {
  // 判断是单个复选框还是多个复选框
  const isMultiple = Array.isArray(options) && options.length > 0;

  // 单个复选框模式
  if (!isMultiple) {
    const checked = typeof value === 'boolean' ? value : false;

    const handleChange = (checked: boolean) => {
      if (!disabled) {
        onChange(checked);
      }
    };

    // 如果提供了 checkboxLabel，使用它作为复选框的标签，FormField 的 label 作为字段标签
    // 如果没有提供 checkboxLabel，则使用 FormField 的 label，复选框不显示标签
    return (
      <FormField
        label={checkboxLabel ? label : ''}
        required={required}
        error={error}
        helpText={helpText}
        layout={layout}
        className={className}
        validate={validate ? (val: unknown) => validate(typeof val === 'boolean' ? val : false) : undefined}
        value={checked}
        onValueChange={(val) => onChange(!!val)}
        onBlur={onBlur}
        autoManageTouched={autoManageTouched}
        forceShowError={forceShowError}
      >
        <Checkbox
          id={name}
          checked={checked}
          onChange={handleChange}
          label={checkboxLabel || label}
          disabled={disabled}
          className={checkboxClassName}
        />
      </FormField>
    );
  }

  // 多个复选框模式
  const selectedValues = Array.isArray(value) ? value : [];
  
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (!disabled) {
      const newValues = checked
        ? [...selectedValues, optionValue]
        : selectedValues.filter((v) => v !== optionValue);
      onChange(newValues);
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
      validate={validate ? (val: unknown) => validate(Array.isArray(val) ? val : []) : undefined}
      value={selectedValues}
      onValueChange={(val) => onChange(Array.isArray(val) ? val : [])}
      onBlur={onBlur}
      autoManageTouched={autoManageTouched}
      forceShowError={forceShowError}
    >
      <div
        className={`flex ${
          direction === 'horizontal' ? 'flex-row items-center gap-6' : 'flex-col gap-3'
        }`}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            id={`${name}-${option.value}`}
            checked={selectedValues.includes(option.value)}
            onChange={(checked) => handleCheckboxChange(option.value, checked)}
            label={option.label}
            disabled={disabled || option.disabled}
            className={checkboxClassName}
          />
        ))}
      </div>
    </FormField>
  );
};

export default CheckboxField;

