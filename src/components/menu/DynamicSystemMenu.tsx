/**
 * 动态系统菜单组件
 * 根据API返回的菜单数据动态渲染系统管理菜单
 */

"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon } from '@/icons/index';
import { SystemMenuAPI } from '@/api/system-menu.api';
import type { SystemMenuItem, DynamicMenuConfig } from '@/types/system-menu';
import { convertComponentToPath, isPathMatch } from '@/utils/path-utils';
import MenuIcon from '@/components/menu/MenuIcon';
import logger from '@/utils/logger';

interface DynamicSystemMenuProps {
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  defaultIcon?: React.ReactNode; // 默认图标，如果 API 返回的菜单没有图标则使用此图标
}

// 渲染图标的辅助函数
const renderIcon = (icon?: string): React.ReactNode => {
  return <MenuIcon icon={icon} size={20} />;
};

const DynamicSystemMenu: React.FC<DynamicSystemMenuProps> = ({
  isExpanded,
  isHovered,
  isMobileOpen,
  defaultIcon,
}) => {
  const [systemMenus, setSystemMenus] = useState<SystemMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [subMenuHeight, setSubMenuHeight] = useState<number>(0);
  const subMenuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // 处理子菜单切换
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // 更新子菜单高度
  useEffect(() => {
    if (isOpen && subMenuRef.current) {
      setSubMenuHeight(subMenuRef.current.scrollHeight);
    }
  }, [isOpen, systemMenus]);

  // 检查当前路径是否匹配系统管理子菜单
  const isSystemPath = useCallback((path: string) => {
    return path.startsWith('/system');
  }, []);

  // 检查当前路径是否匹配系统管理菜单，如果匹配则自动打开
  useEffect(() => {
    if (isSystemPath(pathname)) {
      setIsOpen(true);
    }
  }, [pathname, isSystemPath]);

  // 获取系统菜单数据
  const fetchSystemMenus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const menus = await SystemMenuAPI.getRoutes();
      // 确保 menus 是数组
      setSystemMenus(Array.isArray(menus) ? menus : []);
    } catch (err) {
      logger.error('Failed to fetch system menus:', err);
      setError('获取系统菜单失败');
      // 如果API失败，使用默认的系统管理菜单
      setSystemMenus([{
        name: "/system",
        path: "/system",
        component: "Layout",
        redirect: "/system/user",
        meta: {
          title: "系统管理",
          icon: "system",
          hidden: false,
          params: undefined,
          alwaysShow: false
        },
        children: [
          {
            name: "User",
            path: "user",
            component: "system/user/index",
            redirect: null,
            meta: {
              title: "用户管理",
              icon: "el-icon-User",
              hidden: false,
              params: undefined,
              alwaysShow: false,
              keepAlive: true
            }
          },
          {
            name: "Role",
            path: "role",
            component: "system/role/index",
            redirect: null,
            meta: {
              title: "角色管理",
              icon: "role",
              hidden: false,
              params: undefined,
              alwaysShow: false,
              keepAlive: true
            }
          },
          {
            name: "SysMenu",
            path: "menu",
            component: "system/menu/index",
            redirect: null,
            meta: {
              title: "菜单管理",
              icon: "menu",
              hidden: false,
              params: undefined,
              alwaysShow: false,
              keepAlive: true
            }
          },
          {
            name: "Dept",
            path: "dept",
            component: "system/dept/index",
            redirect: null,
            meta: {
              title: "部门管理",
              icon: "tree",
              hidden: false,
              params: undefined,
              alwaysShow: false,
              keepAlive: true
            }
          },
          {
            name: "Dict",
            path: "dict",
            component: "system/dict/index",
            redirect: null,
            meta: {
              title: "字典管理",
              icon: "dict",
              hidden: false,
              params: undefined,
              alwaysShow: false,
              keepAlive: true
            }
          },
          {
            name: "DictItem",
            path: "dict-item",
            component: "system/dict/dict-item",
            redirect: null,
            meta: {
              title: "字典项",
              icon: "",
              hidden: true,
              params: undefined,
              alwaysShow: false,
              keepAlive: true
            }
          },
          {
            name: "Config",
            path: "config",
            component: "system/config/index",
            redirect: null,
            meta: {
              title: "系统配置",
              icon: "setting",
              hidden: false,
              params: undefined,
              alwaysShow: false,
              keepAlive: true
            }
          },
          {
            name: "Notice",
            path: "notice",
            component: "system/notice/index",
            redirect: null,
            meta: {
              title: "通知公告",
              icon: "",
              hidden: false,
              params: undefined,
              alwaysShow: false
            }
          }
        ]
      }]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemMenus();
  }, [fetchSystemMenus]);

  // 转换系统菜单为动态菜单配置 - 使用 useCallback 优化
  const convertToDynamicMenu = useCallback((menu: SystemMenuItem): DynamicMenuConfig | null => {
    // 根据 visible 字段判断是否显示：visible=1 显示，visible=0 隐藏
    // 如果 visible 未定义，则使用 hidden 字段作为后备
    const isVisible = menu.meta.visible !== undefined 
      ? menu.meta.visible === 1 
      : !menu.meta.hidden;
    
    // 如果菜单不可见，返回 null
    if (!isVisible) {
      return null;
    }

    const processChildren = (children?: SystemMenuItem[]): DynamicMenuConfig[] | undefined => {
      if (!children) return undefined;
      
      // 过滤并转换子菜单，只保留 visible=1 的菜单项
      const visibleChildren = children
        .filter(child => {
          // 根据 visible 字段判断：visible=1 显示，visible=0 隐藏
          // 如果 visible 未定义，则使用 hidden 字段作为后备
          return child.meta.visible !== undefined 
            ? child.meta.visible === 1 
            : !child.meta.hidden;
        })
        .map(child => ({
          name: child.meta.title,
          path: convertComponentToPath(child.component),
          // 优先使用 API 返回的图标，如果 API 没有图标则使用传入的默认图标
          icon: child.meta.icon ? renderIcon(child.meta.icon) : (defaultIcon || renderIcon()),
          children: processChildren(child.children),
          hidden: false, // 已经过滤过，所以这里设为 false
          keepAlive: child.meta.keepAlive,
          alwaysShow: child.meta.alwaysShow,
        }));
      
      return visibleChildren.length > 0 ? visibleChildren : undefined;
    };

    // 优先使用 API 返回的图标，如果 API 没有图标则使用传入的默认图标
    const menuIcon = menu.meta.icon ? renderIcon(menu.meta.icon) : (defaultIcon || renderIcon());

    return {
      name: menu.meta.title,
      path: convertComponentToPath(menu.component),
      icon: menuIcon,
      children: processChildren(menu.children),
      hidden: false, // 已经过滤过，所以这里设为 false
      keepAlive: menu.meta.keepAlive,
      alwaysShow: menu.meta.alwaysShow,
    };
  }, [defaultIcon]);

  // 检查路径是否激活
  const isActive = useCallback((path: string) => {
    return isPathMatch(pathname, path);
  }, [pathname]);

  // 使用 useMemo 缓存转换后的菜单配置，避免每次渲染都重新计算
  const dynamicMenus = useMemo(() => {
    return systemMenus
      .map(menu => convertToDynamicMenu(menu))
      .filter((menu): menu is DynamicMenuConfig => menu !== null);
  }, [systemMenus, convertToDynamicMenu]);

  // 渲染菜单项 - 使用 useCallback 优化
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderMenuItem = useCallback((menu: DynamicMenuConfig, _index: number) => {
    const hasChildren = menu.children && menu.children.length > 0;

    if (menu.hidden) {
      return null;
    }

    return (
      <li key={menu.name}>
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className={`menu-item group ${
              isOpen ? "menu-item-active" : "menu-item-inactive"
            } cursor-pointer ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "lg:justify-start"
            }`}
          >
            <span
              className={`${
                isOpen
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }`}
            >
              {menu.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{menu.name}</span>
            )}
            {(isExpanded || isHovered || isMobileOpen) && (
              <ChevronDownIcon
                className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-brand-500" : ""
                }`}
              />
            )}
          </button>
        ) : (
          menu.path && (
            <Link
              href={menu.path}
              className={`menu-item group ${
                isActive(menu.path) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`${
                  isActive(menu.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {menu.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{menu.name}</span>
              )}
            </Link>
          )
        )}

        {hasChildren && (isExpanded || isHovered || isMobileOpen) && (
          <div
            ref={subMenuRef}
            className="overflow-hidden transition-all duration-300"
            style={{
              height: isOpen ? `${subMenuHeight}px` : "0px",
            }}
          >
            <ul className="mt-2 space-y-1 ml-9">
              {menu.children
                ?.filter(subMenu => !subMenu.hidden) // 再次过滤隐藏的子菜单
                .map((subMenu) => (
                <li key={subMenu.name}>
                  <Link
                    href={subMenu.path}
                    className={`menu-dropdown-item ${
                      isActive(subMenu.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                    }`}
                  >
                    <span
                      className={`${
                        isActive(subMenu.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {subMenu.icon}
                    </span>
                    <span>{subMenu.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }, [isOpen, isExpanded, isHovered, isMobileOpen, handleToggle, isActive, subMenuHeight]);

  if (loading) {
    return (
      <li>
        <div className="menu-item group menu-item-inactive">
          <span className="menu-item-icon-inactive">
            <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
          </span>
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="menu-item-text">加载中...</span>
          )}
        </div>
      </li>
    );
  }

  if (error) {
    logger.warn('System menu error:', error);
  }

  return (
    <>
      {dynamicMenus.map((menu, index) => renderMenuItem(menu, index))}
    </>
  );
};

export default DynamicSystemMenu;
