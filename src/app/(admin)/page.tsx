"use client";

import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export default function Ecommerce() {
  const router = useRouter();
  const { isAuthenticated, userInfo, loading } = useAuthStore();

  // 首页登录状态检查和重定向逻辑
  useEffect(() => {
    // 如果正在加载，等待加载完成
    if (loading) {
      return;
    }

    // 如果未认证，重定向到登录页
    if (!isAuthenticated) {
      console.log("🚫 首页检测到用户未认证，重定向到登录页");
      router.push('/signin');
      return;
    }

    // 如果已认证但没有用户信息，尝试获取用户信息
    if (isAuthenticated && !userInfo) {
      console.log("🔄 首页检测到已认证但缺少用户信息，尝试获取");
      useAuthStore.getState().getUserInfo().catch((error) => {
        console.error("获取用户信息失败:", error);
        // 如果获取用户信息失败，清除认证状态并重定向
        useAuthStore.getState().clearSession();
        router.push('/signin');
      });
    }
  }, [isAuthenticated, userInfo, loading, router]);

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

  // 如果未认证，不渲染内容（会重定向）
  if (!isAuthenticated) {
    return null;
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
