import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js 日历 | TailAdmin - Next.js 仪表板模板",
  description:
    "这是 TailAdmin Tailwind CSS 管理仪表板模板的 Next.js 日历页面",
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="日历" />
      <Calendar />
    </div>
  );
}
