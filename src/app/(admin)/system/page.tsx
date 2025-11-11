/**
 * 系统管理首页
 * 重定向到用户管理页面
 */

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SystemPage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到用户管理页面
    router.replace('/system/user');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到用户管理...</p>
      </div>
    </div>
  );
}
