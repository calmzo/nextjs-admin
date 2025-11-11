/**
 * 菜单图标渲染组件
 * 根据图标值自动判断类型并渲染对应的图标
 */

"use client";

import React from 'react';
import * as Icons from '@/icons/index';

// SVG 图标映射表 - 将图标名称映射到对应的组件
const svgIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> | { className?: string; style?: React.CSSProperties; title?: string }>> = {
  'plus': Icons.PlusIcon,
  'close': Icons.CloseIcon,
  'box': Icons.BoxIcon,
  'check-circle': Icons.CheckCircleIcon,
  'alert': Icons.AlertIcon,
  'info': Icons.InfoIcon,
  'error': Icons.ErrorIcon,
  'bolt': Icons.BoltIcon,
  'arrow-up': Icons.ArrowUpIcon,
  'arrow-down': Icons.ArrowDownIcon,
  'folder': Icons.FolderIcon,
  'video': Icons.VideoIcon,
  'audio': Icons.AudioIcon,
  'grid': Icons.GridIcon,
  'file': Icons.FileIcon,
  'download': Icons.DownloadIcon,
  'arrow-right': Icons.ArrowRightIcon,
  'group': Icons.GroupIcon,
  'box-line': Icons.BoxIconLine,
  'shooting-star': Icons.ShootingStarIcon,
  'dollar-line': Icons.DollarLineIcon,
  'trash': Icons.TrashBinIcon,
  'angle-up': Icons.AngleUpIcon,
  'angle-down': Icons.AngleDownIcon,
  'pencil': Icons.PencilIcon,
  'check-line': Icons.CheckLineIcon,
  'close-line': Icons.CloseLineIcon,
  'chevron-down': Icons.ChevronDownIcon,
  'chevron-up': Icons.ChevronUpIcon,
  'paper-plane': Icons.PaperPlaneIcon,
  'lock': Icons.LockIcon,
  'envelope': Icons.EnvelopeIcon,
  'user': Icons.UserIcon,
  'user-line': Icons.UserIcon,
  'calendar': Icons.CalenderIcon,
  'calender': Icons.CalenderIcon,
  'eye': Icons.EyeIcon,
  'eye-close': Icons.EyeCloseIcon,
  'time': Icons.TimeIcon,
  'copy': Icons.CopyIcon,
  'chevron-left': Icons.ChevronLeftIcon,
  'user-circle': Icons.UserCircleIcon,
  'task': Icons.TaskIcon,
  'list': Icons.ListIcon,
  'table': Icons.TableIcon,
  'page': Icons.PageIcon,
  'pie-chart': Icons.PieChartIcon,
  'box-cube': Icons.BoxCubeIcon,
  'plug-in': Icons.PlugInIcon,
  'docs': Icons.DocsIcon,
  'mail': Icons.MailIcon,
  'mail-line': Icons.MailIcon,
  'horizontal-dots': Icons.HorizontaLDots,
  'chat': Icons.ChatIcon,
  'more-dot': Icons.MoreDotIcon,
  'ai': Icons.AiIcon,
  'cart': Icons.CartIcon,
  'call': Icons.CallIcon,
  'box-moving': Icons.BoxMoving,
  'box-tapped': Icons.BoxTapped,
  'truck-delivery': Icons.TruckDelivery,
  'export': Icons.ExportIcon,
  'refresh': Icons.RefreshIcon,
  'search': Icons.SearchIcon,
  // 系统菜单常用图标
  'system': Icons.SettingsIcon,
  'menu': Icons.GridIcon,
  'role': Icons.GroupIcon,
  'tree': Icons.FolderIcon,
  'dict': Icons.FileIcon,
  'setting': Icons.BoltIcon,
};

interface MenuIconProps {
  /**
   * 图标值
   * - 支持 el-icon- 前缀的图标（会自动转换为小写 SVG 图标名称）
   * - 例如：el-icon-User -> user
   * - 也可以是直接的 SVG 图标名称
   */
  icon?: string;
  /**
   * 图标大小，默认为 20px（菜单树默认大小）
   */
  size?: number | string;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 图标颜色
   */
  color?: string;
}

/**
 * 获取 SVG 图标名称（处理可能的变体）
 * 将 el-icon- 前缀转换为小写的 SVG 图标名称
 * 注意：数据转换阶段已经处理过，这里作为兜底处理
 */
const getSvgIconName = (icon: string): string => {
  // 移除可能的 "el-icon-" 前缀并转为小写（兜底处理）
  return icon.replace(/^el-icon-/i, '').toLowerCase();
};

const MenuIcon: React.FC<MenuIconProps> = ({
  icon,
  size = 20,
  className = '',
  color,
}) => {
  // 如果没有图标，返回默认图标
  if (!icon) {
    const DefaultIcon = svgIconMap['menu'] || Icons.ListIcon;
    return (
      <DefaultIcon
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          color: color || 'currentColor',
        }}
        className={className}
      />
    );
  }

  // 统一处理图标名称：将 el-icon- 前缀转换为小写的 SVG 图标名称
  // 注意：数据转换阶段已经处理过，这里作为兜底处理
  const svgIconName = getSvgIconName(icon);
  const IconComponent = svgIconMap[svgIconName];
  if (IconComponent) {
    return (
      <IconComponent
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          color: color || 'currentColor',
        }}
        className={className}
      />
    );
  }

  // 如果找不到对应的图标，返回默认图标
  const DefaultIcon = svgIconMap['menu'] || Icons.ListIcon;
  return (
    <DefaultIcon
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        color: color || 'currentColor',
      }}
      className={className}
      title={`Unknown icon: ${icon}`}
    />
  );
};

export default MenuIcon;

