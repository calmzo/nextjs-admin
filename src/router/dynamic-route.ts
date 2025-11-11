/**
 * 动态路由系统
 * 提供基于权限的路由生成、路由访问控制、菜单权限过滤等功能
 */

import type {
  Menu,
  MenuTreeNode,
  Permission,
  UserPermissionInfo,
  Role,
  Button
} from '@/types';
import type { UsePermissionReturn } from '@/hooks/usePermission';
import { useAuthStore } from '@/store/authStore';
import logger from '@/utils/logger';

// ==================== 动态路由类型定义 ====================

/**
 * 动态路由配置
 */
export interface DynamicRouteConfig {
  // 路由路径
  path: string;
  // 路由名称
  name: string;
  // 路由标题
  title: string;
  // 路由图标
  icon?: string;
  // 父路由ID
  parentId?: number;
  // 路由组件
  component?: string;
  // 路由权限
  permissions: string[];
  // 路由角色
  roles: string[];
  // 是否隐藏
  hidden?: boolean;
  // 是否缓存
  keepAlive?: boolean;
  // 路由元信息
  meta?: Record<string, unknown>;
  // 子路由
  children?: DynamicRouteConfig[];
}

/**
 * 路由权限验证结果
 */
export interface RoutePermissionResult {
  // 是否有权限
  hasPermission: boolean;
  // 权限验证结果
  permissionResult: {
    user: boolean;
    role: boolean;
    menu: boolean;
    button: boolean;
  };
  // 权限验证错误
  error?: string;
  // 权限验证时间
  timestamp: number;
}

/**
 * 菜单权限过滤结果
 */
export interface MenuPermissionFilterResult {
  // 过滤后的菜单
  filteredMenus: MenuTreeNode[];
  // 原始菜单数量
  originalCount: number;
  // 过滤后菜单数量
  filteredCount: number;
  // 过滤统计
  filterStats: {
    hidden: number;
    disabled: number;
    visible: number;
  };
}

// ==================== 动态路由生成器 ====================

/**
 * 动态路由生成器
 */
export class DynamicRouteGenerator {
  private permissionHook: UsePermissionReturn;
  private authStore: unknown;
  private router: unknown;

  constructor(permissionHook: UsePermissionReturn, authStore: unknown, router: unknown) {
    this.permissionHook = permissionHook;
    this.authStore = authStore;
    this.router = router;
  }

  /**
   * 生成动态路由
   */
  async generateDynamicRoutes(
    userPermissions: UserPermissionInfo
  ): Promise<DynamicRouteConfig[]> {
    try {
      const { permissions, menus, buttons } = userPermissions;
      
      // 从 UserMenuPermission 中提取 Menu 对象，过滤掉可能的空值
      const menuList = menus
        .map(ump => ump.menu)
        .filter((menu): menu is Menu => menu !== null && menu !== undefined);
      // 从 UserPermissionDetail 中提取 Permission 对象，过滤掉可能的空值
      const permissionList = permissions
        .map(upd => upd.permission)
        .filter((permission): permission is Permission => permission !== null && permission !== undefined);
      
      // 生成菜单路由
      const menuRoutes = await this.generateMenuRoutes(menuList, permissionList);
      
      // 从 UserButtonPermission 中提取 Button 对象，过滤掉可能的空值
      const buttonList = buttons
        .map(ubp => ubp.button)
        .filter((button): button is Button => button !== null && button !== undefined);
      
      // 生成按钮路由
      const buttonRoutes = await this.generateButtonRoutes(buttonList, permissionList);
      
      // 合并路由
      const allRoutes = [...menuRoutes, ...buttonRoutes];
      
      // 过滤路由权限
      const filteredRoutes = await this.filterRoutesByPermission(allRoutes, userPermissions);
      
      return filteredRoutes;
    } catch (error) {
      logger.error('生成动态路由失败:', error);
      throw error;
    }
  }

  /**
   * 生成菜单路由
   */
  private async generateMenuRoutes(
    menus: Menu[],
    permissions: Permission[]
  ): Promise<DynamicRouteConfig[]> {
    const routes: DynamicRouteConfig[] = [];

    for (const menu of menus) {
      if (menu.menuType === 'menu' && menu.visible) {
        const route: DynamicRouteConfig = {
          path: menu.path,
          name: menu.menuKey,
          title: menu.menuName,
          icon: menu.icon,
          parentId: menu.parentId,
          component: menu.component,
          permissions: this.extractMenuPermissions(menu, permissions),
          roles: this.extractMenuRoles(menu, permissions),
          hidden: !menu.visible,
          keepAlive: true,
          meta: {
            menuId: menu.id,
            menuType: menu.menuType,
            sortOrder: menu.sortOrder
          }
        };

        routes.push(route);
      }
    }

    return routes;
  }

