/**
 * 部门管理页面
 */

"use client";

import React from 'react';
import DeptList from '@/components/dept/DeptList';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function DeptManagementPage() {
  return (
    <div className="space-y-6">
      {/* 页面面包屑 */}
      <div className="px-6 pt-6">
        <PageBreadcrumb pageTitle="部门管理" />
      </div>

      {/* 部门列表组件 */}
      <div className="px-6">
        <DeptList />
      </div>
    </div>
  );
}