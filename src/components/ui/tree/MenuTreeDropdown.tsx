"use client";

import React, { useCallback } from 'react';
import type { MenuNode, MenuTreeSelectorProps } from '@/types/menu-tree';
import { useTreeDropdown } from '@/hooks/useTreeDropdown';
import TreeDropdownBase from './base/TreeDropdownBase';

/**
 * 菜单下拉树选择器组件
 * 用于表单中的菜单选择（单选模式）
 */
const MenuTreeDropdown: React.FC<MenuTreeSelectorProps> = ({
  data,
  value,
  placeholder = "请选择上级菜单",
  disabled = false,
  loading = false,
  onChange,
  onSearch,
  showSearch = true,
  allowClear = true,
  className = '',
}) => {
  const valueNumber = typeof value === 'number' ? value : null;
  const onChangeAdapter = (val: number, node?: MenuNode) => {
    onChange?.(val, node as unknown as MenuNode | MenuNode[]);
  };
  const {
    isOpen,
    setIsOpen,
    expandedKeys,
    toggleExpand,
    searchValue,
    setSearchValue,
    filteredData,
    selectedNode,
    setSelectedNode,
    handleNodeSelect,
    handleClear,
    containerRef,
  } = useTreeDropdown<MenuNode>({
    data,
    value: valueNumber,
    disabled,
    onChange: onChangeAdapter,
    onSearch,
    getNodeId: (node) => node.id,
    getChildren: (node) => node.children,
    matchSearch: (node, keyword) => {
      const k = keyword.toLowerCase();
      return node.name.toLowerCase().includes(k) || (node.path?.toLowerCase().includes(k) ?? false);
    },
  });

  const renderTreeNode = useCallback((node: MenuNode, level = 0): React.ReactNode => {
    const isExpanded = expandedKeys.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
          onClick={() => handleNodeSelect(node)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => toggleExpand(node, e)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              {isExpanded ? (
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ) : (
            <div className="w-6"></div>
          )}
          
          {node.icon ? (
            <div className="w-4 h-4 flex items-center justify-center">
              <span className="text-sm">{node.icon}</span>
            </div>
          ) : (
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
              <span className="text-white text-xs">📁</span>
            </div>
          )}
          
          <span className="flex-1 text-sm">{node.name}</span>
          
          {node.path && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{node.path}</span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedKeys, selectedNode, toggleExpand, handleNodeSelect]);

  const triggerContent = (() => {
    if (!selectedNode && (value === 0 || value === undefined || value === null)) {
      return <span className="text-gray-900 dark:text-white">顶级菜单</span>;
    }
    if (!selectedNode) {
      return <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>;
    }
    return <span className="text-gray-900 dark:text-white">{selectedNode.name}</span>;
  })();

  if (loading) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  const topExtra = (
    <div
      className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
        !selectedNode || (value === 0 || value === undefined || value === null) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
      }`}
      onClick={() => {
        if (!disabled) {
          setSelectedNode(null);
          setIsOpen(false);
          onChange?.(0, (undefined as unknown as MenuNode | MenuNode[]));
        }
      }}
    >
      <div className="w-6"></div>
      <span className="text-sm">顶级菜单</span>
    </div>
  );

  return (
    <TreeDropdownBase
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      disabled={disabled}
      className={className}
      allowClear={allowClear}
      canClear={!!selectedNode}
      onClear={handleClear}
      containerRef={containerRef}
      showSearch={showSearch}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="搜索菜单..."
      triggerContent={triggerContent}
      topExtra={topExtra}
    >
      {filteredData.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          {searchValue ? '未找到匹配的菜单' : '暂无菜单数据'}
        </div>
      ) : (
        <div className="py-2">
          {filteredData.map((node) => renderTreeNode(node))}
        </div>
      )}
    </TreeDropdownBase>
  );
};

export default MenuTreeDropdown;