  /**
   * 生成按钮路由
   */
  private async generateButtonRoutes(
    buttons: Button[],
    permissions: Permission[]
  ): Promise<DynamicRouteConfig[]> {
    const routes: DynamicRouteConfig[] = [];

    for (const button of buttons) {
      if (button.status === 'enabled') {
        const route: DynamicRouteConfig = {
          path: `/button/${button.buttonKey}`,
          name: `button_${button.buttonKey}`,
          title: button.buttonName,
          icon: button.icon,
          parentId: button.menuId,
          component: 'ButtonComponent',
          permissions: this.extractButtonPermissions(button, permissions),
          roles: this.extractButtonRoles(button, permissions),
          hidden: false,
          keepAlive: false,
          meta: {
            buttonId: button.id,
            buttonType: button.buttonType,
            menuId: button.menuId
          }
        };

        routes.push(route);
      }
    }

    return routes;
  }

  /**
   * 提取菜单权限
   */
  private extractMenuPermissions(menu: Menu, permissions: Permission[]): string[] {
    return permissions
      .filter(p => p.resourcePath === menu.path)
      .map(p => p.permissionKey);
  }

  /**
   * 提取菜单角色
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractMenuRoles(_menu: Menu, _permissions: Permission[]): string[] {
    // 这里需要根据实际业务逻辑来提取角色
    // 暂时返回空数组
    return [];
  }

  /**
   * 提取按钮权限
   */
  private extractButtonPermissions(button: Button, permissions: Permission[]): string[] {
    return permissions
      .filter(p => p.resourcePath.includes(button.buttonKey))
      .map(p => p.permissionKey);
  }

  /**
   * 提取按钮角色
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractButtonRoles(_button: Button, _permissions: Permission[]): string[] {
    // 这里需要根据实际业务逻辑来提取角色
    // 暂时返回空数组
    return [];
  }

  /**
   * 根据权限过滤路由
   */
  private async filterRoutesByPermission(
    routes: DynamicRouteConfig[],
    userPermissions: UserPermissionInfo
  ): Promise<DynamicRouteConfig[]> {
    const filteredRoutes: DynamicRouteConfig[] = [];

    for (const route of routes) {
      const hasPermission = await this.checkRoutePermission(route, userPermissions);
      
      if (hasPermission) {
        filteredRoutes.push(route);
      }
    }

    return filteredRoutes;
  }

  /**
   * 检查路由权限
   */
  private async checkRoutePermission(
    route: DynamicRouteConfig,
    userPermissions: UserPermissionInfo
  ): Promise<boolean> {
    try {
      const { user, roles, permissions } = userPermissions;

      // 检查用户权限
      const hasUserPermission = this.checkUserPermission(route, user);
      if (!hasUserPermission) return false;

      // 从 UserRoleInfo 中提取 Role 对象，过滤掉可能的空值
      const roleList = roles
        .map(uri => uri.role)
        .filter((role): role is Role => role !== null && role !== undefined);
      // 检查角色权限
      const hasRolePermission = this.checkRolePermission(route, roleList);
      if (!hasRolePermission) return false;

      // 从 UserPermissionDetail 中提取 Permission 对象，过滤掉可能的空值
      const permissionList = permissions
        .map(upd => upd.permission)
        .filter((permission): permission is Permission => permission !== null && permission !== undefined);
      // 检查权限标识
      const hasPermissionKey = this.checkPermissionKey(route, permissionList);
      if (!hasPermissionKey) return false;

      return true;
    } catch (error) {
      logger.error('检查路由权限失败:', error);
      return false;
    }
  }

  /**
   * 检查用户权限
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private checkUserPermission(_route: DynamicRouteConfig, _user: unknown): boolean {
    // 这里需要根据实际业务逻辑来检查用户权限
    // 暂时返回true
    return true;
  }

  /**
   * 检查角色权限
   */
  private checkRolePermission(route: DynamicRouteConfig, roles: Role[]): boolean {
    if (route.roles.length === 0) return true;
    
    const userRoles = roles.map(r => r.roleKey);
    return route.roles.some(role => userRoles.includes(role));
  }

