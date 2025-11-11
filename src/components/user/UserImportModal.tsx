/**
 * 用户导入模态框组件
 */

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DownloadIcon, FileIcon } from '@/icons/index';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import FormField from '@/components/form/FormField';
import DeptTreeSelector from '@/components/ui/tree/DeptTreeSelector';
import UserImportResultModal, { ImportResult } from './UserImportResultModal';
import { useUserImportExport } from '@/hooks/useUser';
import { useDeptOptions } from '@/hooks/useDept';

interface UserImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function UserImportModal({ 
  visible, 
  onClose, 
  onSuccess 
}: UserImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const { importUsers, downloadTemplate, loading: importExportLoading } = useUserImportExport();
  const { options: deptNodes, loading: deptOptionsLoading, fetchOptions } = useDeptOptions();
  
  // 初始化部门数据
  useEffect(() => {
    if (visible) {
      fetchOptions();
    }
  }, [visible, fetchOptions]);

  // 每次从列表页进入（弹窗变为可见）时，清空上次导入记录与表单状态
  useEffect(() => {
    if (visible) {
      setImportResult(null);
      setShowResultModal(false);
      setSelectedFile(null);
      setErrors({});
    }
  }, [visible]);
  
  // 部门选择处理 - 适配 DeptTreeSelector
  const handleDeptChange = useCallback((value: number | number[]) => {
    if (typeof value === 'number') {
      setSelectedDeptId(value);
    } else if (Array.isArray(value) && value.length > 0) {
      setSelectedDeptId(value[0]);
    } else {
      setSelectedDeptId(undefined);
    }
    
    // 清除部门选择错误
    if (errors.deptId) {
      setErrors(prev => ({ ...prev, deptId: '' }));
    }
  }, [errors.deptId]);

  // 文件拖拽处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      // 清除文件选择错误
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    }
  }, [errors.file]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    maxFiles: 1
  });

  // 处理文件移除
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    // 清除文件选择错误
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: '' }));
    }
  }, [errors.file]);

  // 表单验证
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedDeptId) {
      newErrors.deptId = '请选择部门';
    }

    if (!selectedFile) {
      newErrors.file = '请选择要导入的文件';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedDeptId, selectedFile]);


  // 处理模板下载
  const handleDownloadTemplate = useCallback(() => {
    downloadTemplate();
  }, [downloadTemplate]);

  // 处理导入
  const handleImport = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsUploading(true);
      const result = await importUsers(selectedDeptId!, selectedFile!);
      
      // 设置导入结果并显示结果模态框
      setImportResult(result);
      setShowResultModal(true);
      
      // 不在这里触发 onSuccess，等待用户查看结果并关闭结果弹窗后再触发
    } catch {
      // 错误已在hook中处理
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, selectedDeptId, importUsers, validateForm]);

  // 处理关闭
  const handleClose = useCallback(() => {
    if (!isUploading) {
      setSelectedFile(null);
      setSelectedDeptId(undefined);
      setErrors({});
      setImportResult(null);
      setShowResultModal(false);
      onClose();
    }
  }, [isUploading, onClose]);

  // 处理结果模态框关闭
  const handleResultModalClose = useCallback(() => {
    // 仅关闭结果弹窗，保留导入页面与结果数据
    setShowResultModal(false);

    // 如果有有效数据，触发成功回调（通常用于刷新列表）
    if (importResult && importResult.validCount > 0) {
      onSuccess?.();
    }
  }, [importResult, onSuccess]);

  // 再次查看本次导入结果
  const handleShowLastResult = useCallback(() => {
    if (importResult) {
      setShowResultModal(true);
    }
  }, [importResult]);

  return (
    <Modal
      isOpen={visible}
      onClose={handleClose}
      className="max-w-2xl"
    >
      <div className="p-6">
        {/* 标题 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            导入用户数据
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            选择部门并上传Excel文件来批量导入用户数据
          </p>
        </div>

        {/* 表单内容 */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleImport();
        }} className="space-y-6">
        {/* 部门选择 */}
        <FormField
          label="选择部门"
          required
          error={errors.deptId}
          helpText="选择要导入用户的部门"
          layout="vertical"
        >
          <DeptTreeSelector
            data={deptNodes}
            value={selectedDeptId}
            onChange={handleDeptChange}
            placeholder="请选择部门"
            loading={deptOptionsLoading}
            showSearch={true}
            allowClear={true}
            className="w-full"
            useOptionFormat={true}
          />
        </FormField>

        {/* 文件上传区域 */}
        <FormField
          label="选择文件"
          required
          error={errors.file}
          helpText="支持 .xlsx 和 .xls 格式的Excel文件"
          layout="inline"
        >
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''} ${
                errors.file ? 'border-red-300 dark:border-red-600' : ''
              }`}
            >
              <input {...getInputProps()} disabled={isUploading} />
              <FileIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {isDragActive ? '松开鼠标上传文件' : '点击或拖拽文件到此处'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                支持 .xlsx 和 .xls 格式
              </p>
            </div>
          ) : (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <FileIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </FormField>

        {/* 提示信息 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                文件格式要求
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                格式为 <span className="font-mono">*.xlsx</span> / <span className="font-mono">*.xls</span>，文件不超过一个
              </p>
            </div>
          </div>
        </div>

        {/* 下载模板按钮 */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            disabled={importExportLoading || isUploading}
            className="flex items-center space-x-2"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>下载模板</span>
          </Button>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
          {importResult && !showResultModal && (
            <Button
              variant="outline"
              onClick={handleShowLastResult}
            >
              查看上次导入结果
            </Button>
          )}
          <button
            type="submit"
            disabled={!selectedFile || !selectedDeptId || isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? '导入中...' : '确认导入'}
          </button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            取消
          </Button>
        </div>
        </form>
      </div>

      {/* 导入结果模态框 */}
      <UserImportResultModal
        visible={showResultModal}
        onClose={handleResultModalClose}
        result={importResult}
      />
    </Modal>
  );
}

export default UserImportModal;
