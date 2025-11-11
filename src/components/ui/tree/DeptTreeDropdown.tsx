"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
// 使用内联SVG图标
import Badge from '@/components/ui/badge/Badge';
import TreeDropdownBase from './base/TreeDropdownBase';
import type { DeptNode, DeptTreeDropdownProps } from '@/types/dept-tree';

/**
 * 部门下拉树选择器组件
 * 用于表单中的部门选择
 */
const DeptTreeDropdown: React.FC<DeptTreeDropdownProps> = ({
  data,
  value,
  multiple = false,
  placeholder = "请选择部门",
  disabled = false,
  loading = false,
  onChange,
  onSearch,
  showSearch = true,
  allowClear = true,
  maxTagCount = 3,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState<DeptNode[]>(data);
  const [selectedNodes, setSelectedNodes] = useState<DeptNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 根据value查找选中的节点
  useEffect(() => {
    if (value) {
      const findNodes = (nodes: DeptNode[], targetValue: number | number[]): DeptNode[] => {
        const result: DeptNode[] = [];
        const values = Array.isArray(targetValue) ? targetValue : [targetValue];
        
        const traverse = (nodeList: DeptNode[]) => {
          nodeList.forEach(node => {
            if (values.includes(node.id)) {
              result.push(node);
            }
            if (node.children) {
              traverse(node.children);
            }
          });
        };
        
        traverse(nodes);
        return result;
      };
      
      setSelectedNodes(findNodes(data, value));
    } else {
      setSelectedNodes([]);
    }
  }, [value, data]);

  // 搜索过滤
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredData(data);
      return;
    }

    const filterNodes = (nodes: DeptNode[]): DeptNode[] => {
      return nodes.reduce((acc: DeptNode[], node) => {
        const matchesSearch = node.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                            node.code.toLowerCase().includes(searchValue.toLowerCase());
        
        if (matchesSearch) {
          acc.push({ ...node, children: node.children ? filterNodes(node.children) : [] });
        } else if (node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            acc.push({ ...node, children: filteredChildren });
          }
        }
        
        return acc;
      }, []);
    };

    setFilteredData(filterNodes(data));
    onSearch?.(searchValue);
  }, [searchValue, data, onSearch]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理节点展开/折叠
  const handleToggle = useCallback((node: DeptNode) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (expandedKeys.has(node.id)) {
      newExpandedKeys.delete(node.id);
    } else {
      newExpandedKeys.add(node.id);
    }
    setExpandedKeys(newExpandedKeys);
  }, [expandedKeys]);

  // 处理节点选择
  const handleNodeSelect = useCallback((node: DeptNode) => {
    if (disabled) return;

    let newSelectedNodes: DeptNode[];
    let newValue: number | number[];

    if (multiple) {
      const isSelected = selectedNodes.some(n => n.id === node.id);
      if (isSelected) {
        newSelectedNodes = selectedNodes.filter(n => n.id !== node.id);
      } else {
        newSelectedNodes = [...selectedNodes, node];
      }
      newValue = newSelectedNodes.map(n => n.id);
    } else {
      newSelectedNodes = [node];
      newValue = node.id;
      setIsOpen(false); // 单选时关闭下拉框
    }

    setSelectedNodes(newSelectedNodes);
    onChange?.(newValue, multiple ? newSelectedNodes : newSelectedNodes[0]);
  }, [disabled, multiple, selectedNodes, onChange]);

  // 清除选择
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setSelectedNodes([]);
    onChange?.(multiple ? [] : (undefined as unknown as number | number[]), multiple ? [] : (undefined as unknown as DeptNode | DeptNode[]));
  }, [disabled, multiple, onChange]);

  // 渲染树节点
  const renderTreeNode = useCallback((node: DeptNode, level = 0): React.ReactNode => {
    const isExpanded = expandedKeys.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNodes.some(n => n.id === node.id);

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
          onClick={() => handleNodeSelect(node)}
        >
          {/* 展开/折叠按钮 */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(node);
              }}
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
          
          {/* 复选框（多选模式） */}
          {multiple && (
            <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
              {isSelected && (
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
          
          {/* 部门图标 */}
          <div className="w-4 h-4 bg-teal-500 rounded flex items-center justify-center">
            <span className="text-white text-xs">🏢</span>
          </div>
          
          {/* 部门名称 */}
          <span className="flex-1 text-sm">{node.name}</span>
          
          {/* 部门编码 */}
          <Badge color="info">
            {node.code}
          </Badge>
        </div>
        
        {/* 渲染子节点 */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedKeys, selectedNodes, multiple, handleToggle, handleNodeSelect]);

  // 渲染选中内容
  const renderSelectedContent = useCallback(() => {
    if (selectedNodes.length === 0) {
      return <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>;
    }

    if (multiple) {
      const displayNodes = selectedNodes.slice(0, maxTagCount);
      const remainingCount = selectedNodes.length - maxTagCount;

      return (
        <div className="flex flex-wrap gap-1">
        {displayNodes.map((node) => (
          <div key={node.id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            <span>{node.name}</span>
            <button
              onClick={() => handleNodeSelect(node)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
        ))}
        {remainingCount > 0 && (
          <Badge color="info">
            +{remainingCount}
          </Badge>
        )}
        </div>
      );
    } else {
      return <span className="text-gray-900 dark:text-white">{selectedNodes[0].name}</span>;
    }
  }, [selectedNodes, placeholder, multiple, maxTagCount, handleNodeSelect]);

  // 渲染加载状态
  if (loading) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  return (
    <TreeDropdownBase
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      disabled={disabled}
      className={className}
      allowClear={allowClear}
      canClear={selectedNodes.length > 0}
      onClear={handleClear}
      containerRef={containerRef}
      showSearch={showSearch}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="搜索部门..."
      triggerContent={renderSelectedContent()}
    >
      {/* 树形结构 */}
      <div className="max-h-64 overflow-y-auto">
        {filteredData.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            {searchValue ? '未找到匹配的部门' : '暂无部门数据'}
          </div>
        ) : (
          <div className="py-2">
            {filteredData.map((node) => renderTreeNode(node))}
          </div>
        )}
      </div>

      {/* 底部操作（保留多选清除） */}
      {multiple && allowClear && selectedNodes.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            清除选择
          </button>
        </div>
      )}
    </TreeDropdownBase>
  );
};

export default DeptTreeDropdown;
