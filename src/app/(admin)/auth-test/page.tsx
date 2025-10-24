"use client";

import React from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

export default function AuthTestPage() {
  const { isAuthenticated, userInfo, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error("退出登录失败:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">认证状态测试页面</h1>
      
      <div className="space-y-6">
        {/* 认证状态显示 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">当前认证状态</h2>
          <div className="space-y-2">
            <p><strong>登录状态:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                isAuthenticated 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {isAuthenticated ? '已登录' : '未登录'}
              </span>
            </p>
            {userInfo && (
              <>
                <p><strong>用户名:</strong> {userInfo.username}</p>
                <p><strong>邮箱:</strong> {userInfo.email}</p>
                <p><strong>角色:</strong> {userInfo.role}</p>
              </>
            )}
          </div>
        </div>

        {/* 功能测试 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">功能测试</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
              >
                返回首页
              </Button>
              
              <Button
                onClick={() => router.push('/signin')}
                variant="outline"
              >
                访问登录页
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>

        {/* 说明文档 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">认证守卫说明</h2>
          <div className="space-y-2 text-blue-700 dark:text-blue-300">
            <p>✅ <strong>管理后台页面</strong> - 需要认证，未登录时自动跳转到登录页</p>
            <p>✅ <strong>认证页面</strong> - 已登录用户访问时自动跳转到首页</p>
            <p>✅ <strong>首页</strong> - 检查登录状态，未登录时跳转到登录页</p>
            <p>✅ <strong>Token验证</strong> - 自动验证token有效性，过期时清除状态</p>
            <p>✅ <strong>用户信息</strong> - 自动获取和缓存用户信息</p>
          </div>
        </div>
      </div>
    </div>
  );
}
