/**
 * 通用表单字段组件
 * 提供统一的字段布局、标签、错误提示等功能
 * 支持字段触摸状态管理和智能错误显示
 */

"use client";

import React, { useState, useCallback } from 'react';
import Label from './Label';

interface FormFieldProps {
  label: string;
  required?: boolean;
  htmlFor?: string;
  labelId?: string;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  helpTextClassName?: string;
  layout?: 'vertical' | 'inline';
  labelWidth?: string;
  // 验证相关属性
  validate?: (value: unknown) => string; // 验证函数，返回错误信息，无错误返回空字符串
  value?: unknown; // 当前字段值，用于判断是否应该清除"请输入xxx"的错误
  onBlur?: () => void; // 失去焦点回调
  onValueChange?: (value: unknown) => void; // 值变化回调
  touched?: boolean; // 是否已触摸（外部控制）
  onTouchedChange?: (touched: boolean) => void; // 触摸状态变化回调
  // 是否自动管理触摸状态（如果为true，组件内部管理；如果为false，使用外部传入的touched）
  autoManageTouched?: boolean;
  // 是否强制显示错误（即使未触摸也显示，用于提交时）
  forceShowError?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  htmlFor,
  labelId,
  error: externalError,
  helpText,
  children,
  className = '',
  labelClassName = '',
  errorClassName = '',
  helpTextClassName = '',
  layout = 'vertical',
  labelWidth = 'min-w-[80px]',
  validate,
  value,
  onBlur,
  onValueChange,
  touched: externalTouched,
  onTouchedChange,
  autoManageTouched = false,
  forceShowError = false,
}) => {
  // 内部触摸状态管理（仅在 autoManageTouched 为 true 时使用）
  const [internalTouched, setInternalTouched] = useState(false);
  
  // 确定使用哪个触摸状态
  const isTouched = autoManageTouched ? internalTouched : (externalTouched ?? false);
  
  // 内部验证错误（仅在提供 validate 函数时使用）
  const [internalError, setInternalError] = useState('');
  
  // 确定使用的错误信息
  const error = externalError ?? internalError;
  
  // 处理失去焦点
  const handleBlur = useCallback(() => {
    // 更新触摸状态
    if (autoManageTouched) {
      setInternalTouched(true);
    } else if (onTouchedChange) {
      onTouchedChange(true);
    }
    
    // 如果有验证函数，执行验证
    if (validate && value !== undefined) {
      const errorMsg = validate(value);
      setInternalError(errorMsg);
    }
    
    // 调用外部回调
    if (onBlur) {
      onBlur();
    }
  }, [validate, value, onBlur, autoManageTouched, onTouchedChange]);
  
  // 处理值变化
  const handleValueChange = useCallback((newValue: unknown) => {
    // 如果字段有值且已触摸，重新验证
    if (isTouched) {
      const currentError = externalError ?? internalError;
      // 如果字段有值，且当前错误是"请输入xxx"类型，则重新验证
      if (newValue && String(newValue).trim()) {
        const trimmedValue = String(newValue).trim();
        if (trimmedValue && currentError?.includes('请输入')) {
          if (validate) {
            // 重新验证，可能还有格式错误
            const errorMsg = validate(newValue);
            setInternalError(errorMsg);
          } else if (!externalError) {
            // 如果没有外部错误且没有验证函数，清除内部错误
            setInternalError('');
          }
        }
      }
    }
    
    // 调用外部回调
    if (onValueChange) {
      onValueChange(newValue);
    }
  }, [isTouched, externalError, internalError, validate, onValueChange]);
  
  // 智能错误显示：只在触摸后显示错误，且如果字段有值则不显示"请输入xxx"的错误
  const shouldShowError = useCallback(() => {
    // 如果强制显示错误，直接显示（用于提交时）
    if (forceShowError && error) {
      // 但如果字段有值，不显示"请输入xxx"的错误
      if (value && String(value).trim() && error.includes('请输入')) {
        return false;
      }
      return true;
    }
    
    if (!isTouched) {
      return false;
    }
    if (!error) {
      return false;
    }
    // 如果字段有值，不显示"请输入xxx"的错误
    if (value && String(value).trim() && error.includes('请输入')) {
      return false;
    }
    return true;
  }, [forceShowError, isTouched, error, value]);
  
  const displayError = shouldShowError() ? error : '';
  
  // 克隆 children，注入 onBlur 和 onChange 处理
  const childrenWithHandlers = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      type ChildProps = {
        onBlur?: (e: unknown) => void;
        onChange?: (e: unknown) => void;
        error?: boolean;
      };
      const childProps: ChildProps = {};
      const isDomElement = typeof (child as any).type === 'string';
      
      // 如果有验证函数或值变化回调，注入处理函数
      if (validate || onValueChange) {
        const originalOnBlur = (child.props as ChildProps).onBlur;
        const originalOnChange = (child.props as ChildProps).onChange;
        
        // 合并 onBlur
        if (originalOnBlur || handleBlur) {
          childProps.onBlur = (e: unknown) => {
            if (originalOnBlur) originalOnBlur(e);
            handleBlur();
          };
        }
        
        // 合并 onChange
        if (originalOnChange || handleValueChange) {
          childProps.onChange = (e: unknown) => {
            const eventTarget = e && typeof e === 'object' && 'target' in e
              ? (e as { target?: { value?: unknown } })
              : null;
            const newValue = eventTarget?.target?.value !== undefined 
              ? eventTarget.target.value 
              : e;
            if (originalOnChange) originalOnChange(e);
            handleValueChange(newValue);
          };
        }
      }
      
      // 如果有错误，传递给子组件
      if (displayError && !isDomElement && (child.props as ChildProps).error === undefined) {
        childProps.error = !!displayError;
      }
      
      return React.cloneElement(child, childProps);
    }
    return child;
  });
  
  // 内联布局
  if (layout === 'inline') {
    return (
      <div className={`flex gap-4 items-center ${className}`}>
        {/* 标签 */}
        <label id={labelId} htmlFor={htmlFor} className={`text-sm text-right whitespace-nowrap ${labelWidth} ${labelClassName}`}>
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </label>
        
        {/* 字段内容 */}
        <div className="flex-1">
          {childrenWithHandlers}
          
          {/* 帮助文本 */}
          {helpText && !displayError && (
            <p className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${helpTextClassName}`}>
              {helpText}
            </p>
          )}
          
          {/* 错误提示 */}
          {displayError && (
            <p className={`mt-1 text-xs text-red-500 ${errorClassName}`}>
              {displayError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 垂直布局（默认）
  return (
    <div className={`space-y-1 ${className}`}>
      {/* 标签 */}
      <Label htmlFor={htmlFor} className={labelClassName}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {/* 字段内容 */}
      <div>
        {childrenWithHandlers}
      </div>
      
      {/* 帮助文本 */}
      {helpText && !displayError && (
        <p className={`text-xs text-gray-500 dark:text-gray-400 ${helpTextClassName}`}>
          {helpText}
        </p>
      )}
      
      {/* 错误提示 */}
      {displayError && (
        <p className={`text-red-500 text-sm ${errorClassName}`}>
          {displayError}
        </p>
      )}
    </div>
  );
};

export default FormField;
