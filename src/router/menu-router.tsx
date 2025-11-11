/**
 * 菜单路由组件
 * 提供菜单权限过滤、动态菜单生成、菜单路由管理等功能
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { usePermission } from '@/hooks/usePermission';
import { MenuPermissionFilter, permissionCacheManager } from './dynamic-route';
import { MenuType, PermissionStatus } from '@/types/permission';
import logger from '@/utils/logger';
import type { 
  MenuTreeNode, 
  UserPermissionInfo,
  User,
  Role,
  UserRoleInfo,
  Button,
  Permission,
} from '@/types';
import { DataScope } from '@/types/permission';

// ==================== 菜单路由类型定义 ====================

/**
 * 将菜单路由类型转换为 MenuType 枚举
 */
function convertMenuTypeToEnum(type: 'menu' | 'button' | 'directory'): MenuType {
  switch (type) {
    case 'directory':
      return MenuType.DIRECTORY;
    case 'menu':
      return MenuType.MENU;
    case 'button':
      return MenuType.BUTTON;
    default:
      return MenuType.MENU;
  }
}

/**
 * 将 MenuType 枚举转换为菜单路由类型
 */
function convertMenuTypeFromEnum(menuType: MenuType): 'menu' | 'button' | 'directory' {
  switch (menuType) {
    case MenuType.DIRECTORY:
      return 'directory';
    case MenuType.MENU:
      return 'menu';
    case MenuType.BUTTON:
      return 'button';
    default:
      return 'menu';
  }
}

/**
 * 菜单路由配置
 */
export interface MenuRouteConfig {
  // 菜单ID
  menuId: number;
  // 菜单路径
  path: string;
  // 菜单名称
  name: string;
  // 菜单标题
  title: string;
  // 菜单图标
  icon?: string;
  // 父菜单ID
  parentId?: number;
  // 菜单组件
  component?: string;
  // 菜单类型
  type: 'menu' | 'button' | 'directory';
  // 是否可见
  visible: boolean;
  // 是否激活
  active: boolean;
  // 排序顺序
  sortOrder: number;
  // 子菜单
  children?: MenuRouteConfig[];
  // 菜单权限
  permissions: string[];
  // 菜单角色
  roles: string[];
  // 菜单元信息
  meta?: Record<string, unknown>;
}

/**
 * 菜单路由状态
 */
export interface MenuRouteState {
  // 菜单列表
  menus: MenuRouteConfig[];
  // 过滤后的菜单
  filteredMenus: MenuRouteConfig[];
  // 当前激活的菜单
  activeMenu?: MenuRouteConfig;
  // 面包屑导航
  breadcrumbs: MenuRouteConfig[];
  // 是否加载中
  isLoading: boolean;
  // 错误信息
  error?: string;
  // 菜单统计
  menuStats: {
    total: number;
    visible: number;
    hidden: number;
    active: number;
  };
}

/**
 * 菜单路由Props
 */
export interface MenuRouterProps {
  children: React.ReactNode;
  config?: {
    // 是否启用菜单缓存
    enableCache?: boolean;
    // 缓存过期时间
    cacheExpireTime?: number;
    // 是否启用菜单预加载
    enablePreload?: boolean;
    // 菜单过滤策略
    filterStrategy?: 'all' | 'any' | 'none';
    // 菜单排序策略
    sortStrategy?: 'default' | 'custom';
  };
  onMenuChange?: (menus: MenuRouteConfig[]) => void;
  onMenuError?: (error: Error) => void;
}

// ==================== 菜单路由组件 ====================

/**
 * 菜单路由组件
 */
