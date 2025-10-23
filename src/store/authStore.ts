import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Auth } from '@/utils/auth';
import AuthAPI from '@/api/auth.api';
import UserAPI from '@/api/user.api';
import type { UserInfo, LoginFormData } from '@/types/api';

// 认证状态接口
interface AuthState {
  // 状态
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  loading: boolean;
  
  // 方法
  login: (loginData: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<UserInfo>;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
}

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isAuthenticated: false,
      userInfo: null,
      loading: false,

      // 登录方法
      login: async (loginData: LoginFormData) => {
        try {
          set({ loading: true });
          
          // 调用登录API
          const result = await AuthAPI.login(loginData);
          
          // 保存token
          Auth.setTokens(result.accessToken, result.refreshToken, loginData.rememberMe || false);
          
          // 更新状态
          set({ 
            isAuthenticated: true,
            loading: false 
          });
          
          // 获取用户信息
          await get().getUserInfo();
          
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      // 登出方法
      logout: async () => {
        try {
          set({ loading: true });
          
          // 调用登出API
          await AuthAPI.logout();
          
        } catch (error) {
          console.error('登出API调用失败:', error);
        } finally {
          // 清除本地状态和token
          get().clearSession();
        }
      },

      // 获取用户信息
      getUserInfo: async () => {
        try {
          const userInfo = await UserAPI.getInfo();
          
          set({ 
            userInfo,
            isAuthenticated: true 
          });
          
          return userInfo;
        } catch (error) {
          set({ 
            isAuthenticated: false,
            userInfo: null 
          });
          throw error;
        }
      },

      // 清除会话
      clearSession: () => {
        Auth.clearAuth();
        set({ 
          isAuthenticated: false,
          userInfo: null,
          loading: false 
        });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userInfo: state.userInfo,
      }),
    }
  )
);
