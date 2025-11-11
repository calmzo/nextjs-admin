/**
 * 重置密码弹窗组件
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useUserOperations } from '@/hooks/useUser';
import { toast } from '@/components/common/Toaster';

interface ResetPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  user?: {
    id: number;
    username: string;
    nickname?: string;
  };
  onSuccess?: () => void;
}

export default function ResetPasswordModal({
  visible,
  onClose,
  user,
  onSuccess,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { resetPassword, loading } = useUserOperations();

  // 当弹窗关闭时重置表单
  useEffect(() => {
    if (!visible) {
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [visible]);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!password.trim()) {
      newErrors.password = '新密码不能为空';
    } else if (password.length < 6) {
      newErrors.password = '密码长度不能少于6位';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = '确认密码不能为空';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!validateForm()) {
      return;
    }

    const success = await resetPassword(user.id, password);
    if (success) {
      // 显示成功提示，包含新密码
      toast.success(`密码重置成功，新密码是：${password}`);
      onSuccess?.();
      handleClose();
    }
  };

  // 处理关闭
  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const displayName = user?.nickname || user?.username || '';

  return (
    <Modal
      isOpen={visible}
      onClose={handleClose}
      className="max-w-[500px] p-6 lg:p-8"
    >
      <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        重置密码
      </h4>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        请输入用户【{displayName}】的新密码
      </p>

      <div className="space-y-4">
        {/* 新密码 */}
        <div>
          <Label required>新密码</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors(prev => ({ ...prev, password: '' }));
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="请输入新密码（至少6位）"
            error={!!errors.password}
            disabled={loading}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* 确认密码 */}
        <div>
          <Label required>确认密码</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="请再次输入新密码"
            error={!!errors.confirmPassword}
            disabled={loading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end gap-3 mt-8">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={loading}
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '重置中...' : '确定'}
        </Button>
      </div>
    </Modal>
  );
}

