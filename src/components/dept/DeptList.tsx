/**
 * 部门列表组件
 * 封装部门管理的核心逻辑和UI
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import UserTag from '@/components/ui/badge/UserTag';
import { DeptTreeTable } from '@/components/ui/tree';
import DeptFormModal from '@/components/dept/DeptFormModal';
import Button from '@/components/ui/button/Button';
import { PlusIcon, RefreshIcon, SearchIcon } from '@/icons/index';
import { useDeptTree, useDeptOperations, useDeptOptions } from '@/hooks/useDept';
import { deptButtonAuth } from '@/utils/permission';
import { useAuthStore } from '@/store/authStore';
import type { DeptNode, TreeTableColumn } from '@/types/dept-tree';
import type { DeptQueryParams } from '@/api/dept.api';

// 表格列配置
const columns: TreeTableColumn[] = [
  {
    key: 'name',
    title: '部门名称',
    width: '30%',
  },
  {
    key: 'code',
    title: '部门编号',
    width: '20%',
    render: (value) => (
      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
        {value as string}
      </span>
    )
  },
  {
    key: 'status',
    title: '状态',
    width: '15%',
    render: (value) => {
      const statusValue = value as number;
      return (
        <UserTag type="status" value={statusValue}>
          {statusValue === 1 ? '启用' : '禁用'}
        </UserTag>
      );
    }
  },
  {
    key: 'sort',
    title: '排序',
    width: '15%',
    render: (value) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {value as number}
      </span>
    )
  }
];

// FilterDropdown组件 - 参考ProductListTable
const FilterDropdown: React.FC<{
  showFilter: boolean;
  setShowFilter: (show: boolean) => void;
  searchParams: DeptQueryParams;
  onInputChange: (field: keyof DeptQueryParams, value: DeptQueryParams[keyof DeptQueryParams]) => void;
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
              placeholder="请输入部门名称..."
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

interface DeptListProps {
  className?: string;
}

export default function DeptList({ className = "" }: DeptListProps) {
  // 状态管理
  const [, setSelectedDept] = useState<DeptNode | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [currentDept, setCurrentDept] = useState<DeptNode | null>(null);
  const [parentDept, setParentDept] = useState<DeptNode | undefined>();
  const { userInfo } = useAuthStore();
  const didInit = useRef(false);

  // 权限检查辅助函数，在用户信息未加载时提供fallback
  const checkPermission = useCallback((permissionCheck: () => boolean) => {
    // 如果用户信息已加载，使用真实权限检查
    if (userInfo) {
      const hasPermission = permissionCheck();
      return hasPermission;
    }
    // 如果用户信息未加载，在开发环境中显示按钮（用于调试）
    const devMode = process.env.NODE_ENV === 'development';
    return devMode;
  }, [userInfo]);
  
  // 搜索相关状态
  const [searchParams, setSearchParams] = useState<DeptQueryParams>({
    keywords: '',
    status: undefined,
    parentId: undefined
  });
  const [showFilter, setShowFilter] = useState(false);
  

  // Hooks
  const { 
    data: deptTree, 
    loading: treeLoading, 
    fetchDeptTree, 
    toggleExpanded, 
    setSelectedKeys 
  } = useDeptTree();

  const { 
    options: deptOptions, 
    fetchOptions 
  } = useDeptOptions();

  const { 
    loading: operationLoading, 
    remove, 
    updateStatus 
  } = useDeptOperations();

  // 初始化数据
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchDeptTree();
    fetchOptions();
  }, [fetchDeptTree, fetchOptions]);

  // 处理节点点击
  const handleNodeClick = useCallback((node: DeptNode) => {
    setSelectedDept(node);
    setSelectedKeys(new Set([node.id]));
  }, [setSelectedKeys]);

  // 处理节点展开/折叠
  const handleNodeToggle = useCallback((node: DeptNode) => {
    toggleExpanded(node.id);
  }, [toggleExpanded]);

  // 处理复选框变化
  const handleCheck = useCallback((keys: number[]) => {
    setCheckedKeys(keys);
  }, []);

  // 处理添加部门
  const handleAdd = useCallback((parentNode?: DeptNode) => {
    setCurrentDept(null);
    setParentDept(parentNode);
    setFormVisible(true);
  }, []);

  // 处理编辑部门
  const handleEdit = useCallback((node: DeptNode) => {
    setCurrentDept(node);
    setParentDept(undefined);
    setFormVisible(true);
  }, []);

  // 处理查看部门
  const handleView = useCallback((node: DeptNode) => {
    setSelectedDept(node);
    // 这里可以打开详情弹窗或跳转到详情页面
  }, []);

  // 处理删除部门
  const handleDelete = useCallback(async (node: DeptNode) => {
    try {
      const response = await remove(node.id);
      if (response) {
        fetchDeptTree(); // 刷新数据
      }
    } catch {
      // 删除失败处理
    }
  }, [remove, fetchDeptTree]);

  // 处理状态切换
  const handleStatusChange = useCallback(async (node: DeptNode, status: number) => {
    try {
      const response = await updateStatus(node.id, status);
      if (response) {
        fetchDeptTree(); // 刷新数据
      }
    } catch {
      // 状态更新失败处理
    }
  }, [updateStatus, fetchDeptTree]);

  // 处理表单提交成功
  const handleFormSuccess = useCallback(() => {
    fetchDeptTree(); // 刷新数据
  }, [fetchDeptTree]);

  // 处理表单关闭
  const handleFormClose = useCallback(() => {
    setFormVisible(false);
    setCurrentDept(null);
    setParentDept(undefined);
  }, []);

  // 处理搜索
  const handleSearch = useCallback(() => {
    const params: DeptQueryParams = {};
    
    if (searchParams.keywords?.trim()) {
      params.keywords = searchParams.keywords.trim();
    }
    
    if (searchParams.status !== undefined) {
      params.status = searchParams.status;
    }
    
    if (searchParams.parentId !== undefined) {
      params.parentId = searchParams.parentId;
    }
    
    fetchDeptTree(params);
  }, [searchParams, fetchDeptTree]);


  // 处理输入变化
  const handleInputChange = useCallback((field: keyof DeptQueryParams, value: DeptQueryParams[keyof DeptQueryParams]) => {
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
    fetchDeptTree();
  }, [fetchDeptTree]);

  // 处理导出
  const handleExport = useCallback(() => {
    // 这里可以实现导出功能
  }, []);

  // 处理批量删除
  const handleBatchDelete = useCallback(async (ids: number[]) => {
    try {
      // 将ID数组转换为逗号分隔的字符串
      const idsString = ids.join(',');
      const response = await remove(idsString);
      if (response) {
        setCheckedKeys([]);
        fetchDeptTree(); // 刷新数据
      }
    } catch {
      // 批量删除失败处理
    }
  }, [remove, fetchDeptTree]);

  
  // 处理下载
  const handleDownload = useCallback(() => {
    handleExport();
  }, [handleExport]);

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">部门管理</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">管理您组织的部门结构和层级关系。</p>
        </div>
        {checkPermission(() => {
          const canSearch = deptButtonAuth.search();
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
                placeholder="搜索部门..."
                className="shadow-sm focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none sm:w-[300px] sm:min-w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
            <FilterDropdown
              showFilter={showFilter}
              setShowFilter={setShowFilter}
              searchParams={searchParams}
              onInputChange={handleInputChange}
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
            return deptButtonAuth.export();
          }) && (
            <Button variant="outline" onClick={handleDownload}>
              导出
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.667 13.3333V15.4166C16.667 16.1069 16.1074 16.6666 15.417 16.6666H4.58295C3.89259 16.6666 3.33295 16.1069 3.33295 15.4166V13.3333M10.0013 13.3333L10.0013 3.33325M6.14547 9.47942L9.99951 13.331L13.8538 9.47942" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Button>
          )}
        </div>
      </div>

      {/* 部门树形表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 表格上方批量操作区域 */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {checkPermission(() => {
            return deptButtonAuth.add();
          }) && (
            <Button onClick={() => handleAdd()}>
              <PlusIcon />
              新增部门
            </Button>
          )}
          {checkPermission(() => {
            return deptButtonAuth.delete();
          }) && (
            <Button
              variant="outline"
              onClick={async () => {
                if (operationLoading || checkedKeys.length === 0) return;
                const confirmed = await import('@/utils/simpleConfirmDialog').then(m => m.simpleConfirm.danger(
                  `确定要删除选中的 ${checkedKeys.length} 个部门吗？删除后无法恢复！`,
                  '确认删除')
                );
                if (!confirmed) return;
                handleBatchDelete(checkedKeys);
              }}
              disabled={checkedKeys.length === 0 || operationLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              批量删除
            </Button>
          )}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            已选择 <span className="font-medium text-gray-800 dark:text-white">{checkedKeys.length}</span> 个部门
          </div>
        </div>

        <DeptTreeTable
          data={deptTree}
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
          showCheckbox={true}
          onCheck={handleCheck}
          checkedKeys={checkedKeys}
          showActions={true}
          showStatusToggle={true}
        />
      </div>

      {/* 部门表单弹窗 - 使用 DeptFormModal */}
      <DeptFormModal
        visible={formVisible}
        dept={currentDept}
        parentDept={parentDept}
        deptOptions={deptOptions}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

    </div>
  );
}
