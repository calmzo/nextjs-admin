import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DynamicRouteConfig } from '@/router/dynamic-route';

// 权限状态接口
interface PermissionState {
  // 状态
  isRoutesLoaded: boolean;
  routes: DynamicRouteConfig[];
  permissions: string[];
  
  // 方法
  setRoutesLoaded: (loaded: boolean) => void;
  setRoutes: (routes: DynamicRouteConfig[]) => void;
  setPermissions: (permissions: string[]) => void;
  resetRouter: () => void;
  clearCache: () => void;
}

// 创建权限状态管理
export const usePermissionStore = create<PermissionState>()(
  persist(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, _get) => ({
      // 初始状态
      isRoutesLoaded: false,
      routes: [],
      permissions: [],

      // 设置路由加载状态
      setRoutesLoaded: (loaded: boolean) => {
        set({ isRoutesLoaded: loaded });
      },

      // 设置路由
      setRoutes: (routes: DynamicRouteConfig[]) => {
        set({ routes });
      },

      // 设置权限
      setPermissions: (permissions: string[]) => {
        set({ permissions });
      },

      // 重置路由
      resetRouter: () => {
        set({ 
          isRoutesLoaded: false,
          routes: [],
          permissions: []
        });
      },

      // 清除缓存
      clearCache: () => {
        if (typeof window !== 'undefined') {
          // 清除权限相关缓存
          localStorage.removeItem('permissions');
          localStorage.removeItem('routes');
          localStorage.removeItem('dict-cache');
        }
        
        set({ 
          isRoutesLoaded: false,
          routes: [],
          permissions: []
        });
      },
    }),
    {
      name: 'permission-storage',
      partialize: (state) => ({
        permissions: state.permissions,
        routes: state.routes,
      }),
    }
  )
);
