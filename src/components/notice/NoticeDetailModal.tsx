/**
 * 通知公告详情模态框组件
 * 使用通用详情组件展示只读详情
 */

"use client";

import React, { useMemo } from 'react';
import DetailModal, { type DetailField } from '@/components/form/DetailModal';
import type { NoticeDetailVO } from '@/api/notice.api';

interface NoticeDetailModalProps {
  visible: boolean;
  data: NoticeDetailVO | undefined;
  onClose: () => void;
}

const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  visible,
  data,
  onClose,
}) => {
  // 格式化发布状态
  const getPublishStatusLabel = (status?: number) => {
    switch (status) {
      case 0:
        return '未发布';
      case 1:
        return '已发布';
      case -1:
        return '已撤回';
      default:
        return '-';
    }
  };

  // 格式化发布状态样式
  const getPublishStatusClass = (status?: number) => {
    switch (status) {
      case 0:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 1:
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case -1:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // 字段配置
  const fields: DetailField[] = useMemo(
    () => [
      {
        label: '标题',
        key: 'title',
        type: 'text',
      },
      {
        label: '发布状态',
        key: 'publishStatus',
        type: 'label',
        labelFormatter: (value) => getPublishStatusLabel(value as number),
        labelClassName: (value) => getPublishStatusClass(value as number),
      },
      {
        label: '发布人',
        key: 'publisherName',
        type: 'text',
      },
      {
        label: '发布时间',
        key: 'publishTime',
        type: 'datetime',
      },
      {
        label: '通知类型',
        key: 'type',
        type: 'dict',
        dictCode: 'notice_type',
        condition: (data) => data.type !== undefined,
      },
      {
        label: '通知等级',
        key: 'level',
        type: 'dict',
        dictCode: 'notice_level',
        condition: (data) => data.level !== undefined,
      },
      {
        label: '公告内容',
        key: 'content',
        type: 'html',
      },
    ],
    []
  );

  return (
    <DetailModal
      visible={visible}
      title="通知公告详情"
      data={data as Record<string, unknown>}
      fields={fields}
      onClose={onClose}
    />
  );
};

export default NoticeDetailModal;