  /**
   * 检查权限标识
   */
  private checkPermissionKey(route: DynamicRouteConfig, permissions: Permission[]): boolean {
    if (route.permissions.length === 0) return true;
    
    const userPermissions = permissions.map(p => p.permissionKey);
    return route.permissions.some(permission => userPermissions.includes(permission));
  }
}

// ==================== 路由权限验证器 ====================

/**
 * 路由权限验证器
 */
export class RoutePermissionValidator {
  private permissionHook: UsePermissionReturn;

  constructor(permissionHook: UsePermissionReturn) {
    this.permissionHook = permissionHook;
  }

  /**
   * 验证路由权限
   */
  async validateRoutePermission(
    routePath: string,
    action: string = 'read'
  ): Promise<RoutePermissionResult> {
    try {
      const startTime = Date.now();
      
      // 获取当前用户信息
      const { userInfo } = useAuthStore.getState();
      if (!userInfo) {
        return {
          hasPermission: false,
          permissionResult: {
            user: false,
            role: false,
            menu: false,
            button: false
          },
          error: '用户未登录',
          timestamp: Date.now()
        };
      }

      // 验证用户权限
      const userPermission = await this.validateUserPermission(Number(userInfo.id), action);
      
      // 验证角色权限
      const rolePermission = await this.validateRolePermission(userInfo.roles || [], action);
      
      // 验证菜单权限
      const menuPermission = await this.validateMenuPermission(routePath, action);
      
      // 验证按钮权限
      const buttonPermission = await this.validateButtonPermission(routePath, action);

      const hasPermission = userPermission && rolePermission && menuPermission && buttonPermission;
      const endTime = Date.now();

      return {
        hasPermission,
        permissionResult: {
          user: userPermission,
          role: rolePermission,
          menu: menuPermission,
          button: buttonPermission
        },
        timestamp: endTime - startTime
      };
    } catch (error) {
      logger.error('路由权限验证失败:', error);
      return {
        hasPermission: false,
        permissionResult: {
          user: false,
          role: false,
          menu: false,
          button: false
        },
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: Date.now()
      };
    }
  }

  /**
   * 验证用户权限
   */
  private async validateUserPermission(userId: number, action: string): Promise<boolean> {
    try {
      const result = await this.permissionHook.checkUserPermission({
        userId,
        resourceType: 'route',
        resourcePath: '',
        action,
        context: { timestamp: Date.now() }
      });
      return result.hasPermission;
    } catch (error) {
      logger.error('用户权限验证失败:', error);
      return false;
    }
  }

  /**
   * 验证角色权限
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async validateRolePermission(_roles: string[], _action: string): Promise<boolean> {
    try {
      // 这里需要根据实际业务逻辑来验证角色权限
      // 暂时返回true
      return true;
    } catch (error) {
      logger.error('角色权限验证失败:', error);
      return false;
    }
  }

  /**
   * 验证菜单权限
   */
  private async validateMenuPermission(routePath: string, action: string): Promise<boolean> {
    try {
      const { userInfo } = useAuthStore.getState();
      if (!userInfo) return false;
      
      const result = await this.permissionHook.checkMenuPermission({
        menuId: 0, // 这里需要根据routePath获取menuId
        userId: Number(userInfo.id),
        action,
        context: { routePath }
      });
      return result.hasPermission;
    } catch (error) {
      logger.error('菜单权限验证失败:', error);
      return false;
    }
  }

  /**
   * 验证按钮权限
   */
  private async validateButtonPermission(routePath: string, action: string): Promise<boolean> {
    try {
      const { userInfo } = useAuthStore.getState();
      if (!userInfo) return false;
      
      const result = await this.permissionHook.checkButtonPermission({
        buttonId: 0, // 这里需要根据routePath获取buttonId
        userId: Number(userInfo.id),
        action,
        context: { routePath }
      });
      return result.hasPermission;
    } catch (error) {
      logger.error('按钮权限验证失败:', error);
      return false;
    }
  }
}

// ==================== 菜单权限过滤器 ====================

/**
 * 菜单权限过滤器
 */
export class MenuPermissionFilter {
  private permissionHook: UsePermissionReturn;

  constructor(permissionHook: UsePermissionReturn) {
    this.permissionHook = permissionHook;
  }

