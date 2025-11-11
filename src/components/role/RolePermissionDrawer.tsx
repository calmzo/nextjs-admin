/**
 * 角色分配权限抽屉组件
 * 复用用户编辑的样式
 */

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/button/Button';
import MenuTreeSelector from '@/components/role/MenuTreeSelector';
import { RolePageVO, RoleAPI } from '@/api/role.api';
import { getMenuOptions } from '@/api/menu.api';
import { MenuNode } from '@/types/menu-tree';
import { toast } from '@/components/common/Toaster';
import { handleError } from '@/utils/error-handler';

interface RolePermissionDrawerProps {
  /** 是否显示 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 当前角色 */
  role: RolePageVO | null;
  /** 分配成功回调 */
  onSuccess?: () => void;
}

export default function RolePermissionDrawer({
  visible,
  onClose,
  role,
  onSuccess,
}: RolePermissionDrawerProps) {
  // 状态管理
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);

  // 加载菜单树
  useEffect(() => {
    if (visible) {
      setMenuLoading(true);
      getMenuOptions()
        .then((data) => {
          setMenuTree(data);
        })
        .catch((error: unknown) => {
          // request.ts 已经处理了错误提示，这里只记录日志
          handleError(error, { showToast: false });
        })
        .finally(() => {
          setMenuLoading(false);
        });
    }
  }, [visible]);

  // 加载角色已分配的菜单
  useEffect(() => {
    if (visible && role?.id) {
      setLoading(true);
      RoleAPI.getRoleMenuIds(role.id)
        .then((menuIds) => {
          setCheckedKeys(menuIds);
        })
        .catch((error: unknown) => {
          // request.ts 已经处理了错误提示，这里只记录日志
          handleError(error, { showToast: false });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCheckedKeys([]);
    }
  }, [visible, role]);

  // 获取节点的所有父级菜单ID
  const getAllParentIds = useCallback((nodeId: number, menuTree: MenuNode[]): number[] => {
    const parentIds: number[] = [];
    
    const findParent = (nodes: MenuNode[], targetId: number, parentPath: number[] = []): boolean => {
      for (const node of nodes) {
        const currentPath = [...parentPath, node.id];
        if (node.id === targetId) {
          parentIds.push(...parentPath);
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (findParent(node.children, targetId, currentPath)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findParent(menuTree, nodeId);
    return parentIds;
  }, []);

  // 处理提交：自动包含所有选中节点的父级菜单ID
  const handleSubmit = async () => {
    if (!role?.id) {
      return;
    }

    setSubmitting(true);
    try {
      // 获取所有选中节点的父级菜单ID
      const allMenuIds = new Set(checkedKeys);
      
      // 为每个选中的菜单ID添加其所有父级菜单ID
      checkedKeys.forEach(menuId => {
        const parentIds = getAllParentIds(menuId, menuTree);
        parentIds.forEach((parentId: number) => allMenuIds.add(parentId));
      });
      
      // 转换为数组并提交
      const finalMenuIds = Array.from(allMenuIds);
      await RoleAPI.updateRoleMenus(role.id, finalMenuIds);
      toast.success('权限分配成功');
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      // request.ts 已经处理了错误提示，这里只记录日志
      handleError(error, { showToast: false });
    } finally {
      setSubmitting(false);
    }
  };

  // 处理关闭
  const handleClose = () => {
    setCheckedKeys([]);
    onClose();
  };

  // 使用 Portal 将抽屉挂载到 body
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <div className={`fixed inset-0 z-[100000] ${visible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* 遮罩层 */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-500 ease-out z-[100001] ${
          visible ? 'opacity-30' : 'opacity-0'
        }`}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target === e.currentTarget) {
            setTimeout(() => {
              handleClose();
            }, 300);
          }
        }}
      ></div>

      {/* 抽屉内容 */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl sm:w-[600px] bg-white dark:bg-gray-800 shadow-xl 
                   transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform z-[100002] ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 
                   transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-400 
                   dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* 内容区域 */}
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            分配权限
          </h2>

          {/* 角色信息 */}
          {role && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">角色名称</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white mt-1">
                    {role.name}
                  </p>
                </div>
                {role.code && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">角色编码</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white mt-1">
                      {role.code}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 菜单树选择器 */}
          <div>
            <MenuTreeSelector
              data={menuTree}
              checkedKeys={checkedKeys}
              onChange={(keys) => setCheckedKeys(keys)}
              showSearch={true}
              defaultExpandAll={true}
              loading={menuLoading || loading}
              disabled={submitting}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleSubmit}
              disabled={submitting || loading || menuLoading}
            >
              {submitting ? '保存中...' : '保存'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

