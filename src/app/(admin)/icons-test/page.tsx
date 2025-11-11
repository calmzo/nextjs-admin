"use client";

import React, { useState, useMemo } from 'react';
import * as Icons from '@/icons/index';
import logger from '@/utils/logger';

// 定义所有图标及其名称
const allIcons = [
  { name: 'PlusIcon', component: Icons.PlusIcon, key: 'plus' },
  { name: 'CloseIcon', component: Icons.CloseIcon, key: 'close' },
  { name: 'BoxIcon', component: Icons.BoxIcon, key: 'box' },
  { name: 'CheckCircleIcon', component: Icons.CheckCircleIcon, key: 'check-circle' },
  { name: 'AlertIcon', component: Icons.AlertIcon, key: 'alert' },
  { name: 'InfoIcon', component: Icons.InfoIcon, key: 'info' },
  { name: 'ErrorIcon', component: Icons.ErrorIcon, key: 'error' },
  { name: 'BoltIcon', component: Icons.BoltIcon, key: 'bolt' },
  { name: 'ArrowUpIcon', component: Icons.ArrowUpIcon, key: 'arrow-up' },
  { name: 'ArrowDownIcon', component: Icons.ArrowDownIcon, key: 'arrow-down' },
  { name: 'FolderIcon', component: Icons.FolderIcon, key: 'folder' },
  { name: 'VideoIcon', component: Icons.VideoIcon, key: 'video' },
  { name: 'AudioIcon', component: Icons.AudioIcon, key: 'audio' },
  { name: 'GridIcon', component: Icons.GridIcon, key: 'grid' },
  { name: 'FileIcon', component: Icons.FileIcon, key: 'file' },
  { name: 'DownloadIcon', component: Icons.DownloadIcon, key: 'download' },
  { name: 'ArrowRightIcon', component: Icons.ArrowRightIcon, key: 'arrow-right' },
  { name: 'GroupIcon', component: Icons.GroupIcon, key: 'group' },
  { name: 'BoxIconLine', component: Icons.BoxIconLine, key: 'box-line' },
  { name: 'ShootingStarIcon', component: Icons.ShootingStarIcon, key: 'shooting-star' },
  { name: 'DollarLineIcon', component: Icons.DollarLineIcon, key: 'dollar-line' },
  { name: 'TrashBinIcon', component: Icons.TrashBinIcon, key: 'trash' },
  { name: 'AngleUpIcon', component: Icons.AngleUpIcon, key: 'angle-up' },
  { name: 'AngleDownIcon', component: Icons.AngleDownIcon, key: 'angle-down' },
  { name: 'PencilIcon', component: Icons.PencilIcon, key: 'pencil' },
  { name: 'CheckLineIcon', component: Icons.CheckLineIcon, key: 'check-line' },
  { name: 'CloseLineIcon', component: Icons.CloseLineIcon, key: 'close-line' },
  { name: 'ChevronDownIcon', component: Icons.ChevronDownIcon, key: 'chevron-down' },
  { name: 'ChevronUpIcon', component: Icons.ChevronUpIcon, key: 'chevron-up' },
  { name: 'PaperPlaneIcon', component: Icons.PaperPlaneIcon, key: 'paper-plane' },
  { name: 'LockIcon', component: Icons.LockIcon, key: 'lock' },
  { name: 'EnvelopeIcon', component: Icons.EnvelopeIcon, key: 'envelope' },
  { name: 'UserIcon', component: Icons.UserIcon, key: 'user' },
  { name: 'CalenderIcon', component: Icons.CalenderIcon, key: 'calendar' },
  { name: 'EyeIcon', component: Icons.EyeIcon, key: 'eye' },
  { name: 'EyeCloseIcon', component: Icons.EyeCloseIcon, key: 'eye-close' },
  { name: 'TimeIcon', component: Icons.TimeIcon, key: 'time' },
  { name: 'CopyIcon', component: Icons.CopyIcon, key: 'copy' },
  { name: 'ChevronLeftIcon', component: Icons.ChevronLeftIcon, key: 'chevron-left' },
  { name: 'UserCircleIcon', component: Icons.UserCircleIcon, key: 'user-circle' },
  { name: 'TaskIcon', component: Icons.TaskIcon, key: 'task' },
  { name: 'ListIcon', component: Icons.ListIcon, key: 'list' },
  { name: 'TableIcon', component: Icons.TableIcon, key: 'table' },
  { name: 'PageIcon', component: Icons.PageIcon, key: 'page' },
  { name: 'PieChartIcon', component: Icons.PieChartIcon, key: 'pie-chart' },
  { name: 'BoxCubeIcon', component: Icons.BoxCubeIcon, key: 'box-cube' },
  { name: 'PlugInIcon', component: Icons.PlugInIcon, key: 'plug-in' },
  { name: 'DocsIcon', component: Icons.DocsIcon, key: 'docs' },
  { name: 'MailIcon', component: Icons.MailIcon, key: 'mail' },
  { name: 'HorizontaLDots', component: Icons.HorizontaLDots, key: 'horizontal-dots' },
  { name: 'ChatIcon', component: Icons.ChatIcon, key: 'chat' },
  { name: 'MoreDotIcon', component: Icons.MoreDotIcon, key: 'more-dot' },
  { name: 'AiIcon', component: Icons.AiIcon, key: 'ai' },
  { name: 'CartIcon', component: Icons.CartIcon, key: 'cart' },
  { name: 'CallIcon', component: Icons.CallIcon, key: 'call' },
  { name: 'BoxMoving', component: Icons.BoxMoving, key: 'box-moving' },
  { name: 'BoxTapped', component: Icons.BoxTapped, key: 'box-tapped' },
  { name: 'TruckDelivery', component: Icons.TruckDelivery, key: 'truck-delivery' },
  { name: 'ExportIcon', component: Icons.ExportIcon, key: 'export' },
  { name: 'RefreshIcon', component: Icons.RefreshIcon, key: 'refresh' },
  { name: 'SearchIcon', component: Icons.SearchIcon, key: 'search' },
  { name: 'SettingsIcon', component: Icons.SettingsIcon, key: 'system' },
];

