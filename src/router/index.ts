/**
 * 路由系统入口文件
 * 导出所有路由相关的组件、Hook、工具函数等
 */

import type { DynamicRouteConfig } from './dynamic-route';
import type { UserPermissionInfo } from '@/types';
import logger from '@/utils/logger';

// ==================== 动态路由系统 ====================

export {
  // 动态路由生成器
  DynamicRouteGenerator,
  
  // 路由权限验证器
  RoutePermissionValidator,
  
  // 菜单权限过滤器
  MenuPermissionFilter
} from './dynamic-route';

// ==================== 路由守卫组件 ====================

export {
  // 路由守卫组件
  RouteGuard,
  default as RouteGuardComponent,
  
  // 路由守卫Hook
  useRouteGuard,
  
  // 路由守卫工具函数
  RouteGuardUtils
} from './route-guard';

// ==================== 菜单路由组件 ====================

export {
  // 菜单路由组件
  MenuRouter,
  default as MenuRouterComponent,
  
  // 菜单路由Hook
  useMenuRouter,
  
  // 菜单路由工具函数
  MenuRouterUtils
} from './menu-router';

// ==================== 路由缓存系统 ====================

export {
  // 路由缓存管理器
  RouteCacheManager,
  routeCacheManager,
  
  // 菜单缓存管理器
  MenuCacheManager,
  menuCacheManager,
  
  // 权限缓存管理器
  PermissionCacheManager,
  permissionCacheManager,
  
  // 路由缓存Hook
  useRouteCache
} from './route-cache';

// ==================== 路由解析器 ====================

export {
  // 路由解析器类
  RouteParser,
  default as RouteParserClass,
  
  // 创建路由解析器
  createRouteParser,
  
  // 工具函数
  parseUrl,
  buildQueryString,
  parseQueryString
} from './route-parser';

export {
  // 路由解析器 Hook
  useRouteParser,
  default as useRouteParserHook,
  
  // 简化 Hook
  useCurrentRoute,
  useQueryParams,
  usePathParams
} from './use-route-parser';

// ==================== 路由类型定义 ====================

export type {
  // 动态路由配置
  DynamicRouteConfig,
  
  // 路由权限验证结果
  RoutePermissionResult,
  
  // 菜单权限过滤结果
  MenuPermissionFilterResult
} from './dynamic-route';

export type {
  // 路由守卫配置
  RouteGuardConfig,
  
  // 路由守卫Props
  RouteGuardProps,
  
  // 路由守卫状态
  RouteGuardState
} from './route-guard';

export type {
  // 菜单路由配置
  MenuRouteConfig,
  
  // 菜单路由状态
  MenuRouteState,
  
  // 菜单路由Props
  MenuRouterProps
} from './menu-router';

export type {
  // 路由缓存配置
  RouteCacheConfig,
  
  // 路由缓存项
  RouteCacheItem,
  
  // 路由缓存统计
  RouteCacheStats,
  
  // 路由缓存事件
  RouteCacheEvent
} from './route-cache';

export type {
  // 路由参数类型
  RouteParamType,
  
  // 路由参数定义
  RouteParamDef,
  
  // 路由配置
  RouteConfig,
  
  // 解析后的路由参数
  ParsedRouteParams,
  
  // 路由匹配结果
  RouteMatchResult,
  
  // 路由解析器配置
  RouteParserConfig
} from './route-parser';

export type {
  // useRouteParser Hook 配置
  UseRouteParserConfig,
  
  // useRouteParser Hook 返回值
  UseRouteParserReturn
} from './use-route-parser';

// ==================== 路由工具函数 ====================

/**
 * 路由工具函数集合
 */
