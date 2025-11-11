/**
 * 路径处理工具函数
 * 用于处理菜单路径和路由路径之间的转换
 */

/**
 * 将组件路径转换为路由路径
 * @param component 组件路径，例如: "system/dept/index"
 * @returns 路由路径，例如: "/system/dept"
 */
export function convertComponentToPath(component: string): string {
  if (!component) return '';
  
  // 移除 /index 后缀
  let path = component.replace(/\/index$/, '');
  
  // 确保路径以 / 开头
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  return path;
}

/**
 * 将路由路径转换为组件路径
 * @param path 路由路径，例如: "/system/dept"
 * @returns 组件路径，例如: "system/dept/index"
 */
export function convertPathToComponent(path: string): string {
  if (!path) return '';
  
  // 移除开头的 /
  let component = path.startsWith('/') ? path.slice(1) : path;
  
  // 添加 /index 后缀
  component = component + '/index';
  
  return component;
}

/**
 * 检查路径是否匹配
 * @param currentPath 当前路径
 * @param targetPath 目标路径
 * @returns 是否匹配
 */
export function isPathMatch(currentPath: string, targetPath: string): boolean {
  if (currentPath === targetPath) return true;
  
  // 检查是否是子路径
  if (targetPath === '/system') {
    return currentPath.startsWith('/system');
  }
  
  return currentPath.startsWith(targetPath + '/');
}

/**
 * 获取路径的父级路径
 * @param path 当前路径
 * @returns 父级路径
 */
export function getParentPath(path: string): string {
  if (!path || path === '/') return '/';
  
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  
  return '/' + segments.slice(0, -1).join('/');
}

/**
 * 获取路径的层级深度
 * @param path 路径
 * @returns 层级深度
 */
export function getPathDepth(path: string): number {
  if (!path || path === '/') return 0;
  
  const segments = path.split('/').filter(Boolean);
  return segments.length;
}
