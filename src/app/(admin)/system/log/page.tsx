/**
 * 操作日志管理页面
 */

"use client";

import React from 'react';
import LogList from '@/components/log/LogList';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function LogManagementPage() {
  return (
    <div className="space-y-6">
      {/* 页面面包屑 */}
      <div className="px-6 pt-6">
        <PageBreadcrumb pageTitle="操作日志" />
      </div>

      {/* 页面内容 */}
      <div>
        {/* 日志列表 */}
        <div className="overflow-x-auto px-6">
          <LogList />
        </div>
      </div>
    </div>
  );
}

