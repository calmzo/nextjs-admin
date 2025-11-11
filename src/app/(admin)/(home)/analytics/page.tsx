import AcquisitionChannelChart from "@/components/analytics/AcquisitionChannelChart";
import ActiveUsersChart from "@/components/analytics/ActiveUsersChart";
import AnalyticsBarChart from "@/components/analytics/AnalyticsBarChart";
import AnalyticsMetrics from "@/components/analytics/AnalyticsMetrics";
import RecentOrderAnalytics from "@/components/analytics/RecentOrderAnalytics";
import SessionChart from "@/components/analytics/SessionChart";
import TopChannel from "@/components/analytics/TopChannel";
import TopPages from "@/components/analytics/TopPages";
import VisitTrendChart from "@/components/analytics/VisitTrendChart";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import WelcomeCard from "@/components/common/WelcomeCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "数据分析仪表板 | TailAdmin - Next.js 仪表板模板",
  description:
    "这是 TailAdmin - Next.js Tailwind CSS 管理仪表板模板的数据分析仪表板页面",
};

export default function Analytics() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <WelcomeCard />
      </div>
      <div className="col-span-12">
        <AnalyticsMetrics />
      </div>
      <div className="col-span-12">
        <VisitTrendChart />
      </div>
      <div className="col-span-12">
        <AnalyticsBarChart />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TopChannel />
          <TopPages />
        </div>
      </div>
      <div className="col-span-12 xl:col-span-5">
        <ActiveUsersChart />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <AcquisitionChannelChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <SessionChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrderAnalytics />
      </div>
    </div>
  );
}