export const MenuRouter: React.FC<MenuRouterProps> = ({
  children,
  config = {},
  onMenuChange,
  onMenuError
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { userInfo, isAuthenticated } = useAuthStore();
  const permissionHook = usePermission();
  const { isLoading: permissionLoading } = permissionHook;
  
  // 创建菜单权限过滤器实例
  const menuPermissionFilter = useMemo(() => new MenuPermissionFilter(permissionHook), [permissionHook]);

  // 默认配置
  const defaultConfig = {
    enableCache: true,
    cacheExpireTime: 30 * 60 * 1000, // 30分钟
    enablePreload: false,
    filterStrategy: 'all' as const,
    sortStrategy: 'default' as const
  };

  const finalConfig = { ...defaultConfig, ...config };

  // 状态管理
  const [state, setState] = useState<MenuRouteState>({
    menus: [],
    filteredMenus: [],
    activeMenu: undefined,
    breadcrumbs: [],
    isLoading: true,
    menuStats: {
      total: 0,
      visible: 0,
      hidden: 0,
      active: 0
    }
  });

  // ==================== 菜单数据处理 ====================

  /**
   * 加载菜单数据
   */
  const loadMenuData = useCallback(async (): Promise<MenuRouteConfig[]> => {
    try {
      // 检查缓存
      if (finalConfig.enableCache) {
        const cacheKey = `menu_data_${userInfo?.id || 'anonymous'}`;
        const cachedData = permissionCacheManager.getCache(cacheKey);
        if (cachedData && Array.isArray(cachedData)) {
          return cachedData as MenuRouteConfig[];
        }
      }

      // 获取用户权限信息
      if (!userInfo) {
        throw new Error('用户信息不存在');
      }

      // 这里需要调用API获取菜单数据
      // 暂时使用模拟数据
      const mockMenus: MenuRouteConfig[] = [
        {
          menuId: 1,
          path: '/dashboard',
          name: 'dashboard',
          title: '仪表盘',
          icon: 'dashboard',
          type: 'menu',
          visible: true,
          active: false,
          sortOrder: 1,
          permissions: ['dashboard:read'],
          roles: ['admin', 'user'],
          meta: { component: 'Dashboard' }
        },
        {
          menuId: 2,
          path: '/user',
          name: 'user',
          title: '用户管理',
          icon: 'user',
          type: 'menu',
          visible: true,
          active: false,
          sortOrder: 2,
          permissions: ['user:read'],
          roles: ['admin'],
          meta: { component: 'User' },
          children: [
            {
              menuId: 21,
              path: '/user/list',
              name: 'user-list',
              title: '用户列表',
              icon: 'list',
              parentId: 2,
              type: 'menu',
              visible: true,
              active: false,
              sortOrder: 1,
              permissions: ['user:list'],
              roles: ['admin'],
              meta: { component: 'UserList' }
            },
            {
              menuId: 22,
              path: '/user/create',
              name: 'user-create',
              title: '创建用户',
              icon: 'plus',
              parentId: 2,
              type: 'button',
              visible: true,
              active: false,
              sortOrder: 2,
              permissions: ['user:create'],
              roles: ['admin'],
              meta: { component: 'UserCreate' }
            }
          ]
        },
        {
          menuId: 3,
          path: '/permission',
          name: 'permission',
          title: '权限管理',
          icon: 'permission',
          type: 'menu',
          visible: true,
          active: false,
          sortOrder: 3,
          permissions: ['permission:read'],
          roles: ['admin'],
          meta: { component: 'Permission' }
        }
      ];

      // 缓存数据
      if (finalConfig.enableCache) {
        const cacheKey = `menu_data_${userInfo.id}`;
        permissionCacheManager.setCache(cacheKey, mockMenus, finalConfig.cacheExpireTime);
      }

      return mockMenus;
    } catch (error) {
      logger.error('加载菜单数据失败:', error);
      throw error;
    }
  }, [userInfo, finalConfig.enableCache, finalConfig.cacheExpireTime]);

  /**
   * 过滤菜单权限
   */
  const filterMenuPermissions = useCallback(async (
    menus: MenuRouteConfig[]
  ): Promise<MenuRouteConfig[]> => {
    try {
      if (!userInfo) return menus;

      // 转换菜单格式
      const menuTreeNodes: MenuTreeNode[] = menus.map(menu => ({
        id: menu.menuId,
        menuName: menu.title,
        menuKey: menu.name,
        path: menu.path,
        component: menu.component,
        icon: menu.icon,
        parentId: menu.parentId,
        sortOrder: menu.sortOrder,
        menuType: convertMenuTypeToEnum(menu.type),
        visible: menu.visible,
        status: PermissionStatus.ENABLED,
        children: menu.children ? menu.children.map(child => ({
          id: child.menuId,
          menuName: child.title,
          menuKey: child.name,
          path: child.path,
          component: child.component,
          icon: child.icon,
          parentId: child.parentId,
          sortOrder: child.sortOrder,
          menuType: convertMenuTypeToEnum(child.type),
          visible: child.visible,
          status: PermissionStatus.ENABLED,
          children: [],
          permissions: [] as Permission[],
          buttons: [] as Button[],
          hasPermission: false,
          isAccessible: false
        })) : [],
        permissions: [] as Permission[],
        buttons: [] as Button[],
        hasPermission: false,
        isAccessible: false
      }));

      // 创建用户权限信息
      // 将 UserInfo 转换为 User 类型
      const user: User = {
        id: Number(userInfo.id) || 0,
        username: userInfo.username,
        nickname: userInfo.nickname || userInfo.username,
        email: userInfo.email,
        phone: userInfo.phone || '',
        avatar: userInfo.avatar,
        status: PermissionStatus.ENABLED,
        deptId: 0,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      };

      // 将 string[] 转换为 UserRoleInfo[] 类型
      const roles: UserRoleInfo[] = (userInfo.roles || []).map((roleKey, index) => {
        const role: Role = {
          id: index + 1,
          roleName: roleKey,
          roleKey: roleKey,
          description: undefined,
          status: PermissionStatus.ENABLED,
          sortOrder: index,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        };
        
        return {
          id: index + 1,
          userId: Number(userInfo.id) || 0,
          roleId: role.id,
          role,
          assignedBy: 0,
          assignedTime: new Date().toISOString(),
          isActive: true
        };
      });

      const userPermissions: UserPermissionInfo = {
        user,
        roles,
        permissions: [],
        menus: [],
        buttons: [],
        deptPermissions: [],
        dataScope: DataScope.DEPT_AND_CHILD,
        permissionCache: {
          userId: Number(userInfo.id) || 0,
          permissions: [],
          roles: userInfo.roles || [],
          menus: [],
          buttons: [],
          dataScope: DataScope.DEPT_AND_CHILD,
          lastUpdated: new Date().toISOString(),
          expireTime: Date.now() + 30 * 60 * 1000 // 30分钟
        }
      };

      // 过滤菜单权限
      const filterResult = await menuPermissionFilter.filterMenuPermissions(
        menuTreeNodes,
        userPermissions
      );

      // 转换回菜单配置格式
      const filteredMenus = filterResult.filteredMenus.map(menu => ({
        menuId: menu.id,
        path: menu.path,
        name: menu.menuKey,
        title: menu.menuName,
        icon: menu.icon,
        parentId: menu.parentId,
        component: menu.component,
        type: convertMenuTypeFromEnum(menu.menuType),
        visible: menu.visible,
        active: false,
        sortOrder: menu.sortOrder,
        permissions: [],
        roles: [],
        meta: { component: menu.component },
        children: menu.children ? menu.children.map(child => ({
          menuId: child.id,
          path: child.path,
          name: child.menuKey,
          title: child.menuName,
          icon: child.icon,
          parentId: child.parentId,
          component: child.component,
          type: convertMenuTypeFromEnum(child.menuType),
          visible: child.visible,
          active: false,
          sortOrder: child.sortOrder,
          permissions: [],
          roles: [],
          meta: { component: child.component }
        })) : []
      }));

      return filteredMenus;
    } catch (error) {
      logger.error('过滤菜单权限失败:', error);
      throw error;
    }
  }, [userInfo, menuPermissionFilter]);

  /**
   * 排序菜单
   */
  const sortMenus = useCallback((menus: MenuRouteConfig[]): MenuRouteConfig[] => {
    const sortedMenus = [...menus].sort((a, b) => a.sortOrder - b.sortOrder);
    
    // 递归排序子菜单
    return sortedMenus.map(menu => ({
      ...menu,
      children: menu.children ? sortMenus(menu.children) : []
    }));
  }, []);

  /**
   * 设置激活菜单
   */
  const setActiveMenu = useCallback((pathname: string, menus: MenuRouteConfig[]): MenuRouteConfig | undefined => {
    for (const menu of menus) {
      if (menu.path === pathname) {
        return menu;
      }
      if (menu.children) {
        const activeChild = setActiveMenu(pathname, menu.children);
        if (activeChild) {
          return activeChild;
        }
      }
    }
    return undefined;
  }, []);

  /**
   * 生成面包屑导航
   */
  const generateBreadcrumbs = useCallback((activeMenu: MenuRouteConfig, menus: MenuRouteConfig[]): MenuRouteConfig[] => {
    const breadcrumbs: MenuRouteConfig[] = [];
    
    // 查找父菜单
    const findParentMenu = (menuId: number, menuList: MenuRouteConfig[]): MenuRouteConfig | undefined => {
      for (const menu of menuList) {
        if (menu.menuId === menuId) {
          return menu;
        }
        if (menu.children) {
          const found = findParentMenu(menuId, menu.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    // 递归构建面包屑
    const buildBreadcrumb = (menu: MenuRouteConfig) => {
      breadcrumbs.unshift(menu);
      if (menu.parentId) {
        const parentMenu = findParentMenu(menu.parentId, menus);
        if (parentMenu) {
          buildBreadcrumb(parentMenu);
        }
      }
    };

    buildBreadcrumb(activeMenu);
    return breadcrumbs;
  }, []);

  /**
   * 计算菜单统计
   */
  const calculateMenuStats = useCallback((menus: MenuRouteConfig[]): MenuRouteState['menuStats'] => {
    let total = 0;
    let visible = 0;
    let hidden = 0;
    let active = 0;

    const countMenus = (menuList: MenuRouteConfig[]) => {
      for (const menu of menuList) {
        total++;
        if (menu.visible) visible++;
        else hidden++;
        if (menu.active) active++;
        
        if (menu.children) {
          countMenus(menu.children);
        }
      }
    };

    countMenus(menus);
    return { total, visible, hidden, active };
  }, []);

  // ==================== 菜单数据加载 ====================

  /**
   * 加载菜单数据
   */
  const loadMenus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));

      // 加载菜单数据
      const menus = await loadMenuData();
      
      // 过滤菜单权限
      const filteredMenus = await filterMenuPermissions(menus);
      
      // 排序菜单
      const sortedMenus = sortMenus(filteredMenus);
      
      // 设置激活菜单
      const activeMenu = setActiveMenu(pathname, sortedMenus);
      
      // 生成面包屑导航
      const breadcrumbs = activeMenu ? generateBreadcrumbs(activeMenu, sortedMenus) : [];
      
      // 计算菜单统计
      const menuStats = calculateMenuStats(sortedMenus);

      setState(prev => ({
        ...prev,
        menus: sortedMenus,
        filteredMenus: sortedMenus,
        activeMenu,
        breadcrumbs,
        menuStats,
        isLoading: false
      }));

      if (onMenuChange) {
        onMenuChange(sortedMenus);
      }
    } catch (error) {
      const errorObj = error as Error;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj.message
      }));

      if (onMenuError) {
        onMenuError(errorObj);
      }
    }
  }, [
    loadMenuData,
    filterMenuPermissions,
    sortMenus,
    pathname,
    setActiveMenu,
    generateBreadcrumbs,
    calculateMenuStats,
    onMenuChange,
    onMenuError
  ]);

  // ==================== 生命周期处理 ====================

  useEffect(() => {
    if (isAuthenticated && userInfo) {
      loadMenus();
    }
  }, [isAuthenticated, userInfo, loadMenus]);

  // ==================== 菜单操作 ====================
  // 注意：以下函数已定义但当前未使用，保留以备将来使用
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refreshMenus = useCallback(async () => {
    // 清除缓存
    if (finalConfig.enableCache) {
      const cacheKey = `menu_data_${userInfo?.id || 'anonymous'}`;
      permissionCacheManager.clearCache(cacheKey);
    }
    
    await loadMenus();
  }, [loadMenus, userInfo, finalConfig.enableCache]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigateToMenu = useCallback((menu: MenuRouteConfig) => {
    if (menu.path && menu.type === 'menu') {
      router.push(menu.path);
    }
  }, [router]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleMenuActive = useCallback((menuId: number) => {
    setState(prev => {
      const updateMenuActive = (menus: MenuRouteConfig[]): MenuRouteConfig[] => {
        return menus.map(menu => ({
          ...menu,
          active: menu.menuId === menuId ? !menu.active : menu.active,
          children: menu.children ? updateMenuActive(menu.children) : []
        }));
      };

      return {
        ...prev,
        menus: updateMenuActive(prev.menus),
        filteredMenus: updateMenuActive(prev.filteredMenus)
      };
    });
  }, []);

  // ==================== 渲染逻辑 ====================

  /**
   * 渲染内容
   */
  const renderContent = (): React.ReactNode => {
    if (state.isLoading || permissionLoading) {
      return <div>菜单加载中...</div>;
    }

    if (state.error) {
      return <div>菜单加载失败: {state.error}</div>;
    }

    return children;
  };

  return <>{renderContent()}</>;
};

// ==================== 菜单路由Hook ====================

/**
 * 菜单路由Hook
 */
export const useMenuRouter = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, setState] = useState<MenuRouteState>({
    menus: [],
    filteredMenus: [],
    activeMenu: undefined,
    breadcrumbs: [],
    isLoading: true,
    menuStats: {
      total: 0,
      visible: 0,
      hidden: 0,
      active: 0
    }
  });

  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userInfo, isAuthenticated } = useAuthStore();

  /**
   * 加载菜单数据
   */
  const loadMenus = useCallback(async () => {
    // 实现菜单数据加载逻辑
  }, []);

  /**
   * 刷新菜单
   */
  const refreshMenus = useCallback(async () => {
    await loadMenus();
  }, [loadMenus]);

  /**
   * 导航到菜单
   */
  const navigateToMenu = useCallback((menu: MenuRouteConfig) => {
    if (menu.path && menu.type === 'menu') {
      router.push(menu.path);
    }
  }, [router]);

  return {
    state,
    loadMenus,
    refreshMenus,
    navigateToMenu
  };
};

// ==================== 菜单路由工具函数 ====================

/**
 * 菜单路由工具函数
 */
export const MenuRouterUtils = {
  /**
   * 创建菜单配置
   */
  createMenuConfig: (config: Partial<MenuRouteConfig>): MenuRouteConfig => ({
    menuId: 0,
    path: '',
    name: '',
    title: '',
    type: 'menu',
    visible: true,
    active: false,
    sortOrder: 0,
    permissions: [],
    roles: [],
    ...config
  }),

  /**
   * 验证菜单配置
   */
  validateMenuConfig: (config: MenuRouteConfig): boolean => {
    return !!(config.menuId && config.path && config.name && config.title);
  },

  /**
   * 获取菜单路径
   */
  getMenuPath: (menu: MenuRouteConfig): string => {
    return menu.path;
  },

  /**
   * 检查菜单是否激活
   */
  isMenuActive: (menu: MenuRouteConfig, currentPath: string): boolean => {
    return menu.path === currentPath;
  }
};

// ==================== 导出 ====================

export default MenuRouter;
