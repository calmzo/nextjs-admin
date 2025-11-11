import React from 'react';
import { PlusIcon, PencilIcon, TrashBinIcon, ListIcon, EyeIcon } from '@/icons/index';

export interface ActionButtonsProps {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  addTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAdd,
  onEdit,
  onDelete,
  addTitle = "新增",
  editTitle = "编辑",
  deleteTitle = "删除",
  showAdd = true,
  showEdit = true,
  showDelete = true,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* 新增按钮 */}
      {showAdd && onAdd && (
        <button 
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
          title={addTitle}
        >
          <PlusIcon />
          {addTitle}
        </button>
      )}
      
      {/* 编辑按钮 */}
      {showEdit && onEdit && (
        <button 
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
          title={editTitle}
        >
          <PencilIcon />
          {editTitle}
        </button>
      )}
      
      {/* 删除按钮 */}
      {showDelete && onDelete && (
        <button 
          onClick={onDelete}
          className="inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
          title={deleteTitle}
        >
          <TrashBinIcon />
          {deleteTitle}
        </button>
      )}
    </div>
  );
};

// 单独导出各个按钮组件，方便单独使用
export const AddButton: React.FC<{
  onClick?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, title = "新增", children, className = "", disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={title}
  >
    <PlusIcon />
    {children || title}
  </button>
);

export const EditButton: React.FC<{
  onClick?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, title = "编辑", children, className = "", disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={title}
  >
    <PencilIcon />
    {children || title}
  </button>
);

export const DeleteButton: React.FC<{
  onClick?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, title = "删除", children, className = "", disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={title}
  >
    <TrashBinIcon />
    {children || title}
  </button>
);

export const ListButton: React.FC<{
  onClick?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ onClick, title = "列表", children, className = "" }) => (
  <button 
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200 ${className}`}
    title={title}
  >
    <ListIcon />
    {children || title}
  </button>
);

export const ViewButton: React.FC<{
  onClick?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, title = "查看", children, className = "", disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={title}
  >
    <EyeIcon />
    {children || title}
  </button>
);

/**
 * 通用操作按钮组件
 * 用于创建带图标和文本的操作按钮，支持自定义图标、文本和样式
 */
export const ActionButton: React.FC<{
  onClick?: () => void;
  icon: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  variant?: 'blue' | 'red' | 'green' | 'gray';
  className?: string;
}> = ({ 
  onClick, 
  icon, 
  title, 
  children, 
  variant = 'blue',
  className = "" 
}) => {
  const variantClasses = {
    blue: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20',
    red: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20',
    green: 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20',
    gray: 'text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-900/20',
  };

  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-0.5 px-2 py-1 text-xs ${variantClasses[variant]} rounded-md transition-colors duration-200 ${className}`}
      title={title}
    >
      {icon}
      {children || title}
    </button>
  );
};
