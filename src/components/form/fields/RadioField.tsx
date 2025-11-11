/**
 * 单选按钮组字段组件
 * 封装了 FormField + Radio 的常用组合
 */

"use client";

import React from 'react';
import FormField from '../FormField';
import Radio from '../input/Radio';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: RadioOption[];
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  layout?: 'vertical' | 'inline';
  direction?: 'horizontal' | 'vertical'; // 选项的排列方向
  className?: string;
  radioClassName?: string;
  validate?: (value: string) => string;
  autoManageTouched?: boolean;
  forceShowError?: boolean;
}

const RadioField: React.FC<RadioFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  required = false,
  error,
  helpText,
  disabled = false,
  layout = 'inline',
  direction = 'horizontal',
  className = '',
  radioClassName = '',
  validate,
  autoManageTouched = false,
  forceShowError = false,
}) => {
  const handleRadioChange = (radioValue: string) => {
    if (!disabled) {
      onChange(radioValue);
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
          <Radio
            key={option.value}
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={handleRadioChange}
            label={option.label}
            disabled={disabled || option.disabled}
            className={radioClassName}
          />
        ))}
      </div>
    </FormField>
  );
};

export default RadioField;

