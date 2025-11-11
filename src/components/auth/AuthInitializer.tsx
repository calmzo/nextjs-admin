"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Auth } from "@/utils/auth";
import { handleError } from '@/utils/error-handler';

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
          setLoading(true);
          
          // 先设置 isAuthenticated 为 true（基于 token 存在）
          // 这样可以避免 AuthGuard 在初始化期间误判为未登录
          // 如果 token 无效，getUserInfo 会失败并清除状态
          useAuthStore.setState({ isAuthenticated: true });
          
          try {
            // 尝试获取用户信息来验证token有效性
            await getUserInfo();
          } catch (error) {
            // request.ts 已经处理了错误提示，这里只记录日志
            handleError(error, { showToast: false });
            // 如果获取用户信息失败，说明token可能已过期
            // clearSession 会清除 isAuthenticated 状态
            useAuthStore.getState().clearSession();
          } finally {
            setLoading(false);
          }
        } else {
          // 确保未认证状态被正确设置
          useAuthStore.getState().clearSession();
          setLoading(false);
        }
      } catch (error) {
        // request.ts 已经处理了错误提示，这里只记录日志
        handleError(error, { showToast: false });
        setLoading(false);
      }
    };

    // 延迟一点时间确保所有组件都已挂载
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, [getUserInfo, setLoading]);

  // 这个组件不渲染任何内容，只负责初始化
  return null;
}