  /**
   * 过滤菜单权限
   */
  async filterMenuPermissions(
    menus: MenuTreeNode[],
    userPermissions: UserPermissionInfo
  ): Promise<MenuPermissionFilterResult> {
    try {
      const originalCount = menus.length;
      const filteredMenus: MenuTreeNode[] = [];
      const filterStats = {
        hidden: 0,
        disabled: 0,
        visible: 0
      };

      for (const menu of menus) {
        const hasPermission = await this.checkMenuPermission(menu, userPermissions);
        
        if (hasPermission) {
          // 递归过滤子菜单
          if (menu.children && menu.children.length > 0) {
            const filteredChildren = await this.filterMenuPermissions(menu.children, userPermissions);
            menu.children = filteredChildren.filteredMenus;
          }
          
          filteredMenus.push(menu);
          filterStats.visible++;
        } else {
          filterStats.hidden++;
        }
      }

      return {
        filteredMenus,
        originalCount,
        filteredCount: filteredMenus.length,
        filterStats
      };
    } catch (error) {
      logger.error('菜单权限过滤失败:', error);
      throw error;
    }
  }

  /**
   * 检查菜单权限
   */
  private async checkMenuPermission(
    menu: MenuTreeNode,
    userPermissions: UserPermissionInfo
  ): Promise<boolean> {
    try {
      const { roles, permissions } = userPermissions;

      // 检查菜单是否可见
      if (!menu.visible) return false;

      // 从 UserPermissionDetail 中提取 Permission 对象，过滤掉可能的空值
      const permissionList = permissions
        .map(upd => upd.permission)
        .filter((permission): permission is Permission => permission !== null && permission !== undefined);
      // 检查菜单权限
      const hasMenuPermission = this.checkMenuPermissionKey(menu, permissionList);
      if (!hasMenuPermission) return false;

      // 从 UserRoleInfo 中提取 Role 对象，过滤掉可能的空值
      const roleList = roles
        .map(uri => uri.role)
        .filter((role): role is Role => role !== null && role !== undefined);
      // 检查角色权限
      const hasRolePermission = this.checkMenuRolePermission(menu, roleList);
      if (!hasRolePermission) return false;

      return true;
    } catch (error) {
      logger.error('检查菜单权限失败:', error);
      return false;
    }
  }

  /**
   * 检查菜单权限标识
   */
  private checkMenuPermissionKey(menu: MenuTreeNode, permissions: Permission[]): boolean {
    if (menu.permissions.length === 0) return true;
    
    const userPermissions = permissions.map(p => p.permissionKey);
    const menuPermissions = menu.permissions.map(p => p.permissionKey);
    return menuPermissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * 检查菜单角色权限
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private checkMenuRolePermission(_menu: MenuTreeNode, _roles: Role[]): boolean {
    // 这里需要根据实际业务逻辑来检查角色权限
    // 暂时返回true
    return true;
  }
}

// ==================== 权限缓存管理器 ====================

/**
 * 权限缓存管理器
 */
export class PermissionCacheManager {
  private cache: Map<string, unknown> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private cacheExpireTime: number = 30 * 60 * 1000; // 30分钟

  /**
   * 设置缓存
   */
  setCache(key: string, value: unknown, expireTime?: number): void {
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
    
    if (expireTime) {
      setTimeout(() => {
        this.clearCache(key);
      }, expireTime);
    }
  }

  /**
   * 获取缓存
   */
  getCache(key: string): unknown {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return null;
    
    if (Date.now() - timestamp > this.cacheExpireTime) {
      this.clearCache(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * 清除缓存
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    } else {
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
  }

  /**
   * 检查缓存是否存在
   */
  hasCache(key: string): boolean {
    return this.cache.has(key) && this.getCache(key) !== null;
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    totalKeys: number;
    expiredKeys: number;
    validKeys: number;
  } {
    const totalKeys = this.cache.size;
    let expiredKeys = 0;
    let validKeys = 0;

    for (const [, timestamp] of this.cacheTimestamps) {
      if (Date.now() - timestamp > this.cacheExpireTime) {
        expiredKeys++;
      } else {
        validKeys++;
      }
    }

    return {
      totalKeys,
      expiredKeys,
      validKeys
    };
  }
}

// ==================== 导出实例 ====================

// 注意：这些实例现在需要在组件中通过依赖注入创建
// 示例：
// const permissionHook = usePermission();
// const authStore = useAuthStore();
// const router = useRouter();
// const dynamicRouteGenerator = new DynamicRouteGenerator(permissionHook, authStore, router);
// const routePermissionValidator = new RoutePermissionValidator(permissionHook);
// const menuPermissionFilter = new MenuPermissionFilter(permissionHook);

export const permissionCacheManager = new PermissionCacheManager();
