/**
 * 角色管理页面
 */

"use client";

import React, { useState, useRef, useMemo } from 'react';
import { useModal } from '@/hooks/useModal';
import RoleList from '@/components/role/RoleList';
import RoleForm from '@/components/role/RoleForm';
import RolePermissionDrawer from '@/components/role/RolePermissionDrawer';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { RolePageVO, RoleForm as RoleFormType } from '@/api/role.api';
import { useRoleOperations, useRoleForm } from '@/hooks/useRole';
import { handleError } from '@/utils/error-handler';

export default function RoleManagementPage() {
  // 状态管理
  const [editingRole, setEditingRole] = useState<RolePageVO | null>(null);
  const [assigningRole, setAssigningRole] = useState<RolePageVO | null>(null);
  
  // 刷新函数引用
  const refreshRoleListRef = useRef<(() => void) | null>(null);

  // 弹窗状态
  const { 
    isOpen: isFormOpen, 
    openModal: openFormModal, 
    closeModal: closeFormModal 
  } = useModal();

  const {
    isOpen: isPermissionDrawerOpen,
    openModal: openPermissionDrawer,
    closeModal: closePermissionDrawer,
  } = useModal();

  // Hooks
  const { create, update, loading: operationLoading } = useRoleOperations();
  const { formData: roleFormData, fetchFormData, resetFormData, loading: formDataLoading } = useRoleForm();

  // 处理新增角色
  const handleAddRole = () => {
    setEditingRole(null);
    resetFormData();
    openFormModal();
  };

  // 处理编辑角色
  const handleEditRole = (role: RolePageVO) => {
    setEditingRole(role);
    resetFormData(); // 先重置，确保加载新数据
    openFormModal();
    // 打开模态框后再加载表单数据，提升用户体验
    if (role.id) {
      fetchFormData(role.id).catch((error) => {
        // request.ts 已经处理了错误提示，这里只记录日志
        handleError(error, { showToast: false });
      });
    }
  };


  // 处理查看角色（分配权限）
  const handleViewRole = (role: RolePageVO) => {
    setAssigningRole(role);
    openPermissionDrawer();
  };

  // 处理表单提交
  const handleFormSubmit = async (data: RoleFormType) => {
    try {
      if (data.id) {
        // 更新角色
        const success = await update(data.id, data);
        if (success) {
          closeFormModal();
          resetFormData();
          setEditingRole(null);
          // 刷新角色列表
          if (refreshRoleListRef.current) {
            refreshRoleListRef.current();
          }
        }
      } else {
        // 创建角色
        const success = await create(data);
        if (success) {
          closeFormModal();
          resetFormData();
          setEditingRole(null);
          // 刷新角色列表
          if (refreshRoleListRef.current) {
            refreshRoleListRef.current();
          }
        }
      }
    } catch (error) {
      // request.ts 已经处理了错误提示，这里只记录日志
      handleError(error, { showToast: false });
    }
  };
  
  // 接收RoleList的刷新函数
  const handleRefreshRequest = (refreshFn: () => void) => {
    refreshRoleListRef.current = refreshFn;
  };

  // 计算表单初始数据
  const formInitialData = useMemo(() => {
    if (!editingRole?.id) {
      return undefined;
    }
    
    // 优先使用从API获取的完整表单数据
    if (roleFormData && roleFormData.id === editingRole.id) {
      return roleFormData;
    }
    
    // 否则使用列表数据作为临时初始值（缺少 dataScope，但会在 API 数据加载后更新）
    return {
      id: editingRole.id,
      name: editingRole.name || '',
      code: editingRole.code || '',
      sort: editingRole.sort || 1,
      status: editingRole.status ?? 1,
    };
  }, [editingRole, roleFormData]);

  return (
    <div className="space-y-6">
      {/* 页面面包屑 */}
      <div className="px-6 pt-6">
        <PageBreadcrumb pageTitle="角色管理" />
      </div>

      {/* 页面内容 */}
      <div>
        {/* 角色列表 溢出滚动和内边距合并到table最外层div */}
        <div className="overflow-x-auto px-6">
          <RoleList
            onAdd={handleAddRole}
            onEdit={handleEditRole}
            onView={handleViewRole}
            onRefreshRequest={handleRefreshRequest}
          />
        </div>
      </div>

      {/* 角色表单弹窗 */}
      <RoleForm
        isOpen={isFormOpen}
        onClose={() => {
          closeFormModal();
          resetFormData();
          setEditingRole(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={formInitialData}
        loading={operationLoading || formDataLoading}
      />

      {/* 角色分配权限抽屉 */}
      <RolePermissionDrawer
        visible={isPermissionDrawerOpen}
        role={assigningRole}
        onClose={() => {
          closePermissionDrawer();
          setAssigningRole(null);
        }}
        onSuccess={() => {
          // 分配权限成功后刷新列表
          if (refreshRoleListRef.current) {
            refreshRoleListRef.current();
          }
        }}
      />
    </div>
  );
}
