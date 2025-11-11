"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { ActionButtons } from '../buttons/ActionButtons';
import { simpleConfirm } from '@/utils/simpleConfirmDialog';
import { deptButtonAuth } from '@/utils/permission';
import { useAuthStore } from '@/store/authStore';
import type { DeptNode, DeptTreeTableProps } from '@/types/dept-tree';

interface DeptTreeNodeRowProps {
  node: DeptNode;
  level: number;
  columns: DeptTreeTableProps['columns'];
  isExpanded: boolean;
  isSelected: boolean;
  isChecked: boolean;
  showCheckbox: boolean;
  showActions: boolean;
  onToggle: (node: DeptNode) => void;
  onNodeClick: (node: DeptNode) => void;
  onCheck: (node: DeptNode, checked: boolean) => void;
  onAdd?: (node: DeptNode) => void;
  onEdit?: (node: DeptNode) => void;
  onDelete?: (node: DeptNode) => void;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  renderChildren: (node: DeptNode, level: number) => React.ReactNode;
}

// 部门树节点行组件 - 使用 React.memo 优化
const DeptTreeNodeRow = React.memo<DeptTreeNodeRowProps>(({
  node,
  level,
  columns,
  isExpanded,
  isSelected,
  isChecked,
  showCheckbox,
  showActions,
  onToggle,
  onNodeClick,
  onCheck,
  onAdd,
  onEdit,
  onDelete,
  canAdd,
  canEdit,
  canDelete,
  renderChildren,
}) => {
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = useCallback(() => {
    onToggle(node);
  }, [node, onToggle]);

  const handleNodeClick = useCallback(() => {
    onNodeClick(node);
  }, [node, onNodeClick]);

  const handleCheck = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onCheck(node, e.target.checked);
  }, [node, onCheck]);

  const handleAdd = useCallback(() => {
    onAdd?.(node);
  }, [node, onAdd]);

  const handleEdit = useCallback(() => {
    onEdit?.(node);
  }, [node, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete?.(node);
  }, [node, onDelete]);

  return (
    <React.Fragment>
      <tr 
        className={`border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
      >
        {columns.map((column, index) => {
          if (index === 0) {
            // 第一列显示树形结构
            return (
              <td key={`${node.id}-${column.key}`} className="py-2 px-4 font-medium text-sm" style={{ paddingLeft: `${level * 16 + 12}px` }}>
                <div className="flex items-center gap-1">
                  {/* 复选框 */}
                  {showCheckbox && (
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={handleCheck}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                    />
                  )}
                  
                  {/* 展开/折叠按钮 */}
                  {hasChildren ? (
                    <button
                      onClick={handleToggle}
                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
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
                    <div className="w-5 flex-shrink-0"></div>
                  )}
                  
                  {/* 部门图标 */}
                  <div className="w-3 h-3 bg-teal-500 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px]"></span>
                  </div>
                  
                  {/* 部门名称 */}
                  <span 
                    className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-1 min-w-0 text-sm"
                    onClick={handleNodeClick}
                  >
                    {node.name}
                  </span>
                </div>
              </td>
            );
          }
          
          // 其他列
          return (
            <td key={`${node.id}-${column.key}`} className="py-2 px-4 text-sm">
              {column.render ? column.render(node[column.key as keyof DeptNode], node, 0) : (
                <span>{String(node[column.key as keyof DeptNode] || '')}</span>
              )}
            </td>
          );
        })}
        
        {/* 操作列 */}
        {showActions && (
          <td className="py-2 px-4 text-left sticky right-0 min-w-[180px] w-[180px] z-30 bg-white border-l border-gray-200 dark:border-gray-800 dark:bg-gray-900 text-sm">
            <ActionButtons
              onAdd={onAdd && canAdd ? handleAdd : undefined}
              onEdit={onEdit && canEdit ? handleEdit : undefined}
              onDelete={onDelete && canDelete ? handleDelete : undefined}
            />
          </td>
        )}
      </tr>
      
      {/* 渲染子节点 */}
      {hasChildren && isExpanded && node.children?.map(child => renderChildren(child, level + 1))}
    </React.Fragment>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.name === nextProps.node.name &&
    prevProps.node.code === nextProps.node.code &&
    prevProps.node.status === nextProps.node.status &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isChecked === nextProps.isChecked &&
    prevProps.showCheckbox === nextProps.showCheckbox &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.canAdd === nextProps.canAdd &&
    prevProps.canEdit === nextProps.canEdit &&
    prevProps.canDelete === nextProps.canDelete &&
    prevProps.level === nextProps.level
  );
});

DeptTreeNodeRow.displayName = 'DeptTreeNodeRow';

/**
 * 部门树形表格组件
 * 用于部门管理的主要展示界面
 */
const DeptTreeTable: React.FC<DeptTreeTableProps> = ({
  data,
  columns,
  loading = false,
  defaultExpandedKeys = [],
  // 参考 vue3-element-admin：默认展开所有
  defaultExpandAll = true,
  onNodeClick,
  onNodeToggle,
  onEdit,
  onDelete,
  onAdd,
  showCheckbox = false,
  onCheck,
  checkedKeys = [],
  className = '',
  showActions = true,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(new Set(defaultExpandedKeys));
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const { userInfo } = useAuthStore();
  // 渲染保护：限制最大渲染节点数与最大深度，并检测循环引用
  const MAX_RENDER_NODES = 5000;
  const MAX_RENDER_DEPTH = 50;
  const renderedCount = React.useRef<number>(0);

  // 递归排序：参考 Element 的树形表格，依据 sort 升序
  const processedData = useMemo(() => {
    const sortNodes = (nodes: typeof data): typeof data => {
      return nodes
        .slice()
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
        .map((n) => ({
          ...n,
          children: n.children ? sortNodes(n.children) : n.children
        }));
    };
    return sortNodes(data);
  }, [data]);

  // 初始化展开：当 defaultExpandAll 为 true 且未提供指定的 defaultExpandedKeys 时，展开所有节点
  React.useEffect(() => {
    if (defaultExpandAll && (!defaultExpandedKeys || defaultExpandedKeys.length === 0)) {
      const allIds: number[] = [];
      const collectIds = (nodes: typeof data) => {
        nodes.forEach((n) => {
          allIds.push(n.id);
          if (n.children && n.children.length > 0) {
            collectIds(n.children);
          }
        });
      };
      collectIds(processedData);
      setExpandedKeys(new Set(allIds));
    } else if (defaultExpandedKeys && defaultExpandedKeys.length > 0) {
      setExpandedKeys(new Set(defaultExpandedKeys));
    }
    // 仅在数据或控制项变化时重置展开
  }, [processedData, defaultExpandAll, defaultExpandedKeys]);

  // 权限检查辅助函数
  const checkPermission = useCallback((permissionCheck: () => boolean) => {
    if (userInfo) {
      const hasPermission = permissionCheck();
      return hasPermission;
    }
    const devMode = process.env.NODE_ENV === 'development';
    return devMode;
  }, [userInfo]);

  // 权限检查结果 - 使用 useMemo 缓存
  const permissions = useMemo(() => ({
    canAdd: checkPermission(() => deptButtonAuth.add()),
    canEdit: checkPermission(() => deptButtonAuth.edit()),
    canDelete: checkPermission(() => deptButtonAuth.delete()),
  }), [checkPermission]);

  // 处理节点展开/折叠
  const handleToggle = useCallback((node: DeptNode) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (expandedKeys.has(node.id)) {
      newExpandedKeys.delete(node.id);
    } else {
      newExpandedKeys.add(node.id);
    }
    setExpandedKeys(newExpandedKeys);
    onNodeToggle?.(node, newExpandedKeys.has(node.id));
  }, [expandedKeys, onNodeToggle]);

  // 处理节点点击
  const handleNodeClick = useCallback((node: DeptNode) => {
    setSelectedKey(node.id);
    onNodeClick?.(node);
  }, [onNodeClick]);

  // 处理复选框变化
  const handleCheck = useCallback((node: DeptNode, checked: boolean) => {
    if (!onCheck) return;
    
    const newCheckedKeys = new Set(checkedKeys);
    if (checked) {
      newCheckedKeys.add(node.id);
      // 添加所有子节点
      const addChildren = (children: DeptNode[]) => {
        children.forEach(child => {
          newCheckedKeys.add(child.id);
          if (child.children) {
            addChildren(child.children);
          }
        });
      };
      if (node.children) {
        addChildren(node.children);
      }
    } else {
      newCheckedKeys.delete(node.id);
      // 移除所有子节点
      const removeChildren = (children: DeptNode[]) => {
        children.forEach(child => {
          newCheckedKeys.delete(child.id);
          if (child.children) {
            removeChildren(child.children);
          }
        });
      };
      if (node.children) {
        removeChildren(node.children);
      }
    }
    
    onCheck(Array.from(newCheckedKeys), []);
  }, [checkedKeys, onCheck]);

  // 处理删除确认
  const handleDeleteConfirm = useCallback(async (node: DeptNode) => {
    const result = await simpleConfirm.danger(
      `确定要删除部门 "${node.name}" 吗？删除后无法恢复！`,
      '确认删除'
    );

    if (result && onDelete) {
      onDelete(node);
    }
  }, [onDelete]);

  // 渲染树节点
  const renderTreeNode = useCallback((node: DeptNode, level = 0, path?: Set<number>): React.ReactNode => {
    // 渲染数量保护：超出上限直接停止渲染，避免首屏卡死
    if (renderedCount.current >= MAX_RENDER_NODES) {
      return null;
    }

    // 深度保护
    if (level > MAX_RENDER_DEPTH) {
      return (
        <tr key={`depth_limit_${node.id}`} className="border-b border-gray-200 dark:border-gray-800">
          <td colSpan={columns.length + (showActions ? 1 : 0)} className="py-3 px-5 text-amber-600 dark:text-amber-400">
            到达最大渲染深度，部分子节点未显示…
          </td>
        </tr>
      );
    }

    // 当前路径循环引用保护（仅检测从根到当前分支路径上的重复，而非全局）
    const currentPath = path ?? new Set<number>();
    if (currentPath.has(node.id)) {
      return (
        <tr key={`cycle_${node.id}`} className="border-b border-gray-200 dark:border-gray-800">
          <td colSpan={columns.length + (showActions ? 1 : 0)} className="py-3 px-5 text-red-600 dark:text-red-400">
            检测到循环引用节点（ID: {node.id}），已停止渲染该分支。
          </td>
        </tr>
      );
    }
    const newPath = new Set(currentPath);
    newPath.add(node.id);
    renderedCount.current += 1;

    const isExpanded = expandedKeys.has(node.id);
    const isSelected = selectedKey === node.id;
    const isChecked = checkedKeys.includes(node.id);

    return (
      <DeptTreeNodeRow
        key={node.id}
        node={node}
        level={level}
        columns={columns}
        isExpanded={isExpanded}
        isSelected={isSelected}
        isChecked={isChecked}
        showCheckbox={showCheckbox}
        showActions={showActions}
        onToggle={handleToggle}
        onNodeClick={handleNodeClick}
        onCheck={handleCheck}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={handleDeleteConfirm}
        canAdd={permissions.canAdd}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
        renderChildren={(child, childLevel) => renderTreeNode(child, childLevel, newPath)}
      />
    );
  }, [expandedKeys, selectedKey, checkedKeys, columns, handleToggle, handleNodeClick, handleCheck, handleDeleteConfirm, showActions, showCheckbox, onAdd, onEdit, permissions]);

  // 渲染加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  renderedCount.current = 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1050px]">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map((column, idx) => (
                <th 
                  key={column.key}
                  className={
                    `px-5 py-4 text-left text-xs font-medium text-gray-500 whitespace-nowrap ${idx===0 ? '' : 'min-w-[100px]'} dark:text-gray-400`
                  }
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
              {showActions && (
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 whitespace-nowrap sticky right-0 z-30 bg-white border-l border-gray-200 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-900 min-w-[180px] w-[180px]">操作</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
            {processedData.map((node) => renderTreeNode(node))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeptTreeTable;
