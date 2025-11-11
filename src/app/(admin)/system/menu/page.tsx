/**
 * 菜单管理页面
 */

"use client";

import React from 'react';
import MenuList from '@/components/menu/MenuList';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function MenuManagementPage() {
  return (
    <div className="space-y-6">
      {/* 页面面包屑 */}
      <div className="px-6 pt-6">
        <PageBreadcrumb pageTitle="菜单管理" />
      </div>

      {/* 菜单列表组件 */}
      <div className="px-6">
        <MenuList />
      </div>
    </div>
  );
}
