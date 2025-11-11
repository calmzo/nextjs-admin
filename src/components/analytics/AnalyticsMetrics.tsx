"use client";

import React, { useState, useEffect } from "react";
import { LogAPI, type VisitStatsVO } from "@/api/log.api";
import logger from '@/utils/logger';

const AnalyticsMetrics: React.FC = () => {
  const [visitStats, setVisitStats] = useState<VisitStatsVO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVisitStats = async () => {
      try {
        setLoading(true);
        const data = await LogAPI.getVisitStats();
        setVisitStats(data);
      } catch (error) {
        logger.error("获取访问统计失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitStats();
  }, []);

  // 构建数据数组
  const metricsData = React.useMemo(() => {
    if (!visitStats) {
      return [
        {
          id: 1,
          title: "访客数(UV)",
          value: "0",
          change: "0%",
          totalLabel: "总访客数",
          totalValue: "0",
          dateIndicator: "日",
          dateIndicatorColor: "green",
        },
        {
          id: 2,
          title: "浏览量(PV)",
          value: "0",
          change: "0%",
          totalLabel: "总浏览量",
          totalValue: "0",
          dateIndicator: "日",
          dateIndicatorColor: "blue",
        },
      ];
    }

    // 格式化增长率：如果为负数则保留负号，否则添加正号
    const formatGrowthRate = (rate: string) => {
      if (rate.startsWith("-")) {
        return `${rate}%`;
      }
      return `+${rate}%`;
    };

    return [
      {
        id: 1,
        title: "访客数(UV)",
        value: String(visitStats.todayUvCount),
        change: formatGrowthRate(visitStats.uvGrowthRate),
        totalLabel: "总访客数",
        totalValue: String(visitStats.totalUvCount),
        dateIndicator: "日",
        dateIndicatorColor: "green",
      },
      {
        id: 2,
        title: "浏览量(PV)",
        value: String(visitStats.todayPvCount),
        change: formatGrowthRate(visitStats.pvGrowthRate),
        totalLabel: "总浏览量",
        totalValue: String(visitStats.totalPvCount),
        dateIndicator: "日",
        dateIndicatorColor: "blue",
      },
    ];
  }, [visitStats]);

  const otherMetricsData = [
    {
      id: 3,
      title: "跳出率",
      value: "54%",
      change: "-1.59%",
      direction: "down",
      comparisonText: "较上月",
    },
    {
      id: 4,
      title: "访问时长",
      value: "2m 56s",
      change: "+7%",
      direction: "up",
      comparisonText: "较上月",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="h-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {/* UV and PV Cards - Special Layout */}
      {metricsData.map((item) => {
        const indicatorBgColor =
          item.dateIndicatorColor === "green"
            ? "bg-green-500"
            : "bg-blue-500";

        return (
          <div
            key={item.id}
            className="relative rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                {item.title}
              </p>
              {/* Date Indicator */}
              <div
                className={`flex h-5 w-5 items-center justify-center rounded ${indicatorBgColor} text-xs font-medium text-white`}
              >
                {item.dateIndicator}
              </div>
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col gap-4">
              {/* First Row: Value and Change */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                    {item.value}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.change}
                  </span>
                </div>
              </div>

              {/* Second Row: Total Label and Total Value */}
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.totalLabel}
                </p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {item.totalValue}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Other Metrics - Original Layout */}
      {otherMetricsData.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <p className="text-gray-500 text-theme-sm dark:text-gray-400">
            {item.title}
          </p>
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {item.value}
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`text-xs ${
                  item.direction === "up"
                    ? "text-green-600"
                    : item.direction === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {item.change}
              </span>
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                {item.comparisonText}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsMetrics;
