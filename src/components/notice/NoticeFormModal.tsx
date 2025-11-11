/**
 * 通知公告表单弹窗组件（新增/编辑）
 * 使用 AdminForm 通用表单组件
 */

"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { AdminForm } from '@/components/common/AdminForm';
import { getNoticeFormFields } from './NoticeFormFields';
import NoticeAPI, { NoticeFormData, NoticePageVO } from '@/api/notice.api';
import { useDictItems } from '@/hooks/useDict';
import { UserAPI } from '@/api/user.api';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';
import type { OptionType } from '@/types/api';

interface NoticeFormModalProps {
  visible: boolean;
  notice?: NoticePageVO | null; // 编辑时传入，新增时为 null
  onClose: () => void;
  onSuccess?: () => void;
}

const NoticeFormModal: React.FC<NoticeFormModalProps> = ({
  visible,
  notice,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NoticeFormData & Record<string, unknown> | undefined>(undefined);
  const [userOptions, setUserOptions] = useState<OptionType[]>([]);
  const [userOptionsLoading, setUserOptionsLoading] = useState(false);

  // 字典数据
  const { items: noticeTypeItems } = useDictItems('notice_type');
  const { items: noticeLevelItems } = useDictItems('notice_level');

  // 通知类型选项
  const noticeTypeOptions = useMemo(() => {
    return noticeTypeItems.map(item => ({
      value: item.value,
      label: item.label,
    }));
  }, [noticeTypeItems]);

  // 通知等级选项
  const noticeLevelOptions = useMemo(() => {
    return noticeLevelItems.map(item => ({
      value: item.value,
      label: item.label,
    }));
  }, [noticeLevelItems]);

  // 加载表单数据（编辑模式）
  useEffect(() => {
    if (visible && notice?.id) {
      setLoading(true);
      NoticeAPI.getFormData(notice.id)
        .then((data) => {
          setFormData({
            title: data.title || '',
            content: data.content || '',
            type: data.type,
            level: data.level || 'M',
            targetType: data.targetType || 1,
            targetUserIds: data.targetUserIds || '',
          });
        })
        .catch((error: unknown) => {
          handleError(error, { showToast: false });
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (visible && !notice) {
      // 新增模式：重置表单数据
      setFormData(undefined);
    }
  }, [visible, notice]);

  // 预加载用户选项（弹窗打开时加载，以便用户切换到"指定"时选项已准备好）
  useEffect(() => {
    if (visible && userOptions.length === 0 && !userOptionsLoading) {
      setUserOptionsLoading(true);
      UserAPI.getOptions()
        .then((options) => {
          setUserOptions(options || []);
        })
        .catch((error: unknown) => {
          handleError(error, { showToast: false });
          setUserOptions([]);
        })
        .finally(() => {
          setUserOptionsLoading(false);
        });
    }
  }, [visible, userOptions.length, userOptionsLoading]);

  // 获取表单字段配置
  const fields = useMemo(() => {
    return getNoticeFormFields(
      !!notice?.id,
      noticeTypeOptions,
      noticeLevelOptions,
      userOptions,
      userOptionsLoading
    );
  }, [notice?.id, noticeTypeOptions, noticeLevelOptions, userOptions, userOptionsLoading]);

  // 数据转换函数 - 确保数据格式正确
  const transformData = useCallback((data: NoticeFormData & Record<string, unknown>): NoticeFormData & Record<string, unknown> => {
    // 处理 targetType：AdminForm 的 select 返回字符串，需要转换为数字
    const targetType = typeof data.targetType === 'string' 
      ? Number(data.targetType) 
      : Number(data.targetType || 1);

    const submitData: NoticeFormData & Record<string, unknown> = {
      title: String(data.title || '').trim(),
      content: String(data.content || '').trim(),
      type: typeof data.type === 'string' ? Number(data.type) : Number(data.type),
      level: data.level as string || 'M',
      targetType,
    };

    // 如果目标类型是指定，则设置 targetUserIds
    if (targetType === 2 && data.targetUserIds) {
      submitData.targetUserIds = String(data.targetUserIds);
    } else {
      // 如果目标类型不是指定，置空 targetUserIds 以满足后端与测试期望
      submitData.targetUserIds = '';
    }

    // 编辑时包含 id
    if (notice?.id) {
      submitData.id = notice.id;
    }

    return submitData;
  }, [notice?.id]);

  // 处理表单提交
  // 注意：AdminForm 会先调用 transformData 转换数据，然后调用 onSubmit
  // 所以这里接收到的 data 已经是转换后的数据
  const handleSubmit = useCallback(async (data: NoticeFormData & Record<string, unknown>) => {
    try {
      if (notice?.id) {
        // 更新通知
        await NoticeAPI.update(notice.id, data);
        toast.success('编辑成功');
      } else {
        // 创建通知
        await NoticeAPI.create(data);
        toast.success('新增成功');
      }

      // 注意：onSuccess 和 onClose 由 AdminForm 统一处理，这里不需要调用
      // AdminForm 会在提交成功后自动调用 onSuccess，然后关闭弹窗
    } catch (error) {
      // 错误需要重新抛出，让 AdminForm 知道提交失败
      // 但错误提示已由响应拦截器统一处理，这里不需要额外处理
      throw error;
    }
  }, [notice?.id]);

  return (
    <AdminForm
      visible={visible}
      initialData={formData}
      formId={notice?.id}
      title={notice?.id ? '编辑通知公告' : '新增通知公告'}
      description={notice?.id ? '修改通知公告信息' : '填写通知公告信息'}
      fields={fields}
      onSubmit={handleSubmit}
      onCancel={onClose}
      submitText="保存"
      onSuccess={() => {
        // 成功回调：刷新列表并关闭弹窗
        onSuccess?.();
        onClose();
      }}
      transformData={transformData}
      maxWidth="2xl"
      loading={loading}
    />
  );
};

export default NoticeFormModal;
