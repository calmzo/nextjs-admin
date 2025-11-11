/**
 * 用户批量操作组件
 */

"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useUserOperations } from '@/hooks/useUser';
import { UserStatus } from '@/api/user.api';
import { toast } from '@/components/common/Toaster';

interface UserBatchOperationsProps {
  selectedUsers: string[];
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function UserBatchOperations({ 
  selectedUsers, 
  onSuccess, 
  onClose 
}: UserBatchOperationsProps) {
  const [visible, setVisible] = useState(false);
  const [operation, setOperation] = useState<'delete' | 'enable' | 'disable' | 'resetPassword'>('delete');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const {
    loading: operationLoading,
    remove,
    updateStatus,
    resetPassword,
  } = useUserOperations();

  // 处理操作
  const handleOperation = async () => {
    if (operation === 'resetPassword') {
      if (!password.trim()) {
        alert('请输入新密码');
        return;
      }
      if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
      }
      if (password.length < 6) {
        alert('密码长度不能少于6位');
        return;
      }
    }

    let success = false;

    switch (operation) {
      case 'delete':
        success = await remove(selectedUsers.map(Number));
        break;
      case 'enable':
        success = await updateStatus(Number(selectedUsers[0]), UserStatus.ENABLED);
        break;
      case 'disable':
        success = await updateStatus(Number(selectedUsers[0]), UserStatus.DISABLED);
        break;
      case 'resetPassword':
        success = await resetPassword(Number(selectedUsers[0]), password);
        if (success) {
          // 显示成功提示，包含新密码
          toast.success(`密码重置成功，新密码是：${password}`);
        }
        break;
    }

    if (success) {
      onSuccess?.();
      handleClose();
    }
  };

  // 处理关闭
  const handleClose = () => {
    setVisible(false);
    setOperation('delete');
    setPassword('');
    setConfirmPassword('');
    onClose?.();
  };

  // 打开批量操作弹窗
  const openBatchOperation = (op: typeof operation) => {
    setOperation(op);
    setVisible(true);
  };

  // 获取操作标题
  const getOperationTitle = () => {
    switch (operation) {
      case 'delete':
        return `批量删除用户 (${selectedUsers.length}个)`;
      case 'enable':
        return `批量启用用户 (${selectedUsers.length}个)`;
      case 'disable':
        return `批量禁用用户 (${selectedUsers.length}个)`;
      case 'resetPassword':
        return `批量重置密码 (${selectedUsers.length}个)`;
      default:
        return '批量操作';
    }
  };

  // 获取操作描述
  const getOperationDescription = () => {
    switch (operation) {
      case 'delete':
        return `确定要删除选中的 ${selectedUsers.length} 个用户吗？此操作不可恢复。`;
      case 'enable':
        return `确定要启用选中的 ${selectedUsers.length} 个用户吗？`;
      case 'disable':
        return `确定要禁用选中的 ${selectedUsers.length} 个用户吗？`;
      case 'resetPassword':
        return `确定要重置选中用户的密码吗？`;
      default:
        return '';
    }
  };

  return (
    <>
      {/* 批量操作按钮 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => openBatchOperation('enable')}
          disabled={selectedUsers.length === 0}
        >
          批量启用
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openBatchOperation('disable')}
          disabled={selectedUsers.length === 0}
        >
          批量禁用
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openBatchOperation('resetPassword')}
          disabled={selectedUsers.length === 0}
        >
          重置密码
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
          onClick={() => openBatchOperation('delete')}
          disabled={selectedUsers.length === 0}
        >
          批量删除
        </Button>
      </div>

      {/* 批量操作确认弹窗 */}
      <Modal
        isOpen={visible}
        onClose={handleClose}
        className="max-w-md mx-4"
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getOperationTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {getOperationDescription()}
          </p>

          {/* 重置密码表单 */}
          {operation === 'resetPassword' && (
            <div className="space-y-4">
              <div>
                <Label required>新密码</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入新密码"
                />
              </div>
              <div>
                <Label required>确认密码</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                />
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={operationLoading}
            >
              取消
            </Button>
            <Button
              onClick={handleOperation}
              disabled={operationLoading}
              className={operation === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
              startIcon={operationLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : undefined}
            >
              {operation === 'delete' ? '删除' : '确认'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
