"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Badge from '@/components/ui/badge/Badge';
import type { DeptNode, DeptNodeOption, DeptTreeSelectorProps } from '@/types/dept-tree';
import { convertDeptNodeOptionsToDeptNodes } from '@/types/dept-tree';

/**
 * 部门树形选择器组件
 * 支持单选/多选模式，搜索过滤，展开/折叠等功能
 */
interface DeptTreeSelectorComponentProps extends Omit<DeptTreeSelectorProps, 'data'> {
  data?: DeptNode[] | DeptNodeOption[];
  useOptionFormat?: boolean;
  hideCode?: boolean;
}

const DeptTreeSelector: React.FC<DeptTreeSelectorComponentProps> = ({
  data,
  value,
  multiple = false,
  disabled = false,
  loading = false,
  onChange,
  onSearch,
  showSearch = true,
  allowClear = true,
  maxTagCount = 3,
  className = '',
  useOptionFormat = false,
  hideCode = false,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [selectedNodes, setSelectedNodes] = useState<DeptNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 数据转换：将 DeptNodeOption 转换为 DeptNode
  const convertedData = useMemo(() => {
    if (!data) {
      return [];
    }
    // 自动识别数据格式：当节点包含 value/label 时按 Option 转换，否则直接作为 DeptNode 使用
    const first = Array.isArray(data) && data.length > 0 ? (data as unknown as Record<string, unknown>[])[0] : undefined;
    const looksLikeOption = !!first && 'value' in first && 'label' in first;
    const shouldConvert = useOptionFormat || looksLikeOption;
    const result = shouldConvert
      ? convertDeptNodeOptionsToDeptNodes(data as DeptNodeOption[])
      : (data as DeptNode[]);
    return result;
  }, [data, useOptionFormat]);

  const [filteredData, setFilteredData] = useState<DeptNode[]>([]);

  // 当 convertedData 变化时更新 filteredData
  useEffect(() => {
    setFilteredData(convertedData);
    // 默认展开所有节点（首次或当展开集为空时）
    if (convertedData && convertedData.length > 0) {
      setExpandedKeys((prev) => {
        if (prev.size > 0) return prev;
        const allIds = new Set<number>();
        const collectIds = (nodes: DeptNode[]) => {
          nodes.forEach((n) => {
            allIds.add(n.id);
            if (n.children && n.children.length > 0) {
              collectIds(n.children);
            }
          });
        };
        collectIds(convertedData);
        return allIds;
      });
    }
  }, [convertedData]);

  // 根据value查找选中的节点
  useEffect(() => {
    if (value !== undefined && value !== null) {
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
      
      const foundNodes = findNodes(convertedData, value);
      setSelectedNodes(foundNodes);
    } else {
      setSelectedNodes([]);
    }
  }, [value, convertedData]);

  // 搜索过滤
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredData(convertedData);
      return;
    }

    const filterNodes = (nodes: DeptNode[]): DeptNode[] => {
      return nodes.reduce((acc: DeptNode[], node) => {
        const matchesSearch = 
          node.name.toLowerCase().includes(searchValue.toLowerCase()) ||
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
    
    setFilteredData(filterNodes(convertedData));
    onSearch?.(searchValue);
  }, [searchValue, convertedData, onSearch]);

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
    }

    setSelectedNodes(newSelectedNodes);
    onChange?.(newValue, multiple ? newSelectedNodes : newSelectedNodes[0]);
  }, [disabled, multiple, selectedNodes, onChange]);

  // 清除选择
  const handleClear = useCallback(() => {
    if (disabled) return;
    setSelectedNodes([]);
    onChange?.(multiple ? [] : (undefined as unknown as number | number[]), multiple ? [] : (undefined as unknown as DeptNode | DeptNode[]));
  }, [disabled, multiple, onChange]);

  // 渲染树节点
  const renderTreeNode = useCallback((node: DeptNode, level = 0): React.ReactNode => {
    if (!node || typeof node.id === 'undefined' || node.id === null) {
      return null;
    }

    const isExpanded = expandedKeys.has(node.id);
    const hasChildren = !!(node.children && node.children.length > 0);
    const isSelected = selectedNodes.some(n => n.id === node.id);

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-1 py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNodeSelect(node);
          }}
        >
          {/* 展开/折叠按钮 */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle(node);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              aria-label={isExpanded ? '折叠' : '展开'}
            >
              {isExpanded ? (
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          
          {/* 部门名称 */}
          <span className="flex-1 text-xs font-normal">{node.name}</span>
          
          {/* 部门编码 */}
          {!hideCode && (
            <Badge color="info">
              {node.code}
            </Badge>
          )}
        </div>
        
        {/* 渲染子节点 */}
        {hasChildren && isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <div key={child.id}>
                {renderTreeNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [expandedKeys, selectedNodes, handleToggle, handleNodeSelect, hideCode]);

  // 渲染选中标签
  const renderSelectedTags = useCallback(() => {
    if (!multiple || selectedNodes.length === 0) return null;

    const displayNodes = selectedNodes.slice(0, maxTagCount);
    const remainingCount = selectedNodes.length - maxTagCount;

    return (
      <div className="flex flex-wrap gap-1">
        {displayNodes.map((node) => (
          <div key={node.id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            <span>{node.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNodeSelect(node);
              }}
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
  }, [multiple, selectedNodes, maxTagCount, handleNodeSelect]);

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
    <div 
      ref={containerRef} 
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* 搜索框 */}
      {showSearch && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="搜索部门..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              aria-label="搜索部门"
            />
            {searchValue && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchValue('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="清除搜索"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 选中标签 */}
      {selectedNodes.length > 0 && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          {multiple ? renderSelectedTags() : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  已选择: {selectedNodes[0]?.name}
                </span>
              </div>
              {allowClear && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}

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

      {/* 底部操作 */}
      {allowClear && selectedNodes.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
            disabled={disabled}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            清除选择
          </button>
        </div>
      )}
    </div>
  );
};

export default DeptTreeSelector;
