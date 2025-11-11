/**
 * 菜单树选择组件
 * 支持多选、搜索、展开收缩、父子联动
 */

"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MenuNode } from '@/types/menu-tree';
import { SearchIcon, AngleDownIcon, AngleUpIcon } from '@/icons/index';
import Switch from '@/components/form/switch/Switch';
import Label from '@/components/form/Label';

interface MenuTreeSelectorProps {
  /** 菜单树数据 */
  data: MenuNode[];
  /** 已选中的菜单ID列表 */
  checkedKeys?: number[];
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 是否启用父子联动 */
  checkStrictly?: boolean;
  /** 默认展开所有节点 */
  defaultExpandAll?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 选中变化回调 */
  onChange?: (checkedKeys: number[]) => void;
  /** 父子联动变化回调 */
  onCheckStrictlyChange?: (checkStrictly: boolean) => void;
}

export default function MenuTreeSelector({
  data,
  checkedKeys = [],
  showSearch = true,
  checkStrictly = false,
  defaultExpandAll = false,
  disabled = false,
  loading = false,
  onChange,
  onCheckStrictlyChange,
}: MenuTreeSelectorProps) {
  // 搜索关键词
  const [searchValue, setSearchValue] = useState('');
  // 展开的节点
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(
    new Set(defaultExpandAll ? getAllNodeIds(data) : [])
  );
  // 选中的节点
  const [internalCheckedKeys, setInternalCheckedKeys] = useState<Set<number>>(
    new Set(checkedKeys)
  );
  // 是否启用父子联动（checkStrictly 为 false 时启用联动）
  const [isCheckStrictly, setIsCheckStrictly] = useState(checkStrictly);
  // 是否联动（与 checkStrictly 相反）
  const isLinked = !isCheckStrictly;

  // 同步外部 checkedKeys
  useEffect(() => {
    setInternalCheckedKeys(new Set(checkedKeys));
  }, [checkedKeys]);

  // 获取所有节点ID（用于默认展开）
  function getAllNodeIds(nodes: MenuNode[]): number[] {
    const ids: number[] = [];
    const traverse = (nodeList: MenuNode[]) => {
      nodeList.forEach(node => {
        ids.push(node.id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return ids;
  }

  // 获取所有节点（扁平化）
  const allNodes = useMemo(() => {
    const nodes: MenuNode[] = [];
    const traverse = (nodeList: MenuNode[]) => {
      nodeList.forEach(node => {
        nodes.push(node);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(data);
    return nodes;
  }, [data]);

  // 根据搜索关键词过滤节点
  const filteredData = useMemo(() => {
    if (!searchValue.trim()) {
      return data;
    }

    const searchLower = searchValue.toLowerCase();
    
    // 过滤函数：节点名称匹配或子节点匹配则保留
    const filterNode = (node: MenuNode): MenuNode | null => {
      const matches = node.name.toLowerCase().includes(searchLower);
      const filteredChildren = node.children
        ? node.children.map(filterNode).filter((n): n is MenuNode => n !== null)
        : [];

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
        };
      }

      return null;
    };

    const filtered = data.map(filterNode).filter((n): n is MenuNode => n !== null);
    
    // 如果有搜索结果，自动展开匹配的节点
    if (filtered.length > 0) {
      const expandIds = new Set<number>();
      const collectIds = (nodeList: MenuNode[]) => {
        nodeList.forEach(node => {
          if (node.children && node.children.length > 0) {
            expandIds.add(node.id);
            collectIds(node.children);
          }
        });
      };
      collectIds(filtered);
      setExpandedKeys(prev => {
        const newSet = new Set(prev);
        expandIds.forEach(id => newSet.add(id));
        return newSet;
      });
    }

    return filtered;
  }, [data, searchValue]);

  // 获取节点的所有子节点ID
  const getChildrenIds = useCallback((node: MenuNode): number[] => {
    const ids: number[] = [];
    const traverse = (n: MenuNode) => {
      if (n.children) {
        n.children.forEach(child => {
          ids.push(child.id);
          traverse(child);
        });
      }
    };
    traverse(node);
    return ids;
  }, []);

  // 获取节点的所有父节点ID
  const getParentIds = useCallback((nodeId: number): number[] => {
    const ids: number[] = [];
    const findNode = (nodeList: MenuNode[], targetId: number, parentPath: number[] = []): boolean => {
      for (const node of nodeList) {
        const currentPath = [...parentPath, node.id];
        if (node.id === targetId) {
          ids.push(...parentPath);
          return true;
        }
        if (node.children) {
          if (findNode(node.children, targetId, currentPath)) {
            return true;
          }
        }
      }
      return false;
    };
    findNode(data, nodeId);
    return ids;
  }, [data]);

  // 处理节点选中
  const handleCheck = useCallback((node: MenuNode, checked: boolean) => {
    if (disabled) return;

    const newCheckedKeys = new Set(internalCheckedKeys);

    if (checked) {
      newCheckedKeys.add(node.id);
      
      // 如果启用父子联动，选中所有子节点
      if (isLinked) {
        const childrenIds = getChildrenIds(node);
        childrenIds.forEach(id => newCheckedKeys.add(id));
      }
    } else {
      newCheckedKeys.delete(node.id);
      
      // 如果启用父子联动，取消选中所有子节点
      if (isLinked) {
        const childrenIds = getChildrenIds(node);
        childrenIds.forEach(id => newCheckedKeys.delete(id));
      }
    }

    // 检查父节点状态（如果启用父子联动）
    if (isLinked) {
      const parentIds = getParentIds(node.id);
      parentIds.reverse().forEach(parentId => {
        const parentNode = allNodes.find(n => n.id === parentId);
        if (parentNode && parentNode.children) {
          const allChildrenChecked = parentNode.children.every(child => 
            newCheckedKeys.has(child.id)
          );
          if (allChildrenChecked && checked) {
            newCheckedKeys.add(parentId);
          } else if (!checked) {
            newCheckedKeys.delete(parentId);
          } else {
            // 部分选中状态：检查是否有任何子节点被选中
            const anyChildChecked = parentNode.children.some(child => 
              newCheckedKeys.has(child.id)
            );
            if (!anyChildChecked) {
              newCheckedKeys.delete(parentId);
            }
          }
        }
      });
    }

    setInternalCheckedKeys(newCheckedKeys);
    onChange?.(Array.from(newCheckedKeys));
  }, [disabled, internalCheckedKeys, isLinked, getChildrenIds, getParentIds, allNodes, onChange]);

  // 处理展开/收缩
  const handleToggle = useCallback((nodeId: number) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // 展开/收缩所有
  const handleExpandAll = useCallback(() => {
    const allIds = getAllNodeIds(data);
    setExpandedKeys(new Set(allIds));
  }, [data]);

  const handleCollapseAll = useCallback(() => {
    setExpandedKeys(new Set());
  }, []);

  // 处理父子联动开关
  const handleCheckStrictlyChange = useCallback((checked: boolean) => {
    setIsCheckStrictly(checked);
    onCheckStrictlyChange?.(checked);
  }, [onCheckStrictlyChange]);

  // 渲染树节点
  const renderTreeNode = useCallback((node: MenuNode, level = 0): React.ReactNode => {
    const isExpanded = expandedKeys.has(node.id);
    const hasChildren = !!(node.children && node.children.length > 0);
    const isChecked = internalCheckedKeys.has(node.id);

    // 计算部分选中状态（如果启用父子联动）
    let isIndeterminate = false;
    if (isLinked && hasChildren) {
      const childrenIds = getChildrenIds(node);
      const checkedChildrenCount = childrenIds.filter(id => 
        internalCheckedKeys.has(id)
      ).length;
      isIndeterminate = checkedChildrenCount > 0 && checkedChildrenCount < childrenIds.length;
    }

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors ${
            isChecked ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* 展开/收缩按钮 */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => handleToggle(node.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0"
              aria-label={isExpanded ? '折叠' : '展开'}
              disabled={disabled}
            >
              {isExpanded ? (
                <AngleDownIcon style={{ width: '16px', height: '16px' }} className="text-gray-500" />
              ) : (
                <AngleUpIcon style={{ width: '16px', height: '16px' }} className="text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6 flex-shrink-0" />
          )}

          {/* 复选框 */}
          <label className="flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleCheck(node, e.target.checked)}
              disabled={disabled}
              className="sr-only"
            />
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.5px] transition-colors ${
                isChecked
                  ? 'border-blue-600 bg-blue-600'
                  : isIndeterminate
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300 dark:border-gray-600 bg-transparent'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isChecked && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="white"
                    strokeWidth="1.6666"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {isIndeterminate && !isChecked && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="5" width="8" height="2" fill="white" />
                </svg>
              )}
            </span>
          </label>

          {/* 菜单名称 */}
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
            {node.name}
          </span>
        </div>

        {/* 子节点 */}
        {hasChildren && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedKeys, internalCheckedKeys, isLinked, handleToggle, handleCheck, getChildrenIds, disabled]);

  return (
    <div className="w-full">
      {/* 搜索和工具栏 */}
      <div className="mb-4 space-y-3">
        {/* 搜索框 */}
        {showSearch && (
          <div className="relative">
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              style={{ width: '18px', height: '18px' }}
            />
            <input
              type="text"
              placeholder="搜索菜单名称..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              disabled={disabled || loading}
            />
          </div>
        )}

        {/* 工具栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 父子联动开关 */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                父子联动:
              </Label>
              <Switch
                defaultChecked={isLinked}
                onChange={(checked) => handleCheckStrictlyChange(!checked)}
                disabled={disabled || loading}
                color="blue"
              />
            </div>
          </div>

          {/* 展开/收缩按钮 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              disabled={disabled || loading}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            >
              全部展开
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              disabled={disabled || loading}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            >
              全部收缩
            </button>
          </div>
        </div>
      </div>

      {/* 树形结构 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 
                    max-h-[500px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">加载中...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            暂无菜单数据
          </div>
        ) : (
          <div className="p-2">
            {filteredData.map(node => renderTreeNode(node))}
          </div>
        )}
      </div>

      {/* 选中数量提示 */}
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        已选择 <span className="font-medium text-gray-800 dark:text-white">{internalCheckedKeys.size}</span> 个菜单
      </div>
    </div>
  );
}

