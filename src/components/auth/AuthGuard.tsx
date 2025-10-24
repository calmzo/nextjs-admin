"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Auth } from "@/utils/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * 认证守卫组件
 * 参考Vue项目的路由守卫实现
 * 
 * @param children - 子组件
 * @param requireAuth - 是否需要认证，默认为true
 * @param redirectTo - 未认证时重定向的路径，默认为'/signin'
 */
export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/signin' 
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, userInfo, loading } = useAuthStore();

  useEffect(() => {
    // 如果正在加载，等待加载完成
    if (loading) {
      return;
    }

    // 检查是否需要认证
    if (requireAuth) {
      // 检查本地token和store状态
      const hasToken = Auth.isLoggedIn();
      const isLoggedIn = isAuthenticated && hasToken;

      if (!isLoggedIn) {
        console.log("🚫 用户未认证，重定向到登录页");
        // 保存当前路径作为重定向参数
        const currentPath = window.location.pathname;
        const redirectUrl = currentPath === '/' ? redirectTo : `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.push(redirectUrl);
        return;
      }

      // 如果已登录但没有用户信息，尝试获取用户信息
      if (isLoggedIn && !userInfo) {
        console.log("🔄 已认证但缺少用户信息，尝试获取用户信息");
        useAuthStore.getState().getUserInfo().catch((error) => {
          console.error("获取用户信息失败:", error);
          // 如果获取用户信息失败，清除认证状态并重定向
          useAuthStore.getState().clearSession();
          router.push(redirectTo);
        });
      }
    } else {
      // 如果不需要认证但用户已登录，重定向到首页
      const hasToken = Auth.isLoggedIn();
      if (isAuthenticated && hasToken) {
        console.log("✅ 用户已登录，重定向到首页");
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, userInfo, loading, requireAuth, redirectTo, router]);

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 如果需要认证但未认证，不渲染子组件
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // 如果不需要认证但已认证，不渲染子组件（会重定向）
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