export const RouteUtils = {
  /**
   * 创建路由配置
   */
  createRouteConfig: (config: Partial<DynamicRouteConfig>) => ({
    path: '',
    name: '',
    title: '',
    permissions: [],
    roles: [],
    hidden: false,
    keepAlive: true,
    meta: {},
    ...config
  }),

  /**
   * 验证路由配置
   */
  validateRouteConfig: (config: Partial<DynamicRouteConfig>): boolean => {
    return !!(config.path && config.name && config.title);
  },

  /**
   * 生成路由键
   */
  generateRouteKey: (path: string, name: string): string => {
    return `${path}_${name}`;
  },

  /**
   * 检查路由权限
   */
  checkRoutePermission: async (path: string, action: string = 'read'): Promise<boolean> => {
    // 暂时未使用 action 参数，保留以备将来实现权限验证时使用
    void action;
    try {
      // 这里需要导入 routePermissionValidator 或者使用其他方式
      // const result = await routePermissionValidator.validateRoutePermission(path, action);
      // return result.hasPermission;
      return true; // 临时返回 true
    } catch (error) {
      logger.error('检查路由权限失败:', error);
      return false;
    }
  },

  /**
   * 过滤路由权限
   */
  filterRoutesByPermission: async (
    routes: DynamicRouteConfig[],
    userPermissions: UserPermissionInfo
  ): Promise<DynamicRouteConfig[]> => {
    // 暂时未使用 userPermissions 参数，保留以备将来实现基于用户权限的过滤时使用
    void userPermissions;
    const filteredRoutes: DynamicRouteConfig[] = [];

    for (const route of routes) {
      const hasPermission = await RouteUtils.checkRoutePermission(route.path, 'read');
      if (hasPermission) {
        filteredRoutes.push(route);
      }
    }

    return filteredRoutes;
  },

  /**
   * 排序路由
   */
  sortRoutes: (routes: DynamicRouteConfig[]): DynamicRouteConfig[] => {
    return routes.sort((a, b) => {
      // 按路径长度排序
      if (a.path.length !== b.path.length) {
        return a.path.length - b.path.length;
      }
      // 按名称排序
      return a.name.localeCompare(b.name);
    });
  },

  /**
   * 构建路由树
   */
  buildRouteTree: (routes: DynamicRouteConfig[]): DynamicRouteConfig[] => {
    const routeMap = new Map<number, DynamicRouteConfig>();
    const rootRoutes: DynamicRouteConfig[] = [];

    // 创建路由映射
    routes.forEach(route => {
      const menuId = typeof route.meta?.menuId === 'number' ? route.meta.menuId : 0;
      routeMap.set(menuId, route);
    });

    // 构建路由树
    routes.forEach(route => {
      const parentId = typeof route.meta?.parentId === 'number' ? route.meta.parentId : undefined;
      if (parentId !== undefined && routeMap.has(parentId)) {
        const parent = routeMap.get(parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(route);
      } else {
        rootRoutes.push(route);
      }
    });

    return rootRoutes;
  }
};

// ==================== 路由常量 ====================

/**
 * 路由常量定义
 */
export const ROUTE_CONSTANTS = {
  // 路由类型
  ROUTE_TYPES: {
    MENU: 'menu',
    BUTTON: 'button',
    DIRECTORY: 'directory'
  },

  // 路由权限动作
  ROUTE_ACTIONS: {
    READ: 'read',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    EXPORT: 'export',
    IMPORT: 'import'
  },

  // 路由模式
  ROUTE_MODES: {
    SHOW: 'show',
    HIDE: 'hide',
    DISABLE: 'disable',
    ENABLE: 'enable'
  },

  // 路由策略
  ROUTE_STRATEGIES: {
    ALL: 'all',
    ANY: 'any',
    NONE: 'none'
  },

  // 默认路由配置
  DEFAULT_ROUTE_CONFIG: {
    hidden: false,
    keepAlive: true,
    permissions: [],
    roles: [],
    meta: {}
  },

  // 路由缓存配置
  DEFAULT_CACHE_CONFIG: {
    enabled: true,
    expireTime: 30 * 60 * 1000, // 30分钟
    maxSize: 1000,
    cleanupInterval: 5 * 60 * 1000, // 5分钟
    persistent: false
  }
} as const;

// ==================== 路由示例 ====================

/**
 * 路由使用示例
 */
export const RouteExamples = {
  /**
   * 基本路由守卫使用
   */
  basicRouteGuard: `
import { RouteGuard } from '@/router';

<RouteGuard
  config={{
    requireAuth: true,
    requirePermission: true,
    permissionAction: 'read',
    redirectTo: '/signin'
  }}
>
  <div>受保护的内容</div>
</RouteGuard>
  `,

  /**
   * 菜单路由使用
   */
  menuRouter: `
import { MenuRouter } from '@/router';

<MenuRouter
  config={{
    enableCache: true,
    cacheExpireTime: 30 * 60 * 1000,
    filterStrategy: 'all'
  }}
  onMenuChange={(menus) => logger.debug('菜单更新:', menus)}
>
  <div>菜单内容</div>
</MenuRouter>
  `,

  /**
   * 路由缓存使用
   */
  routeCache: `
import { useRouteCache } from '@/router';

const { setCache, getCache, hasCache } = useRouteCache({
  enabled: true,
  expireTime: 30 * 60 * 1000
});

// 设置缓存
setCache('user_menus', menuData);

// 获取缓存
const cachedMenus = getCache('user_menus');

// 检查缓存
if (hasCache('user_menus')) {
  // 使用缓存数据
}
  `,

  /**
   * 动态路由生成
   */
  dynamicRoute: `
import { dynamicRouteGenerator } from '@/router';

// 生成动态路由
const routes = await dynamicRouteGenerator.generateDynamicRoutes(userPermissions);

// 使用路由
routes.forEach(route => {
  logger.debug('路由:', route.path, route.title);
});
  `
};

// ==================== 默认导出 ====================

const routerExports = {
  RouteUtils,
  ROUTE_CONSTANTS,
  RouteExamples
};

export default routerExports;
