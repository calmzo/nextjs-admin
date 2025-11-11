/**
 * 富文本编辑器组件（基于 Quill，兼容 React 19）
 */

"use client";

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import logger from '@/utils/logger';
import type Quill from 'quill';

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = '请输入内容',
  error = false,
  disabled = false,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isInitializedRef = useRef(false);

  // 配置工具栏选项
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: [] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ direction: 'rtl' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  // 配置格式化选项
  const formats = useMemo(
    () => [
      'header',
      'font',
      'size',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'list',
      'indent',
      'script',
      'direction',
      'color',
      'background',
      'align',
      'link',
      'image',
    ],
    []
  );

  // 使用 useCallback 包装 onChange，避免不必要的重新初始化
  const handleChange = useCallback((html: string) => {
    onChange(html);
  }, [onChange]);

  // 初始化 Quill 编辑器
  useEffect(() => {
    if (!editorRef.current || isInitializedRef.current || typeof window === 'undefined') {
      return;
    }

    const initQuill = async () => {
      try {
        // 动态导入 Quill
        const QuillModule = await import('quill');
        // 动态导入样式（CSS 文件）
        if (typeof window !== 'undefined') {
          // @ts-expect-error - CSS 文件导入
          await import('quill/dist/quill.snow.css');
        }
        
        const QuillClass = QuillModule.default as typeof Quill;
        
        if (!editorRef.current || quillRef.current) {
          return;
        }

        const quill = new QuillClass(editorRef.current, {
          theme: 'snow',
          modules,
          formats,
          placeholder: placeholder || '请输入内容',
          readOnly: disabled,
        });

        // 设置初始内容（确保 value 是字符串）
        const initialValue = value || '';
        if (initialValue.trim()) {
          quill.root.innerHTML = initialValue;
        }

        // 监听内容变化
        quill.on('text-change', () => {
          const html = quill.root.innerHTML;
          // 避免无限循环：只有当内容真正改变时才触发 onChange
          const currentValue = value || '';
          if (html !== currentValue) {
            handleChange(html);
          }
        });

        quillRef.current = quill;
        isInitializedRef.current = true;
      } catch (error) {
        logger.error('Failed to initialize Quill:', error);
      }
    };

    initQuill();

    // 清理函数
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
        isInitializedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时初始化一次

  // 同步外部 value 变化到编辑器
  useEffect(() => {
    if (quillRef.current && isInitializedRef.current) {
      const currentContent = quillRef.current.root.innerHTML;
      // 确保 value 是字符串，避免 undefined 导致的错误
      const safeValue = value || '';
      const normalizedValue = safeValue || '<p><br></p>';
      const normalizedCurrent = currentContent || '<p><br></p>';
      
      // 只有当内容真正不同时才更新
      if (normalizedValue !== normalizedCurrent) {
        const selection = quillRef.current.getSelection();
        quillRef.current.root.innerHTML = normalizedValue;
        // 恢复光标位置
        if (selection) {
          // 延迟恢复，确保 DOM 已更新
          setTimeout(() => {
            if (quillRef.current) {
              const length = quillRef.current.getLength();
              const index = Math.min(selection.index, Math.max(0, length - 1));
              quillRef.current.setSelection(index, selection.length);
            }
          }, 0);
        }
      }
    }
  }, [value]);

  // 同步 disabled 状态
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!disabled);
    }
  }, [disabled]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <div
        ref={editorRef}
        className={`${error ? 'border-red-500' : ''}`}
        style={{ minHeight: '200px' }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 14px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark .rich-text-editor .ql-toolbar {
          background-color: #1f2937;
          border-color: #374151;
        }
        .dark .rich-text-editor .ql-container {
          background-color: #1f2937;
          border-color: #374151;
          color: #f3f4f6;
        }
        .dark .rich-text-editor .ql-editor {
          color: #f3f4f6;
        }
        .dark .rich-text-editor .ql-stroke {
          stroke: #9ca3af;
        }
        .dark .rich-text-editor .ql-fill {
          fill: #9ca3af;
        }
        .dark .rich-text-editor .ql-picker-label {
          color: #9ca3af;
        }
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;

