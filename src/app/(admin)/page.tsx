"use client";

import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Auth } from "@/utils/auth";
import { handleError } from "@/utils/error-handler";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export default function Ecommerce() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userInfo, loading } = useAuthStore();
  const redirectingRef = useRef(false);

  // 首页登录状态检查和重定向逻辑
  useEffect(() => {
    // 如果正在加载，等待加载完成
    if (loading) {
      return;
    }

    // 防止重复重定向
    if (redirectingRef.current) {
      return;
    }

    // 如果已经在登录页，不需要重定向
    if (pathname === '/signin') {
      return;
    }

    // 检查本地token和store状态
    const hasToken = Auth.isLoggedIn();
    const isLoggedIn = isAuthenticated && hasToken;

    // 如果未认证，重定向到登录页
    if (!isLoggedIn) {
      redirectingRef.current = true;
      const currentPath = pathname + (typeof window !== 'undefined' ? window.location.search : '');
      const redirectUrl = currentPath === '/' || currentPath === '/signin'
        ? '/signin'
        : `/signin?redirect=${encodeURIComponent(currentPath)}`;
      
      // 使用 window.location.href 确保重定向一定会发生
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
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
  }, [isAuthenticated, userInfo, loading, router, pathname]);

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载仪表板...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，显示重定向提示而不是白屏
  // 检查本地token和store状态，确保逻辑一致
  const hasToken = Auth.isLoggedIn();
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

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}
