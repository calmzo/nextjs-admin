/**
 * 通知公告管理页面
 */

"use client";

import React, { useState, useCallback, useRef } from 'react';
import NoticeList from '@/components/notice/NoticeList';
import NoticeDetailModal from '@/components/notice/NoticeDetailModal';
import NoticeFormModal from '@/components/notice/NoticeFormModal';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import NoticeAPI, { NoticePageVO, NoticeDetailVO } from '@/api/notice.api';
import { handleError } from '@/utils/error-handler';

export default function NoticeManagementPage() {
  // 状态管理
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<NoticeDetailVO | undefined>(undefined);
  const [formVisible, setFormVisible] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticePageVO | null>(null);
  
  // 刷新函数引用
  const refreshNoticeListRef = useRef<(() => void) | null>(null);

  // 处理新增通知
  const handleAdd = useCallback(() => {
    setEditingNotice(null);
    setFormVisible(true);
  }, []);

  // 处理查看详情
  const handleView = useCallback(async (notice: NoticePageVO) => {
    try {
      const detail = await NoticeAPI.getDetail(notice.id);
      setDetailData(detail);
      setDetailVisible(true);
    } catch (error: unknown) {
      // request.ts 已经处理了错误提示，这里只记录日志
      handleError(error, { showToast: false });
    }
  }, []);

  // 处理编辑通知
  const handleEdit = useCallback((notice: NoticePageVO) => {
    setEditingNotice(notice);
    setFormVisible(true);
  }, []);

  // 处理表单成功回调
  const handleFormSuccess = useCallback(() => {
    // 刷新列表
    if (refreshNoticeListRef.current) {
      refreshNoticeListRef.current();
    }
  }, []);

  // 接收NoticeList的刷新函数
  const handleRefreshRequest = useCallback((refreshFn: () => void) => {
    refreshNoticeListRef.current = refreshFn;
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面面包屑 */}
      <div className="px-6 pt-6">
        <PageBreadcrumb pageTitle="通知公告" />
      </div>

      {/* 页面内容 */}
      <div>
        {/* 通知公告列表 */}
        <div className="overflow-x-auto px-6">
          <NoticeList
            onAdd={handleAdd}
            onView={handleView}
            onEdit={handleEdit}
            onRefreshRequest={handleRefreshRequest}
          />
        </div>
      </div>

      {/* 详情弹窗 */}
      <NoticeDetailModal
        visible={detailVisible}
        data={detailData}
        onClose={() => {
          setDetailVisible(false);
          setDetailData(undefined);
        }}
      />

      {/* 表单弹窗（新增/编辑） */}
      <NoticeFormModal
        visible={formVisible}
        notice={editingNotice}
        onClose={() => {
          setFormVisible(false);
          setEditingNotice(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
