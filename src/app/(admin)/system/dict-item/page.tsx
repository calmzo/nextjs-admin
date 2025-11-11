"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import { ChevronLeftIcon } from '@/icons/index';
import DictItemList from '@/components/dict/DictItemList';
import DictItemFormModal from '@/components/dict/DictItemFormModal';
import { DictItemPageVO } from '@/api/dict.api';
import { removeDictCache } from '@/hooks/useDict';

export default function DictItemManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const dictCode = searchParams.get('dictCode') || '';
  const dictName = searchParams.get('dictName') || '';

  // 表单状态
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentDictItem, setCurrentDictItem] = useState<DictItemPageVO | null>(null);
  // 使用 useRef 存储刷新函数，避免在渲染期间触发状态更新
  const refreshFnRef = useRef<(() => void) | null>(null);

  const handleBack = () => {
    router.back();
  };

  // 处理新增
  const handleAdd = useCallback(() => {
    setCurrentDictItem(null);
    setIsFormOpen(true);
  }, []);

  // 处理编辑
  const handleEdit = useCallback((item: DictItemPageVO) => {
    setCurrentDictItem(item);
    setIsFormOpen(true);
  }, []);

  // 处理表单关闭
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setCurrentDictItem(null);
  }, []);

  // 处理表单提交成功
  const handleFormSuccess = useCallback(() => {
    // 清除字典缓存，确保数据同步
    removeDictCache(dictCode);
    // 触发刷新
    if (refreshFnRef.current) {
      refreshFnRef.current();
    }
  }, [dictCode]);

  // 处理刷新函数注册
  const handleRefreshRequest = useCallback((fn: () => void) => {
    refreshFnRef.current = fn;
  }, []);

  if (!dictCode) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBack}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">字典项管理</h1>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-400">请先选择要查看的字典</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBack}
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {dictName ? `${dictName}字典数据` : '字典项管理'}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">管理字典的具体项数据</p>
      </div>

      <DictItemList 
        dictCode={dictCode}
        dictName={dictName}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onRefreshRequest={handleRefreshRequest}
      />

      {/* 字典项表单弹窗 - 使用 DictItemFormModal */}
      <DictItemFormModal
        visible={isFormOpen}
        dictCode={dictCode}
        dictItem={currentDictItem}
        dictName={dictName}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
