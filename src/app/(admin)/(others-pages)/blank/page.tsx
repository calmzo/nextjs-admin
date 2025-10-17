import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js 空白页面 | TailAdmin - Next.js 仪表板模板",
  description: "这是 TailAdmin 仪表板模板的 Next.js 空白页面",
};

export default function BlankPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="空白页面" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            卡片标题
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            开始在网格或面板上放置内容，您也可以使用不同的网格组合。请查看仪表板和其他页面
          </p>
        </div>
      </div>
    </div>
  );
}
