"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Auth } from "@/utils/auth";
import { handleError } from "@/utils/error-handler";

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
  const pathname = usePathname();
  const { isAuthenticated, userInfo, loading } = useAuthStore();
  const redirectingRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  // 确保只在客户端挂载后才进行认证检查，避免 Hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 如果正在加载，等待加载完成
    if (loading) {
      return;
    }

    // 防止重复重定向
    if (redirectingRef.current) {
      return;
    }

    // 检查是否需要认证
    if (requireAuth) {
      // 检查本地token和store状态
      const hasToken = Auth.isLoggedIn();
      
      // 如果已经在登录页，不需要重定向
      if (pathname === redirectTo) {
        return;
      }

      // 如果有 token 但 isAuthenticated 为 false，说明可能正在初始化
      // 等待 AuthInitializer 完成初始化，不要立即跳转
      if (hasToken && !isAuthenticated) {
        // 给 AuthInitializer 一些时间来完成初始化
        // 如果 token 有效，AuthInitializer 会设置 isAuthenticated 为 true
        // 如果 token 无效，request.ts 的拦截器会处理并跳转到登录页
        return;
      }

      // 检查是否已登录（需要同时满足 token 和 isAuthenticated）
      const isLoggedIn = isAuthenticated && hasToken;

      if (!isLoggedIn) {
        redirectingRef.current = true;
        // 保存当前路径作为重定向参数
        const currentPath = pathname + (typeof window !== 'undefined' ? window.location.search : '');
        const redirectUrl = currentPath === '/' || currentPath === redirectTo 
          ? redirectTo 
          : `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        
        // 使用 window.location.href 确保重定向一定会发生；在 jsdom 环境下回退到 router.replace
        if (typeof window !== 'undefined') {
          try {
            window.location.href = redirectUrl;
          } catch {
            router.replace(redirectUrl);
          }
        } else {
          router.replace(redirectUrl);
        }
        return;
      }

      // 如果已登录但没有用户信息，尝试获取用户信息
      // 注意：如果获取失败，request.ts 的拦截器会自动处理（如401时会重定向到登录页）
      // 这里不需要手动重定向，避免在验证身份时重复跳转
      if (isLoggedIn && !userInfo) {
        // 静默获取用户信息，不显示错误提示（request.ts 会处理）
        useAuthStore.getState().getUserInfo().catch((error) => {
          // request.ts 已经处理了错误提示和重定向逻辑，这里只记录日志
          handleError(error, { showToast: false });
          // 不在这里清除会话或重定向，让 request.ts 统一处理
        });
      }
    } else {
      // 如果不需要认证但用户已登录，重定向到首页
      // 但只有在特定页面（如登录页面）才执行重定向
      const hasToken = Auth.isLoggedIn();
      const isAuthPage = pathname === '/signin' || pathname === '/signup' || pathname === '/forgot-password';
      
      if (isAuthenticated && hasToken && isAuthPage) {
        redirectingRef.current = true;
        if (typeof window !== 'undefined') {
          try {
            window.location.href = '/';
          } catch {
            router.replace('/');
          }
        } else {
          router.replace('/');
        }
        return;
      }
    }
  }, [isAuthenticated, userInfo, loading, requireAuth, redirectTo, router, pathname]);

  // 在客户端挂载之前，显示统一的加载状态，避免 Hydration 错误
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载...</p>
        </div>
      </div>
    );
  }

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

  // 如果需要认证但未认证，显示重定向提示而不是白屏
  // 检查本地token和store状态，确保逻辑一致
  if (requireAuth) {
    const hasToken = Auth.isLoggedIn();
    
    // 如果有 token 但 isAuthenticated 为 false，说明可能正在初始化
    // 显示加载状态，等待 AuthInitializer 完成初始化
    if (hasToken && !isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 dark:text-gray-400">正在验证身份...</p>
          </div>
        </div>
      );
    }
    
    const isLoggedIn = isAuthenticated && hasToken;
    
    if (!isLoggedIn) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 dark:text-gray-400">正在重定向到登录页...</p>
          </div>
        </div>
      );
    }
  }

  // 如果不需要认证但已认证，显示重定向提示而不是白屏
  if (!requireAuth && isAuthenticated) {
    const hasToken = Auth.isLoggedIn();
    const isAuthPage = pathname === '/signin' || pathname === '/signup' || pathname === '/forgot-password';
    
    if (hasToken && isAuthPage) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 dark:text-gray-400">正在重定向到首页...</p>
          </div>
        </div>
      );
    }
  }

  // 如果需要认证且已认证，渲染子组件
  if (requireAuth && isAuthenticated) {
    return <>{children}</>;
  }

  // 如果不需要认证且未认证，渲染子组件
  if (!requireAuth && !isAuthenticated) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
