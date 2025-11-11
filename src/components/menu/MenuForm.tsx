/**
 * 菜单表单组件（采用 AdminForm）
 */

"use client";

import React, { useMemo, useCallback } from 'react';
import type { MenuNode } from '@/types/menu-tree';
import type { MenuFormData } from '@/api/menu.api';
import { MenuType } from '@/types/menu-tree';
import IconSelect from '@/components/menu/IconSelect';
import MenuTreeDropdown from '@/components/ui/tree/MenuTreeDropdown';
import { AdminForm } from '@/components/common/AdminForm';
import type { AdminFieldConfig } from '@/components/common/AdminForm/types';

interface MenuFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuFormData) => Promise<void>;
  initialData?: Partial<MenuFormData>;
  parentMenu?: MenuNode;
  loading?: boolean;
  menuOptions?: MenuNode[]; // 菜单选项数据
}

const MenuForm: React.FC<MenuFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentMenu,
  loading = false,
  menuOptions = []
}) => {
  const isEdit = !!initialData?.id;
  const title = isEdit ? '编辑菜单' : '新增菜单';
  const description = isEdit ? '修改菜单信息' : '填写菜单基本信息';

  // 字段配置（使用 AdminForm）
  const fields = useMemo<AdminFieldConfig<MenuFormData & Record<string, unknown>>[]>(() => {
    return [
      { key: 'name', label: '菜单名称', type: 'text', required: true, placeholder: '请输入菜单名称' },
      {
        key: 'type',
        label: '菜单类型',
        type: 'radio',
        required: true,
        options: [
          { label: '目录', value: MenuType.DIRECTORY },
          { label: '菜单', value: MenuType.MENU },
          { label: '外链', value: MenuType.EXTLINK },
          { label: '按钮', value: MenuType.BUTTON },
        ],
        defaultValue: MenuType.DIRECTORY,
      },
      {
        key: 'parentId',
        label: '上级菜单',
        type: 'custom',
        render: (_value, onChange) => (
          <MenuTreeDropdown
            data={menuOptions}
            value={Number(_value || 0)}
            placeholder="选择上级菜单（可选）"
            onChange={(value) => onChange((value as number) || 0)}
            showSearch={true}
            allowClear={true}
          />
        ),
        defaultValue: parentMenu?.id || 0,
        show: () => !isEdit,
      },
      {
        key: 'path',
        label: '路由地址',
        type: 'text',
        placeholder: '请输入路由地址',
        required: true,
        show: (fd) => Number(fd.type as number) !== MenuType.BUTTON,
      },
      {
        key: 'component',
        label: '组件路径',
        type: 'text',
        placeholder: '例如：system/user/index',
        required: true,
        show: (fd) => Number(fd.type as number) === MenuType.MENU,
      },
      {
        key: 'icon',
        label: '图标',
        type: 'custom',
        render: (value, onChange) => (
          <IconSelect value={String(value || '')} onChange={(val) => onChange(String(val || ''))} placeholder="点击选择图标" />
        ),
        show: (fd) => Number(fd.type as number) !== MenuType.BUTTON,
      },
      {
        key: 'perm',
        label: '权限标识',
        type: 'text',
        placeholder: '例如：sys:menu:add',
        show: (fd) => Number(fd.type as number) === MenuType.BUTTON,
      },
      {
        key: 'sort',
        label: '显示排序',
        type: 'number',
        required: true,
        min: 0,
        step: 1,
        defaultValue: 1,
      },
      {
        key: 'status',
        label: '菜单状态',
        type: 'radio',
        required: true,
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
        defaultValue: 1,
      },
      {
        key: 'visible',
        label: '显示状态',
        type: 'radio',
        required: true,
        options: [
          { label: '显示', value: 1 },
          { label: '隐藏', value: 0 },
        ],
        defaultValue: 1,
        show: (fd) => Number(fd.type as number) !== MenuType.BUTTON,
      },
    ];
  }, [menuOptions, parentMenu?.id, isEdit]);

  const preparedInitialData = useMemo(() => {
    if (!initialData) return undefined;
    const data: MenuFormData & Record<string, unknown> = {
      ...initialData,
      name: initialData.name ?? '',
      path: initialData.path ?? '',
      component: initialData.component ?? '',
      icon: initialData.icon ?? '',
      type: initialData.type ?? MenuType.DIRECTORY,
      parentId: initialData.parentId ?? parentMenu?.id ?? 0,
      sort: initialData.sort ?? 1,
      status: initialData.status ?? 1,
      visible: initialData.visible ?? 1,
      perm: initialData.perm ?? '',
    };
    return data;
  }, [initialData, parentMenu?.id]);

  const transformData = useCallback(
    (data: MenuFormData & Record<string, unknown>): MenuFormData & Record<string, unknown> => {
      const submitData: MenuFormData = {
        name: String(data.name || '').trim(),
        path: String(data.path || '').trim(),
        component: String(data.component || '').trim(),
        icon: String(data.icon || '').trim(),
        type: Number.isFinite(Number(data.type)) ? Number(data.type) : MenuType.DIRECTORY,
        parentId: Number.isFinite(Number(data.parentId)) ? Number(data.parentId) : 0,
        sort: Number.isFinite(Number(data.sort)) ? Number(data.sort) : 1,
        status: Number.isFinite(Number(data.status)) ? Number(data.status) : 1,
        visible: Number.isFinite(Number(data.visible)) ? Number(data.visible) : 1,
        perm: data.perm ? String(data.perm).trim() : undefined,
      };
      const idValue = data.id ?? initialData?.id;
      if (idValue !== undefined && idValue !== null) {
        const numericId = Number(idValue);
        if (!Number.isNaN(numericId)) {
          submitData.id = numericId;
        }
      }
      return submitData as MenuFormData & Record<string, unknown>;
    },
    [initialData?.id],
  );

  const handleSubmit = useCallback(
    async (data: MenuFormData & Record<string, unknown>) => {
      await onSubmit(data as MenuFormData);
    },
    [onSubmit],
  );

  return (
    <AdminForm<MenuFormData & Record<string, unknown>>
      visible={isOpen}
      initialData={preparedInitialData}
      formId={initialData?.id}
      title={title}
      description={description}
      fields={fields}
      onSubmit={handleSubmit}
      onCancel={onClose}
      onSuccess={onClose}
      transformData={transformData}
      maxWidth="2xl"
      loading={loading}
    />
  );
};

export default MenuForm;

