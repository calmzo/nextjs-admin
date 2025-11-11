/**
 * 菜单列表组件
 * 封装菜单管理的核心逻辑和UI
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Badge from '@/components/ui/badge/Badge';
import UserTag from '@/components/ui/badge/UserTag';
import MenuTreeTable from '@/components/ui/tree/MenuTreeTable';
import MenuForm from '@/components/menu/MenuForm';
import Button from '@/components/ui/button/Button';
import { PlusIcon, RefreshIcon, SearchIcon } from '@/icons/index';
import { useMenuTree, useMenuOperations, useMenuOptions } from '@/hooks/useMenu';
import { menuButtonAuth } from '@/utils/permission';
import { useAuthStore } from '@/store/authStore';
import type { MenuNode, MenuTreeTableColumn } from '@/types/menu-tree';
import type { MenuFormData, MenuQueryParams } from '@/api/menu.api';
import { MenuType, convertMenuTypeToString, convertMenuTypeToNumber } from '@/types/menu-tree';

// 表格列配置 - 按照用户要求的顺序
const columns: MenuTreeTableColumn[] = [
  {
    key: 'name',
    title: '菜单名称',
    width: '20%',
  },
  {
    key: 'type',
    title: '类型',
    width: '10%',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render: (value, record) => {
      // 处理字符串或数字类型
      let typeStr: string;
      if (typeof value === 'string') {
        typeStr = value;
      } else {
        typeStr = convertMenuTypeToString(value as string | number);
      }
      
      const typeLabels: Record<string, { label: string; color: 'info' | 'success' | 'warning' }> = {
        'CATALOG': { label: '目录', color: 'info' },
        'MENU': { label: '菜单', color: 'success' },
        'BUTTON': { label: '按钮', color: 'warning' },
        'EXTLINK': { label: '外链', color: 'info' },
      };
      
      const type = typeLabels[typeStr] || { label: '未知', color: 'info' as const };
      return <Badge color={type.color}>{type.label}</Badge>;
    }
  },
  {
    key: 'routeName',
    title: '路由名称',
    width: '12%',
    render: (value) => (
      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
        {(value as string) || '-'}
      </span>
    )
  },
  {
    key: 'routePath',
    title: '路由路径',
    width: '15%',
    render: (value, record) => {
      // 优先使用 routePath，如果没有则使用 path
      const path = value || record.path || '-';
      return (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {(path as string) || '-'}
        </span>
      );
    }
  },
  {
    key: 'component',
    title: '组件路径',
    width: '15%',
    render: (value) => (
      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
        {(value as string) || '-'}
      </span>
    )
  },
  {
    key: 'perm',
    title: '权限标识',
    width: '15%',
    render: (value, record) => {
      const perm = value || record.perm || '-';
      return (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {(perm as string) || '-'}
        </span>
      );
    }
  },
  {
    key: 'status',
    title: '状态',
    width: '8%',
    render: (value) => (
      <UserTag type="status" value={value as number}>
        {value === 1 ? '启用' : '禁用'}
      </UserTag>
    )
  },
  {
    key: 'sort',
    title: '排序',
    width: '8%',
    render: (value) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {value as number}
      </span>
    )
  }
];

// FilterDropdown组件
const FilterDropdown: React.FC<{
  showFilter: boolean;
  setShowFilter: (show: boolean) => void;
  searchParams: MenuQueryParams;
  onInputChange: (field: keyof MenuQueryParams, value: string | number | undefined) => void;
  menuOptions: MenuNode[];
  onApply: () => void;
}> = ({ showFilter, setShowFilter, searchParams, onInputChange, onApply }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setShowFilter]);

  return (
    <div className="relative z-50" ref={ref}>
      <button
        className="shadow-theme-xs flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 sm:w-auto sm:min-w-[100px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        onClick={() => setShowFilter(!showFilter)}
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M14.6537 5.90414C14.6537 4.48433 13.5027 3.33331 12.0829 3.33331C10.6631 3.33331 9.51206 4.48433 9.51204 5.90415M14.6537 5.90414C14.6537 7.32398 13.5027 8.47498 12.0829 8.47498C10.663 8.47498 9.51204 7.32398 9.51204 5.90415M14.6537 5.90414L17.7087 5.90411M9.51204 5.90415L2.29199 5.90411M5.34694 14.0958C5.34694 12.676 6.49794 11.525 7.91777 11.525C9.33761 11.525 10.4886 12.676 10.4886 14.0958M5.34694 14.0958C5.34694 15.5156 6.49794 16.6666 7.91778 16.6666C9.33761 16.6666 10.4886 15.5156 10.4886 14.0958M5.34694 14.0958L2.29199 14.0958M10.4886 14.0958L17.7087 14.0958"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        筛选
      </button>
      {showFilter && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              关键字
            </label>
            <input
              type="text"
              value={searchParams.keywords || ''}
              onChange={(e) => onInputChange('keywords', e.target.value)}
              placeholder="请输入菜单名称..."
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              状态
            </label>
            <select
              value={searchParams.status ?? ''}
              onChange={(e) => onInputChange('status', e.target.value ? parseInt(e.target.value) : undefined)}
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            >
              <option value="" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">全部状态</option>
              <option value={1} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">启用</option>
              <option value={0} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">禁用</option>
            </select>
          </div>
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              菜单类型
            </label>
            <select
              value={searchParams.type ?? ''}
              onChange={(e) => onInputChange('type', e.target.value ? parseInt(e.target.value) : undefined)}
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            >
              <option value="" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">全部类型</option>
              <option value={MenuType.DIRECTORY} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">目录</option>
              <option value={MenuType.MENU} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">菜单</option>
              <option value={MenuType.EXTLINK} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">外链</option>
              <option value={MenuType.BUTTON} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">按钮</option>
            </select>
          </div>
          <button 
            className="bg-brand-500 hover:bg-brand-600 h-10 w-full rounded-lg px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              onApply();
              setShowFilter(false);
            }}
          >
            应用
          </button>
        </div>
      )}
    </div>
  );
};

interface MenuListProps {
  className?: string;
}

export default function MenuList({ className = "" }: MenuListProps) {
  // 状态管理
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<MenuFormData> | undefined>(undefined);
  const [parentMenu, setParentMenu] = useState<MenuNode | undefined>();
  const { userInfo } = useAuthStore();
  const didInit = useRef(false);

  // 权限检查辅助函数
  const checkPermission = useCallback((permissionCheck: () => boolean) => {
    if (userInfo) {
      const hasPermission = permissionCheck();
      return hasPermission;
    }
    const devMode = process.env.NODE_ENV === 'development';
    return devMode;
  }, [userInfo]);
  
  // 搜索相关状态
  const [searchParams, setSearchParams] = useState<MenuQueryParams>({
    keywords: '',
    status: undefined,
    parentId: undefined,
    type: undefined
  });
  const [showFilter, setShowFilter] = useState(false);
  
  // Hooks
  const { 
    data: menuTree, 
    loading: treeLoading, 
    fetchMenuTree, 
    toggleExpanded, 
    setSelectedKeys 
  } = useMenuTree();

  const { 
    options: menuOptions, 
    fetchOptions 
  } = useMenuOptions();

  const { 
    loading: operationLoading, 
    create, 
    update, 
    remove, 
    updateStatus 
  } = useMenuOperations();

  // 初始化数据
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchMenuTree();
    fetchOptions();
  }, [fetchMenuTree, fetchOptions]);

  // 处理节点点击
  const handleNodeClick = useCallback((node: MenuNode) => {
    setSelectedKeys(new Set([node.id]));
  }, [setSelectedKeys]);

  // 处理节点展开/折叠
  const handleNodeToggle = useCallback((node: MenuNode) => {
    toggleExpanded(node.id);
  }, [toggleExpanded]);

  // 处理添加菜单
  const handleAdd = useCallback((parentNode?: MenuNode) => {
    setFormData(undefined);
    setParentMenu(parentNode);
    setFormVisible(true);
  }, []);

  // 处理编辑菜单
  const handleEdit = useCallback((node: MenuNode) => {
    setFormData({
      id: node.id,
      name: node.name,
      path: node.path || node.routePath || '',
      component: node.component,
      icon: node.icon,
      type: typeof node.type === 'string' ? convertMenuTypeToNumber(node.type) : node.type,
      parentId: node.parentId,
      sort: node.sort,
      status: node.status,
      visible: node.visible,
      perm: node.perm
    });
    setParentMenu(undefined);
    setFormVisible(true);
  }, []);

  // 处理查看菜单
  const handleView = useCallback(() => {
    // 查看功能可以在这里实现
  }, []);

  // 处理删除菜单
  const handleDelete = useCallback(async (node: MenuNode) => {
    try {
      await remove(node.id);
      fetchMenuTree(); // 刷新数据
    } catch {
      // 删除失败处理
    }
  }, [remove, fetchMenuTree]);

  // 处理状态切换
  const handleStatusChange = useCallback(async (node: MenuNode, status: number) => {
    try {
      await updateStatus(node.id, status);
      fetchMenuTree(); // 刷新数据
    } catch {
      // 状态更新失败处理
    }
  }, [updateStatus, fetchMenuTree]);

  // 处理表单提交
  const handleFormSubmit = useCallback(async (data: MenuFormData) => {
    try {
      if (data.id) {
        // 更新
        await update(data.id, data);
      } else {
        // 创建
        await create(data);
      }
      setFormVisible(false);
      fetchMenuTree(); // 刷新数据
    } catch {
      // 保存失败处理
    }
  }, [create, update, fetchMenuTree]);

  // 处理搜索
  const handleSearch = useCallback(() => {
    const params: MenuQueryParams = {};
    
    if (searchParams.keywords?.trim()) {
      params.keywords = searchParams.keywords.trim();
    }
    
    if (searchParams.status !== undefined) {
      params.status = searchParams.status;
    }
    
    if (searchParams.type !== undefined) {
      params.type = searchParams.type;
    }
    
    if (searchParams.parentId !== undefined) {
      params.parentId = searchParams.parentId;
    }
    
    fetchMenuTree(params);
  }, [searchParams, fetchMenuTree]);

  // 处理输入变化
  const handleInputChange = useCallback((field: keyof MenuQueryParams, value: string | number | undefined) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 处理回车搜索
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    fetchMenuTree();
  }, [fetchMenuTree]);

  // 处理导出
  const handleExport = useCallback(() => {
    // 这里可以实现导出功能
  }, []);


  // 处理下载
  const handleDownload = useCallback(() => {
    handleExport();
  }, [handleExport]);

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">菜单管理</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">管理系统菜单和权限。</p>
        </div>
        {checkPermission(() => {
          const canSearch = menuButtonAuth.search();
          return canSearch;
        }) && (
          <div className="flex gap-2 sm:items-center sm:justify-end w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-auto">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <SearchIcon className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchParams.keywords || ''}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="搜索菜单..."
                className="shadow-sm focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none sm:w-[300px] sm:min-w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
            <FilterDropdown
              showFilter={showFilter}
              setShowFilter={setShowFilter}
              searchParams={searchParams}
              onInputChange={handleInputChange}
              menuOptions={menuOptions}
              onApply={handleSearch}
            />
            <Button className="bg-brand-500 hover:bg-brand-600 text-white" onClick={handleSearch}>
              <SearchIcon />
              搜索
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshIcon />
              刷新
            </Button>
          </div>
        )}
        <div className="flex gap-2 justify-end w-full sm:w-auto mt-5">
          {handleDownload && checkPermission(() => {
            return menuButtonAuth.export();
          }) && (
            <Button variant="outline" onClick={handleDownload}>
              导出
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.667 13.3333V15.4166C16.667 16.1069 16.1074 16.6666 15.417 16.6666H4.58295C3.89259 16.6666 3.33295 16.1069 3.33295 15.4166V13.3333M10.0013 13.3333L10.0013 3.33325M6.14547 9.47942L9.99951 13.331L13.8538 9.47942" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Button>
          )}
        </div>
      </div>

      {/* 菜单树形表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 表格上方批量操作区域 */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {checkPermission(() => {
            return menuButtonAuth.add();
          }) && (
            <Button onClick={() => handleAdd()}>
              <PlusIcon />
              新增菜单
            </Button>
          )}
        </div>

        <MenuTreeTable
          data={menuTree}
          columns={columns}
          loading={treeLoading}
          defaultExpandedKeys={[]}
          onNodeClick={handleNodeClick}
          onNodeToggle={handleNodeToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onView={handleView}
          onStatusChange={handleStatusChange}
          showCheckbox={false}
          showActions={true}
          showStatusToggle={true}
        />
      </div>

      {/* 菜单表单弹窗 */}
      <MenuForm
        isOpen={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={formData}
        parentMenu={parentMenu}
        loading={operationLoading}
        menuOptions={menuOptions}
      />
    </div>
  );
}

