/**
 * 系统菜单相关类型定义
 * 基于Vue项目的菜单接口设计，适配Next.js项目
 */

// 系统菜单项接口
export interface SystemMenuItem {
  name: string;
  path: string;
  component: string;
  redirect?: string | null;
  meta: {
    title: string;
    icon: string;
    hidden: boolean;
    visible?: number; // 0=隐藏, 1=显示
    params?: Record<string, unknown>;
    alwaysShow: boolean;
    keepAlive?: boolean;
  };
  children?: SystemMenuItem[];
}

// 系统菜单API响应接口
export interface SystemMenuResponse {
  menus: SystemMenuItem[];
}

// 菜单权限检查请求
export interface MenuPermissionCheckRequest {
  menuPath: string;
  userId?: number;
  roleId?: number;
}

// 菜单权限检查结果
export interface MenuPermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

// 动态菜单配置
export interface DynamicMenuConfig {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: DynamicMenuConfig[];
  hidden?: boolean;
  keepAlive?: boolean;
  alwaysShow?: boolean;
}
