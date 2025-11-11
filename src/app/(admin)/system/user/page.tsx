/**
 * 用户管理页面
 */

"use client";

import React, { useState, useRef } from 'react';
import { useModal } from '@/hooks/useModal';
import UserList from '@/components/user/UserList';
import UserForm from '@/components/user/UserForm';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { UserPageVO } from '@/api/user.api';

export default function UserManagementPage() {
  // 状态管理
  const [editingUser, setEditingUser] = useState<UserPageVO | null>(null);
  const [viewingUser, setViewingUser] = useState<UserPageVO | null>(null);
  
  // 刷新函数引用
  const refreshUserListRef = useRef<(() => void) | null>(null);

  // 弹窗状态
  const { 
    isOpen: isFormOpen, 
    openModal: openFormModal, 
    closeModal: closeFormModal 
  } = useModal();

  const { 
    openModal: openViewModal, 
    closeModal: closeViewModal 
  } = useModal();

  // 处理新增用户
  const handleAddUser = () => {
    setEditingUser(null);
    openFormModal();
  };

  // 处理编辑用户
  const handleEditUser = (user: UserPageVO) => {
    setEditingUser(user);
    openFormModal();
  };

  // 处理查看用户
  const handleViewUser = (user: UserPageVO) => {
    setViewingUser(user);
    openViewModal();
  };

  // 处理表单成功（编辑后自动刷新，与部门模块统一逻辑）
  const handleFormSuccess = () => {
    // 刷新用户列表
    if (refreshUserListRef.current) {
      refreshUserListRef.current();
    }
  };
  
  // 接收UserList的刷新函数
  const handleRefreshRequest = (refreshFn: () => void) => {
    refreshUserListRef.current = refreshFn;
  };

  return (
    <div className="space-y-6">
      {/* 页面面包屑 */}
      <div className="px-6 pt-6">
        <PageBreadcrumb pageTitle="用户管理" />
      </div>

      {/* 页面内容 */}
      <div>
        {/* 用户列表 溢出滚动和内边距合并到table最外层div */}
        <div className="overflow-x-auto px-6">
          <UserList
            onAdd={handleAddUser}
            onEdit={handleEditUser}
            onView={handleViewUser}
            onRefreshRequest={handleRefreshRequest}
          />
        </div>
      </div>

      {/* 用户表单弹窗 */}
      <UserForm
        visible={isFormOpen}
        onClose={closeFormModal}
        userId={editingUser?.id?.toString()}
        onSuccess={handleFormSuccess}
      />

      {/* 用户详情弹窗 */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                用户详情
              </h3>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">用户名</label>
                <p className="text-gray-900 dark:text-white">{viewingUser.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">昵称</label>
                <p className="text-gray-900 dark:text-white">{viewingUser.nickname}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">邮箱</label>
                <p className="text-gray-900 dark:text-white">{viewingUser.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">手机号</label>
                <p className="text-gray-900 dark:text-white">{viewingUser.mobile || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">部门</label>
                <p className="text-gray-900 dark:text-white">{viewingUser.deptName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">角色</label>
                <p className="text-gray-900 dark:text-white">{viewingUser.roleNames || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">状态</label>
                <p className="text-gray-900 dark:text-white">
                  {viewingUser.status === 1 ? '启用' : '禁用'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">创建时间</label>
                <p className="text-gray-900 dark:text-white">
                  {viewingUser.createTime ? new Date(viewingUser.createTime).toLocaleString() : '-'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  closeViewModal();
                  handleEditUser(viewingUser);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                编辑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
