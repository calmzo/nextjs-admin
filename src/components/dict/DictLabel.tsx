/**
 * 字典标签组件
 * 根据字典编码和值显示字典标签，如果有 tagType 则显示为带颜色的 Badge
 * 参考 vue3-element-admin 的 DictLabel 组件实现
 */

"use client";

import React from 'react';
import Badge from '@/components/ui/badge/Badge';
import { useDictItem } from '@/hooks/useDict';

interface DictLabelProps {
  code: string; // 字典编码
  value: string | number | undefined; // 字典项的值（对应 Vue 版本的 modelValue）
  className?: string;
  size?: 'default' | 'large' | 'small'; // 标签大小（对应 Vue 版本的 size，默认 'default'）
  alwaysShowBadge?: boolean; // 是否始终显示为 Badge（即使没有 tagType，扩展功能）
  defaultBadgeColor?: 'primary' | 'success' | 'error' | 'warning' | 'info'; // 默认 Badge 颜色（扩展功能）
}

const DictLabel: React.FC<DictLabelProps> = ({ 
  code, 
  value, 
  className = '', 
  size = 'default',
  alwaysShowBadge = false,
  defaultBadgeColor = 'info'
}) => {
  const { label, tagType } = useDictItem(code, value);

  // 映射 tagType 到 Badge 的 color
  // 支持的 tagType: primary, success, info, warning, danger
  const badgeColorMap: Record<string, 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
    primary: 'primary',
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'error', // danger 映射到 error (红色)
  };

  // 判断是否有有效的 tagType（非空字符串）
  const hasTagType = tagType && tagType.trim() !== '';
  
  // 标准化 tagType 为小写，确保匹配
  const normalizedTagType = hasTagType ? tagType.trim().toLowerCase() : '';

  // 映射 size 到 Badge 的 size（Badge 只支持 'sm' | 'md'）
  const badgeSizeMap: Record<'default' | 'large' | 'small', 'sm' | 'md'> = {
    default: 'sm',
    small: 'sm',
    large: 'md',
  };
  const badgeSize = badgeSizeMap[size];

  // 如果有 tagType 或 alwaysShowBadge 为 true，显示为 Badge
  if (hasTagType || alwaysShowBadge) {
    // 优先使用 tagType 映射的颜色，如果没有则使用默认颜色
    const badgeColor = hasTagType && badgeColorMap[normalizedTagType]
      ? badgeColorMap[normalizedTagType]
      : defaultBadgeColor;

    return (
      <span className={className}>
        <Badge color={badgeColor} variant="light" size={badgeSize}>
          {label}
        </Badge>
      </span>
    );
  }

  // 没有 tagType 且不强制显示 Badge，显示为普通文本（与 Vue 版本一致）
  return <span className={className}>{label}</span>;
};

export default DictLabel;
