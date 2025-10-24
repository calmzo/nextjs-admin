"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Auth } from "@/utils/auth";

/**
 * 认证初始化组件
 * 在应用启动时检查认证状态并初始化用户信息
 * 参考Vue项目的认证初始化逻辑
 */
export default function AuthInitializer() {
  const { getUserInfo, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 检查是否有有效的token
        const hasToken = Auth.isLoggedIn();
        
        if (hasToken) {
          console.log("🔍 检测到有效token，初始化用户信息");
          setLoading(true);
          
          try {
            // 尝试获取用户信息来验证token有效性
            await getUserInfo();
            console.log("✅ 用户信息初始化成功");
          } catch (error) {
            console.error("❌ 用户信息获取失败，清除认证状态:", error);
            // 如果获取用户信息失败，说明token可能已过期
            useAuthStore.getState().clearSession();
          } finally {
            setLoading(false);
          }
        } else {
          console.log("ℹ️ 未检测到有效token");
          setLoading(false);
        }
      } catch (error) {
        console.error("认证初始化失败:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [getUserInfo, setLoading]);

  // 这个组件不渲染任何内容，只负责初始化
  return null;
}
