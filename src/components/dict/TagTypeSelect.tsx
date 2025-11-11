"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from "@/icons";
import Badge from '@/components/ui/badge/Badge';

interface Option {
  value: string;
  label: string;
}

interface TagTypeSelectProps {
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  displayText?: string; // 自定义显示文案，如果有则使用此文案而不是 option.label
}

const TagTypeSelect: React.FC<TagTypeSelectProps> = ({
  options,
  placeholder = "请选择标签类型",
  value = '',
  onChange,
  className = "",
  displayText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部区域关闭下拉框
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  
  // 获取Badge颜色
  const getBadgeColor = (tagValue: string): 'error' | 'success' | 'warning' | 'info' | 'primary' => {
    if (tagValue === 'danger') return 'error';
    if (['success', 'warning', 'info', 'primary'].includes(tagValue)) {
      return tagValue as 'success' | 'warning' | 'info' | 'primary';
    }
    return 'primary';
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative z-20 ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`h-11 w-full cursor-pointer appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs flex items-center justify-between ${
          value
            ? "border-gray-300 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            : "border-gray-300 text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        } focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:focus:border-brand-800`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption ? (
            <>
              {selectedOption.value && (
                <Badge 
                  variant="light"
                  color={getBadgeColor(selectedOption.value)}
                  size="sm"
                >
                  {displayText || selectedOption.label}
                </Badge>
              )}
              {!selectedOption.value && (
                <span className="text-gray-800 dark:text-white/90">请选择标签类型</span>
              )}
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-400">{placeholder}</span>
          )}
        </div>
        <span className={`absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-40 w-full mt-1 overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 max-h-64 overflow-y-auto custom-scrollbar">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                value === option.value
                  ? "bg-brand-50 dark:bg-brand-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {option.value && displayText ? (
                  <>
                    <Badge 
                      variant="light"
                      color={getBadgeColor(option.value)}
                      size="sm"
                    >
                      {displayText}
                    </Badge>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </>
                ) : option.value ? (
                  <Badge 
                    variant="light"
                    color={getBadgeColor(option.value)}
                    size="sm"
                  >
                    {option.label}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                )}
              </div>
              {value === option.value && (
                <svg
                  className="w-4 h-4 text-brand-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagTypeSelect;

