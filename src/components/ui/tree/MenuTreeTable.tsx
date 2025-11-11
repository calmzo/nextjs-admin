"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { ActionButtons } from '../buttons/ActionButtons';
import { simpleConfirm } from '@/utils/simpleConfirmDialog';
import { menuButtonAuth } from '@/utils/permission';
import { useAuthStore } from '@/store/authStore';
import type { MenuNode, MenuTreeTableProps } from '@/types/menu-tree';
import MenuIcon from '@/components/menu/MenuIcon';

interface MenuTreeNodeRowProps {
  node: MenuNode;
  level: number;
  columns: MenuTreeTableProps['columns'];
  isExpanded: boolean;
  isSelected: boolean;
  isChecked: boolean;
  showCheckbox: boolean;
  showActions: boolean;
  onToggle: (node: MenuNode) => void;
  onNodeClick: (node: MenuNode) => void;
  onCheck: (node: MenuNode, checked: boolean) => void;
  onAdd?: (node: MenuNode) => void;
  onEdit?: (node: MenuNode) => void;
  onDelete?: (node: MenuNode) => void;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  renderChildren: (node: MenuNode, level: number) => React.ReactNode;
}

// 菜单树节点行组件 - 使用 React.memo 优化
const MenuTreeNodeRow = React.memo<MenuTreeNodeRowProps>(({
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
              <td key={`${node.id}-${column.key}`} className="py-2 px-5 text-sm" style={{ paddingLeft: `${level * 24 + 16}px` }}>
                <div className="flex items-center gap-2">
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
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
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
                    <div className="w-6 flex-shrink-0"></div>
                  )}
                  
                  {/* 菜单图标容器 */}
                  <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '24px', height: '24px' }}>
                    <MenuIcon 
                      icon={node.icon} 
                      size={20}
                      className="flex-shrink-0"
                    />
                  </div>
                  
                  {/* 菜单名称 */}
                  <span 
                    className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-sm flex-1 min-w-0"
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
            <td key={`${node.id}-${column.key}`} className="py-2 px-5 text-sm">
              {column.render ? column.render(node[column.key as keyof MenuNode], node, 0) : (
                <span>{String(node[column.key as keyof MenuNode] || '')}</span>
              )}
            </td>
          );
        })}
        
        {/* 操作列 */}
        {showActions && (
          <td className="py-2 px-5 text-left sticky right-0 min-w-[180px] w-[180px] z-30 bg-white border-l border-gray-200 dark:border-gray-800 dark:bg-gray-900">
            <ActionButtons
              onAdd={onAdd && canAdd ? handleAdd : undefined}
              onEdit={onEdit && canEdit ? handleEdit : undefined}
              onDelete={onDelete && canDelete ? handleDelete : undefined}
              showAdd={false}
            />
          </td>
        )}
      </tr>
      
      {/* 渲染子节点 */}
      {hasChildren && isExpanded && renderChildren(node, level + 1)}
    </React.Fragment>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.name === nextProps.node.name &&
    prevProps.node.icon === nextProps.node.icon &&
    prevProps.node.type === nextProps.node.type &&
    prevProps.node.status === nextProps.node.status &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isChecked === nextProps.isChecked &&
    prevProps.level === nextProps.level &&
    prevProps.showCheckbox === nextProps.showCheckbox &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.canAdd === nextProps.canAdd &&
    prevProps.canEdit === nextProps.canEdit &&
    prevProps.canDelete === nextProps.canDelete &&
    (prevProps.node.children?.length || 0) === (nextProps.node.children?.length || 0)
  );
});

MenuTreeNodeRow.displayName = 'MenuTreeNodeRow';

/**
 * 菜单树形表格组件
 * 用于菜单管理的主要展示界面
 */
const MenuTreeTable: React.FC<MenuTreeTableProps> = ({
  data,
  columns,
  loading = false,
  defaultExpandedKeys = [],
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
    canAdd: checkPermission(() => menuButtonAuth.add()),
    canEdit: checkPermission(() => menuButtonAuth.edit()),
    canDelete: checkPermission(() => menuButtonAuth.delete()),
  }), [checkPermission]);

  // 处理节点展开/折叠
  const handleToggle = useCallback((node: MenuNode) => {
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
  const handleNodeClick = useCallback((node: MenuNode) => {
    setSelectedKey(node.id);
    onNodeClick?.(node);
  }, [onNodeClick]);

  // 处理复选框变化
  const handleCheck = useCallback((node: MenuNode, checked: boolean) => {
    if (!onCheck) return;
    
    const newCheckedKeys = new Set(checkedKeys);
    if (checked) {
      newCheckedKeys.add(node.id);
      const addChildren = (children: MenuNode[]) => {
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
      const removeChildren = (children: MenuNode[]) => {
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
  const handleDeleteConfirm = useCallback(async (node: MenuNode) => {
    const result = await simpleConfirm.danger(
      `确定要删除菜单 "${node.name}" 吗？删除后无法恢复！`,
      '确认删除'
    );

    if (result && onDelete) {
      onDelete(node);
    }
  }, [onDelete]);

  // 渲染树节点
  const renderTreeNode = useCallback((node: MenuNode, level = 0): React.ReactNode => {
    const isExpanded = expandedKeys.has(node.id);
    const isSelected = selectedKey === node.id;
    const isChecked = checkedKeys.includes(node.id);

    return (
      <MenuTreeNodeRow
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
        renderChildren={renderTreeNode}
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
                    `px-5 py-2 text-left text-sm text-gray-500 whitespace-nowrap ${idx===0 ? '' : 'min-w-[100px]'} dark:text-gray-400`
                  }
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
              {showActions && (
                <th className="px-5 py-2 text-left text-sm text-gray-500 whitespace-nowrap sticky right-0 z-30 bg-white border-l border-gray-200 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-900 min-w-[180px] w-[180px]">操作</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((node) => renderTreeNode(node))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuTreeTable;

