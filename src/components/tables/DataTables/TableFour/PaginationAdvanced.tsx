"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronDoubleRightIcon, ChevronDoubleLeftIcon } from '@/icons/index';

interface PaginationAdvancedProps {
  current: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export default function PaginationAdvanced({
  current,
  pageSize,
  total,
  onPageChange,
}: PaginationAdvancedProps) {
  // 省略号悬停状态
  const [ellipsisHovered, setEllipsisHovered] = useState<Record<string, boolean>>({});
  // 跳转页码输入框的值
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  // 标记是否通过输入框跳转，避免循环更新
  const isJumpingByInput = useRef(false);

  const totalPages = Math.ceil(total / pageSize);

  // 当页码通过其他方式（非输入框）改变时，同步更新输入框
  useEffect(() => {
    // 如果不是通过输入框跳转的，更新输入框为当前页码
    if (!isJumpingByInput.current) {
      setJumpPageInput(current.toString());
    }
    // 重置标记
    isJumpingByInput.current = false;
  }, [current]);

  // 生成分页页码数组（动态显示页码和省略号）
  const generatePageNumbers = (
    current: number,
    totalPages: number
  ): (number | 'ellipsis-left' | 'ellipsis-right')[] => {
    if (totalPages <= 8) {
      // 如果总页数少于等于8页，显示所有页码
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];

    // 如果当前页在前6页范围内，显示前6页 + 省略号 + 最后1页
    if (current <= 6) {
      for (let i = 1; i <= 6; i++) {
        pages.push(i);
      }
      pages.push('ellipsis-right');
      pages.push(totalPages);
    }
    // 如果当前页在最后6页范围内，显示第1页 + 省略号 + 最后6页
    else if (current >= totalPages - 5) {
      pages.push(1);
      pages.push('ellipsis-left');
      for (let i = totalPages - 5; i <= totalPages; i++) {
        pages.push(i);
      }
    }
    // 中间情况，显示第1页 + 左侧省略号 + 当前页前后各2页 + 右侧省略号 + 最后1页
    else {
      pages.push(1);
      pages.push('ellipsis-left');
      for (let i = current - 2; i <= current + 2; i++) {
        pages.push(i);
      }
      pages.push('ellipsis-right');
      pages.push(totalPages);
    }

    return pages;
  };

  // 处理省略号点击
  const handleEllipsisClick = useCallback(
    (type: 'ellipsis-left' | 'ellipsis-right', current: number, totalPages: number) => {
      if (type === 'ellipsis-right') {
        // 右侧省略号：向前跳转5页
        const newPage = Math.min(current + 5, totalPages);
        onPageChange(newPage, pageSize);
      } else {
        // 左侧省略号：向后跳转5页
        const newPage = Math.max(current - 5, 1);
        onPageChange(newPage, pageSize);
      }
    },
    [pageSize, onPageChange]
  );

  // 处理跳转到指定页码
  const handleJumpToPage = useCallback(() => {
    const pageNum = parseInt(jumpPageInput, 10);

    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      // 如果输入无效，保留输入值，让用户可以继续编辑
      return;
    }

    // 标记这是通过输入框跳转的
    isJumpingByInput.current = true;
    onPageChange(pageNum, pageSize);
    // 跳转成功后保留输入的页码，不清空
  }, [jumpPageInput, totalPages, pageSize, onPageChange]);

