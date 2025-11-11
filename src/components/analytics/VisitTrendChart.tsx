"use client";

import React, { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { LogAPI, type VisitTrendVO } from "@/api/log.api";
import logger from '@/utils/logger';

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function VisitTrendChart() {
  const [dateRange, setDateRange] = useState<7 | 30>(7);
  const [visitTrend, setVisitTrend] = useState<VisitTrendVO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVisitTrend = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (dateRange - 1));

        const data = await LogAPI.getVisitTrend({
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        });
        setVisitTrend(data);
      } catch (error) {
        logger.error("获取访问趋势失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitTrend();
  }, [dateRange]);

  // 格式化完整日期（年-月-日）
  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 计算需要显示的标签数量
  const getLabelDisplayCount = () => {
    return dateRange === 7 ? 4 : 6;
  };

  // 生成间隔显示的日期标签
  const getDateLabels = () => {
    if (!visitTrend?.dates) return [];
    
    const dates = visitTrend.dates;
    const totalCount = dates.length;
    const displayCount = getLabelDisplayCount();
    
    // 计算需要显示的索引位置
    const labels: string[] = new Array(totalCount).fill("");
    
    if (displayCount >= totalCount) {
      // 如果要显示的数量大于等于总数，全部显示
      return dates.map((d) => formatFullDate(d));
    }
    
    // 计算每个标签的索引位置（均匀分布）
    const indices: number[] = [];
    for (let i = 0; i < displayCount; i++) {
      // 使用 Math.round 来确保均匀分布
      const index = Math.round((i * (totalCount - 1)) / (displayCount - 1));
      indices.push(index);
    }
    
    // 去重并排序（防止重复）
    const uniqueIndices = Array.from(new Set(indices)).sort((a, b) => a - b);
    
    // 设置标签
    uniqueIndices.forEach((index) => {
      if (index >= 0 && index < totalCount) {
        labels[index] = formatFullDate(dates[index]);
      }
    });
    
    return labels;
  };

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      markers: {
        size: 4,
      },
      itemMargin: {
        horizontal: 20,
        vertical: 0,
      },
    },
    colors: ["#4080FF", "#67C23A"], // PV 蓝色，UV 绿色
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, dataPointIndex }: { series: number[][]; dataPointIndex: number }) => {
        if (!visitTrend?.dates || dataPointIndex === undefined) {
          return "";
        }
        
        const date = visitTrend.dates[dataPointIndex];
        const fullDate = formatFullDate(date);
        const pvValue = series[0][dataPointIndex] || 0;
        const uvValue = series[1][dataPointIndex] || 0;
        
        return `
          <div style="padding: 8px 12px; background: #fff; color: #000; border-radius: 4px; font-size: 12px; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <div style="margin-bottom: 4px; font-weight: 600;">${fullDate}</div>
            <div style="margin-top: 4px;">
              <span style="color: #4080FF;">●</span> 浏览量(PV): <strong>${pvValue.toLocaleString()}</strong>
            </div>
            <div style="margin-top: 4px;">
              <span style="color: #67C23A;">●</span> 访客数(UV): <strong>${uvValue.toLocaleString()}</strong>
            </div>
          </div>
        `;
      },
    },
    xaxis: {
      type: "category",
      categories: getDateLabels(),
      axisBorder: {
        show: true,
        color: "#000000",
        strokeWidth: 2,
        offsetX: 0,
        offsetY: 0,
      },
      axisTicks: {
        show: true,
        color: "#000000",
        height: 6,
      },
      tooltip: {
        enabled: false,
      },
      labels: {
        formatter: (value: string) => value, // 只显示非空标签
      },
    },
    yaxis: {
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "浏览量(PV)",
      data: visitTrend?.pvList || [],
    },
    {
      name: "访客数(UV)",
      data: visitTrend?.ipList || [],
    },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            访问趋势
          </h3>
          <div className="flex gap-2">
            <button className="h-8 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></button>
            <button className="h-8 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></button>
          </div>
        </div>
        <div className="h-[310px] animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header with title and date range selector */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          访问趋势
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange(7)}
            className={`h-8 rounded px-4 text-sm font-medium transition-colors ${
              dateRange === 7
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            近7天
          </button>
          <button
            onClick={() => setDateRange(30)}
            className={`h-8 rounded px-4 text-sm font-medium transition-colors ${
              dateRange === 30
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            近30天
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div id="visitTrendChart" className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}

