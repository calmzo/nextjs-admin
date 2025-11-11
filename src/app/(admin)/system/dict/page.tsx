/**
 * 字典管理页面
 */

"use client";

import React, { useState, useCallback, useRef } from 'react';
import DictList from '@/components/dict/DictList';
import DictFormModal from '@/components/dict/DictFormModal';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DictPageVO } from '@/api/dict.api';

export default function DictManagementPage() {
  // 状态管理
  const [formVisible, setFormVisible] = useState(false);
  const [currentDict, setCurrentDict] = useState<DictPageVO | null>(null);
  
  // 刷新函数引用
  const refreshDictListRef = useRef<(() => void) | null>(null);

  // 处理新增字典
  const handleAdd = useCallback(() => {
    setCurrentDict(null);
    setFormVisible(true);
  }, []);

  // 处理编辑字典
  const handleEdit = useCallback((dict: DictPageVO) => {
    setCurrentDict(dict);
    setFormVisible(true);
  }, []);

  // 接收DictList的刷新函数
  const handleRefreshRequest = useCallback((refreshFn: () => void) => {
    refreshDictListRef.current = refreshFn;
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面面包屑 */}
      <div className="px-6 pt-6">
        <PageBreadcrumb pageTitle="字典管理" />
      </div>

      {/* 页面内容 */}
      <div>
        {/* 字典列表 */}
        <div className="overflow-x-auto px-6">
          <DictList
            onAdd={handleAdd}
            onEdit={handleEdit}
            onRefreshRequest={handleRefreshRequest}
          />
        </div>
      </div>

      {/* 字典表单弹窗 - 使用 DictFormModal */}
      <DictFormModal
        visible={formVisible}
        dict={currentDict}
        onClose={() => {
          setFormVisible(false);
          setCurrentDict(null);
        }}
        onSuccess={() => {
          // 刷新字典列表
          if (refreshDictListRef.current) {
            refreshDictListRef.current();
          }
        }}
      />
    </div>
  );
}