  // 处理跳转输入框回车键
  const handleJumpInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleJumpToPage();
      }
    },
    [handleJumpToPage]
  );

  // 处理每页显示数量变化
  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPageSize = parseInt(e.target.value, 10);
      // 改变每页显示数量时，重置到第一页
      onPageChange(1, newPageSize);
    },
    [onPageChange]
  );

  // 处理跳转输入框失去焦点
  const handleJumpInputBlur = useCallback(() => {
    if (jumpPageInput.trim() !== '') {
      handleJumpToPage();
    } else {
      setJumpPageInput('');
    }
  }, [jumpPageInput, handleJumpToPage]);

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-gray-50 p-4 sm:w-auto sm:justify-normal sm:rounded-none sm:bg-transparent sm:p-0 dark:bg-gray-900 dark:sm:bg-transparent">
      {/* 每页显示数量下拉框 */}
      <div className="relative">
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="shadow-sm h-10 appearance-none rounded-lg border border-gray-300 bg-white px-3 pr-8 text-xs text-gray-700 hover:bg-gray-50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:focus:border-brand-500"
        >
          <option value="10">10 条/页</option>
          <option value="20">20 条/页</option>
          <option value="30">30 条/页</option>
          <option value="50">50 条/页</option>
          <option value="100">100 条/页</option>
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>
      <button
        onClick={() => onPageChange(current - 1, pageSize)}
        disabled={current === 1}
        className="shadow-sm flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
      >
        <span>
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.58203 9.99868C2.58174 10.1909 2.6549 10.3833 2.80152 10.53L7.79818 15.5301C8.09097 15.8231 8.56584 15.8233 8.85883 15.5305C9.15183 15.2377 9.152 14.7629 8.85921 14.4699L5.13911 10.7472L16.6665 10.7472C17.0807 10.7472 17.4165 10.4114 17.4165 9.99715C17.4165 9.58294 17.0807 9.24715 16.6665 9.24715L5.14456 9.24715L8.85919 5.53016C9.15199 5.23717 9.15184 4.7623 8.85885 4.4695C8.56587 4.1767 8.09099 4.17685 7.79819 4.46984L2.84069 9.43049C2.68224 9.568 2.58203 9.77087 2.58203 9.99715C2.58203 9.99766 2.58203 9.99817 2.58203 9.99868Z"
            />
          </svg>
        </span>
      </button>
      <span className="block text-xs font-medium text-gray-700 sm:hidden dark:text-gray-400">
        第 <span>{current}</span> 页，共 <span>{totalPages}</span> 页
      </span>
      <ul className="hidden items-center gap-0.5 sm:flex">
        {generatePageNumbers(current, totalPages).map((page, index) => {
          const isEllipsis = page === 'ellipsis-left' || page === 'ellipsis-right';
          const ellipsisKey = isEllipsis ? `${page}-${index}` : '';
          const isHovered = ellipsisHovered[ellipsisKey] || false;

          return (
            <li key={isEllipsis ? ellipsisKey : page}>
              {isEllipsis ? (
                <button
                  onClick={() => handleEllipsisClick(page, current, totalPages)}
                  onMouseEnter={() =>
                    setEllipsisHovered((prev) => ({ ...prev, [ellipsisKey]: true }))
                  }
                  onMouseLeave={() =>
                    setEllipsisHovered((prev) => ({ ...prev, [ellipsisKey]: false }))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
                >
                  {isHovered ? (
                    page === 'ellipsis-left' ? (
                      <ChevronDoubleLeftIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDoubleRightIcon className="h-5 w-5" />
                    )
                  ) : (
                    <span>...</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => onPageChange(page, pageSize)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-medium ${
                    current === page
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-700 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-500'
                  }`}
                >
                  <span>{page}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <button
        onClick={() => onPageChange(current + 1, pageSize)}
        disabled={current >= totalPages}
        className="shadow-sm flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
      >
        <span>
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.4165 9.9986C17.4168 10.1909 17.3437 10.3832 17.197 10.53L12.2004 15.5301C11.9076 15.8231 11.4327 15.8233 11.1397 15.5305C10.8467 15.2377 10.8465 14.7629 11.1393 14.4699L14.8594 10.7472L3.33203 10.7472C2.91782 10.7472 2.58203 10.4114 2.58203 9.99715C2.58203 9.58294 2.91782 9.24715 3.33203 9.24715L14.854 9.24715L11.1393 5.53016C10.8465 5.23717 10.8467 4.7623 11.1397 4.4695C11.4327 4.1767 11.9075 4.17685 12.2003 4.46984L17.1578 9.43049C17.3163 9.568 17.4165 9.77087 17.4165 9.99715C17.4165 9.99763 17.4165 9.99812 17.4165 9.9986Z"
            />
          </svg>
        </span>
      </button>
      {/* 跳转页码输入框 */}
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-xs text-gray-700 dark:text-gray-400">前往</span>
        <input
          type="text"
          value={jumpPageInput}
          onChange={(e) => {
            const value = e.target.value;
            // 只允许输入数字
            if (value === '' || /^\d+$/.test(value)) {
              setJumpPageInput(value);
            }
          }}
          onKeyDown={handleJumpInputKeyDown}
          onBlur={handleJumpInputBlur}
          placeholder="页码"
          className="h-10 w-16 rounded-lg border border-gray-300 bg-white px-3 text-center text-xs text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
        />
        <span className="text-xs text-gray-700 dark:text-gray-400">页</span>
      </div>
    </div>
  );
}

