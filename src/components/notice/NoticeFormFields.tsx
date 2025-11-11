/**
 * 通知公告表单字段配置
 * 用于 AdminForm 组件
 */

import { AdminFieldConfig } from '@/components/common/AdminForm/types';
import { NoticeFormData } from '@/api/notice.api';
import { ReactNode } from 'react';
import RichTextEditor from '@/components/form/RichTextEditor';
import MultiSelect from '@/components/form/MultiSelect';
import type { OptionType } from '@/types/api';

/**
 * 检查富文本内容是否为空（去除 HTML 标签后检查）
 */
const isRichTextEmpty = (html: string): boolean => {
  if (!html || !html.trim()) {
    return true;
  }
  // 检查是否为 react-quill 的空值（<p><br></p> 或类似）
  const trimmed = html.trim();
  if (trimmed === '<p><br></p>' || trimmed === '<p></p>' || trimmed === '<br>') {
    return true;
  }
  // 在客户端环境下，创建临时 DOM 元素来提取纯文本
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    return !textContent.trim();
  }
  // 服务端环境：简单检查是否只包含 HTML 标签（不完美，但足够）
  const textOnly = html.replace(/<[^>]*>/g, '').trim();
  return !textOnly;
};

/**
 * 获取通知公告表单字段配置
 * @param isEdit 是否为编辑模式
 * @param noticeTypeOptions 通知类型选项
 * @param noticeLevelOptions 通知等级选项
 * @param userOptions 用户选项
 * @param userOptionsLoading 用户选项加载状态
 */
export function getNoticeFormFields(
  isEdit: boolean,
  noticeTypeOptions: Array<{ label: string; value: string | number }>,
  noticeLevelOptions: Array<{ label: string; value: string | number }>,
  userOptions: OptionType[],
  userOptionsLoading: boolean
): AdminFieldConfig<NoticeFormData & Record<string, unknown>>[] {
  // 目标类型选项
  const targetTypeOptions = [
    { value: 1, label: '全体' },
    { value: 2, label: '指定' },
  ];

  return [
    {
      key: 'title',
      label: '通知标题',
      type: 'text',
      placeholder: '请输入通知标题',
      required: true,
      validate: (value) => {
        if (!value || !String(value).trim()) {
          return '请输入通知标题';
        }
        return undefined;
      },
    },
    {
      key: 'type',
      label: '通知类型',
      type: 'select',
      placeholder: '请选择通知类型',
      required: true,
      options: noticeTypeOptions,
      validate: (value) => {
        if (!value) {
          return '请选择通知类型';
        }
        return undefined;
      },
    },
    {
      key: 'level',
      label: '通知等级',
      type: 'select',
      placeholder: '请选择通知等级',
      options: noticeLevelOptions,
      defaultValue: 'M',
    },
    {
      key: 'targetType',
      label: '目标类型',
      type: 'radio',
      options: targetTypeOptions,
      defaultValue: 1,
      layout: 'inline',
    },
    {
      key: 'targetUserIds',
      label: '指定用户',
      type: 'custom',
      show: (formData) => {
        // 只有当目标类型为指定（2）时才显示
        // AdminForm 的 select 返回字符串，需要转换为数字比较
        const targetType = typeof formData.targetType === 'string' 
          ? Number(formData.targetType) 
          : Number(formData.targetType || 1);
        return targetType === 2;
      },
      render: (value, onChange): ReactNode => {
        if (userOptionsLoading) {
          return (
            <div className="flex items-center justify-center py-4 rounded-lg border border-gray-300 dark:border-gray-700">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          );
        }

        // 将字符串转换为数组（targetUserIds 是逗号分隔的字符串）
        const selectedIds = value && typeof value === 'string' 
          ? value.split(',').filter(Boolean) 
          : [];

        return (
          <MultiSelect
            label=""
            options={userOptions.map(user => ({
              value: String(user.value),
              text: user.label,
              selected: false,
            }))}
            defaultSelected={selectedIds}
            onChange={(selectedValues: string[]) => {
              // 将数组转换为逗号分隔的字符串
              onChange(selectedValues.join(','));
            }}
          />
        );
      },
    },
    {
      key: 'content',
      label: '通知内容',
      type: 'custom',
      required: true,
      render: (value, onChange): ReactNode => {
        return (
          <RichTextEditor
            placeholder="请输入通知内容"
            value={value as string || ''}
            onChange={(html) => {
              onChange(html);
            }}
            error={false}
          />
        );
      },
      validate: (value) => {
        const content = value as string || '';
        if (isRichTextEmpty(content)) {
          return '请输入通知内容';
        }
        return undefined;
      },
    },
  ];
}