export default function IconsTestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<number>(24);
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

  // 过滤图标
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return allIcons;
    }
    const query = searchQuery.toLowerCase();
    return allIcons.filter(
      icon => 
        icon.name.toLowerCase().includes(query) ||
        icon.key.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 复制图标名称
  const handleCopyIconName = async (iconKey: string) => {
    try {
      await navigator.clipboard.writeText(iconKey);
      setCopiedIcon(iconKey);
      setTimeout(() => setCopiedIcon(null), 2000);
    } catch (err) {
      logger.error('复制失败:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SVG 图标库</h1>
        <p className="text-gray-600 dark:text-gray-400">
          共 {allIcons.length} 个图标，可用于菜单、按钮等组件中
        </p>
      </div>

      {/* 搜索和设置栏 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* 搜索框 */}
          <div className="flex-1 w-full">
            <div className="relative">
              <Icons.SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                style={{ width: '18px', height: '18px' }} />
              <input
                type="text"
                placeholder="搜索图标名称或 key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* 图标大小选择 */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              图标大小:
            </label>
            <div className="flex gap-2">
              {[16, 20, 24, 32, 40, 48].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedSize === size
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 图标网格 */}
      {filteredIcons.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">未找到匹配的图标</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredIcons.map(({ name, component: IconComponent, key }) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 
                       p-4 hover:shadow-md transition-shadow cursor-pointer group
                       hover:border-blue-500 dark:hover:border-blue-400"
              onClick={() => handleCopyIconName(key)}
            >
              {/* 图标展示 */}
              <div className="flex items-center justify-center h-20 mb-3 
                            bg-gray-50 dark:bg-gray-900 rounded-lg">
                <IconComponent
                  style={{
                    width: `${selectedSize}px`,
                    height: `${selectedSize}px`,
                    color: 'currentColor',
                  }}
                  className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                />
              </div>

              {/* 图标信息 */}
              <div className="text-center">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1 truncate" title={name}>
                  {name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={key}>
                  {key}
                </p>
                
                {/* 复制提示 */}
                {copiedIcon === key && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 animate-pulse">
                    ✓ 已复制
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">使用说明</h2>
        <div className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
          <p>• <strong>点击图标卡片</strong> - 复制图标的 key 值到剪贴板</p>
          <p>• <strong>在 MenuIcon 组件中使用</strong> - 直接使用 key 值，例如：`&lt;MenuIcon icon=&quot;user&quot; /&gt;`</p>
          <p>• <strong>直接导入使用</strong> - 从 <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">@/icons</code> 导入图标组件</p>
          <p>• <strong>搜索功能</strong> - 支持按图标名称或 key 值搜索</p>
        </div>
      </div>
    </div>
  );
}

