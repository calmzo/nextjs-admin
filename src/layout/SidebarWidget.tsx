import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        #1 Tailwind CSS 仪表板
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        领先的 Tailwind CSS 管理模板，包含 400+ UI 组件和页面。
      </p>
      <a
        href="https://tailadmin.com/pricing"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        升级到专业版
      </a>
    </div>
  );
}
