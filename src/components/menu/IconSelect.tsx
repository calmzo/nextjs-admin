/**
 * 图标选择器组件
 * 支持选择 SVG 图标和 Element Plus 图标（可选）
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import MenuIcon from './MenuIcon';
import { SearchIcon } from '@/icons/index';

interface IconSelectProps {
  /**
   * 当前选中的图标值
   */
  value?: string;
  /**
   * 图标值变化回调
   */
  onChange?: (value: string) => void;
  /**
   * 输入框占位符
   */
  placeholder?: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
}

// SVG 图标列表（从 icons/index.tsx 提取）
const SVG_ICONS = [
  'plus', 'close', 'box', 'check-circle', 'alert', 'info', 'error', 'bolt',
  'arrow-up', 'arrow-down', 'folder', 'video', 'audio', 'grid', 'file', 'download',
  'arrow-right', 'group', 'box-line', 'shooting-star', 'dollar-line', 'trash',
  'angle-up', 'angle-down', 'pencil', 'check-line', 'close-line', 'chevron-down',
  'chevron-up', 'paper-plane', 'lock', 'envelope', 'user', 'user-line', 'calendar',
  'calender', 'eye', 'eye-close', 'time', 'copy', 'chevron-left', 'user-circle',
  'task', 'list', 'table', 'page', 'pie-chart', 'box-cube', 'plug-in', 'docs',
  'mail', 'mail-line', 'horizontal-dots', 'chat', 'more-dot', 'ai', 'cart',
  'call', 'box-moving', 'box-tapped', 'truck-delivery', 'export', 'refresh', 'search',
  // 系统菜单常用
  'system', 'menu', 'role', 'tree', 'dict', 'setting',
];

const IconSelect: React.FC<IconSelectProps> = ({
  value = '',
  onChange,
  placeholder = '点击选择图标',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'svg' | 'element'>('svg');
  const [filterText, setFilterText] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // 根据当前值判断应该显示哪个标签页
  useEffect(() => {
    if (value && value.startsWith('el-icon-')) {
      setActiveTab('element');
    } else {
      setActiveTab('svg');
    }
  }, [value]);

  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 过滤 SVG 图标
  const filteredSvgIcons = SVG_ICONS.filter((icon) =>
    icon.toLowerCase().includes(filterText.toLowerCase())
  );

  // 过滤 Element Plus 图标（暂时为空，后续可扩展）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _filteredElementIcons: string[] = [];

  // 选择图标
  const handleSelectIcon = (icon: string) => {
    const iconValue = activeTab === 'element' ? `el-icon-${icon}` : icon;
    onChange?.(iconValue);
    setIsOpen(false);
    setFilterText('');
  };

  // 清空图标
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  // 切换标签页
  const handleTabChange = (tab: 'svg' | 'element') => {
    setActiveTab(tab);
    setFilterText('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* 触发器 */}
      <div
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 w-full rounded-lg border border-gray-300 
          bg-white px-3 py-2 text-sm cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-500'}
          dark:border-gray-700 dark:bg-gray-800
        `}
      >
        {/* 图标预览 */}
        <div className="flex-shrink-0">
          <MenuIcon icon={value} size={18} />
        </div>

        {/* 输入框 */}
        <input
          type="text"
          readOnly
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none cursor-pointer text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
        />

        {/* 清空按钮 */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* 下拉箭头 */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* 弹窗 */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-2 w-[500px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
        >
          {/* 搜索框 */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="搜索图标..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-200"
              />
            </div>
          </div>

          {/* 标签页 */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                type="button"
                onClick={() => handleTabChange('svg')}
                className={`
                  flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === 'svg'
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                SVG 图标
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('element')}
                disabled={true}
                className={`
                  flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  border-transparent text-gray-400 cursor-not-allowed
                  dark:text-gray-600
                `}
                title="Element Plus 图标支持即将推出"
              >
                Element 图标
                <span className="ml-1 text-xs">(即将推出)</span>
              </button>
            </div>
          </div>

          {/* 图标列表 */}
          <div className="p-3 max-h-[300px] overflow-y-auto">
            {activeTab === 'svg' ? (
              <div className="grid grid-cols-8 gap-2">
                {filteredSvgIcons.length > 0 ? (
                  filteredSvgIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleSelectIcon(icon)}
                      className={`
                        flex items-center justify-center p-2 rounded-lg border transition-all
                        hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20
                        ${
                          value === icon
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }
                      `}
                      title={icon}
                    >
                      <MenuIcon icon={icon} size={20} />
                    </button>
                  ))
                ) : (
                  <div className="col-span-8 py-8 text-center text-gray-500 dark:text-gray-400">
                    未找到匹配的图标
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                Element Plus 图标支持即将推出
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelect;

