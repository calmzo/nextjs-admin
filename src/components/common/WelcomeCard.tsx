import React from "react";
import { FolderIcon, DocsIcon, VideoIcon } from "@/icons";

export default function WelcomeCard() {
  // 获取当前时间并判断上午/下午/晚上
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "上午好";
    } else if (hour < 18) {
      return "下午好";
    } else {
      return "晚上好";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-6">
        {/* 左侧图标区域 */}
        <div className="flex-shrink-0">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-500 text-white">
              {/* 简单的用户图标 */}
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 中间问候语和天气信息 */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {getGreeting()}，系统管理员！
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            今日天气晴朗，气温在15℃至25℃之间，东南风。
          </p>
        </div>

        {/* 右侧快速链接 */}
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className="flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <FolderIcon className="h-5 w-5" />
              <span className="text-sm font-medium">仓库</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <DocsIcon className="h-5 w-5" />
              <span className="text-sm font-medium">文档</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <VideoIcon className="h-5 w-5" />
              <span className="text-sm font-medium">视频</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

