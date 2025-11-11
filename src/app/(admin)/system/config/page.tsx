/**
 * 系统配置管理页面
 */

"use client";

import React from 'react';
import ConfigList from '@/components/config/ConfigList';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function ConfigManagementPage() {
  return (
    <div className="space-y-6">
      {/* 页面面包屑 */}
      <div className="px-6 pt-6">
        <PageBreadcrumb pageTitle="系统配置" />
      </div>

      {/* 页面内容 */}
      <div>
        {/* 配置列表 */}
        <div className="overflow-x-auto px-6">
          <ConfigList />
        </div>
      </div>
    </div>
  );
}
