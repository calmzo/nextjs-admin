/**
 * 用户导入结果模态框组件
 */

"use client";

import React from 'react';
import ModalForm from '@/components/form/ModalForm';

export interface ImportResult {
  code: string;
  validCount: number;
  invalidCount: number;
  messageList: string[];
}

interface UserImportResultModalProps {
  visible: boolean;
  onClose: () => void;
  result: ImportResult | null;
}

function UserImportResultModal({ 
  visible, 
  onClose, 
  result 
}: UserImportResultModalProps) {
  if (!result) return null;

  return (
    <ModalForm
      isOpen={visible}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        onClose();
      }}
      title="导入结果"
      description="用户数据导入完成"
      submitText="确定"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* 导入结果统计 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.validCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  有效数据
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {result.invalidCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  无效数据
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                导入完成
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                共处理 {result.validCount + result.invalidCount} 条数据
              </div>
            </div>
          </div>
        </div>

        {/* 错误详情表格 */}
        {result.messageList && result.messageList.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              错误详情
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                        序号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        错误信息
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {result.messageList.map((message, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400">
                          {message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 成功提示 */}
        {result.validCount > 0 && result.invalidCount === 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  所有数据导入成功！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 部分成功提示 */}
        {result.validCount > 0 && result.invalidCount > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  部分数据导入成功，请检查错误详情并修正后重新导入
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 全部失败提示 */}
        {result.validCount === 0 && result.invalidCount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  所有数据导入失败，请检查错误详情并修正后重新导入
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalForm>
  );
}

export default UserImportResultModal;
