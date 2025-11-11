/**
 * 通用模态框表单组件
 * 提供统一的表单弹窗样式和交互逻辑
 */

"use client";

import React from 'react';
import { Modal } from '@/components/ui/modal';

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  loading?: boolean;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showFooter?: boolean;
}

const ModalForm: React.FC<ModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  loading = false,
  isSubmitting = false,
  submitText = '保存',
  cancelText = '取消',
  className = '',
  maxWidth = '2xl',
  showFooter = true
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  const modalClassName = `${maxWidthClasses[maxWidth]} p-4 ${className}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={`${modalClassName} shadow-2xl border border-gray-200/5 dark:border-gray-700/5 bg-white/95 dark:bg-gray-900/95`}
    >
      {/* 标题区域 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* 表单内容 */}
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        
        {/* 操作按钮 */}
        {showFooter && (
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-4 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isSubmitting ? '保存中...' : submitText}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading || isSubmitting}
              className="px-4 py-2 text-xs border border-gray-300/30 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 hover:border-gray-400/50 dark:hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ModalForm;
