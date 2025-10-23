"use client";

import React from "react";
import { toast } from "@/components/common/Toaster";
import ComponentCard from "@/components/common/ComponentCard";
import Toaster from "@/components/common/Toaster";

export default function ToastTestPage() {
  const showSuccessToast = () => {
    toast.success("操作成功！");
  };

  const showErrorToast = () => {
    toast.error("操作失败，请重试！");
  };

  const showInfoToast = () => {
    toast.info("这是一条信息提示", {
      icon: "ℹ️",
    });
  };


  const showLoadingToast = () => {
    const loadingToast = toast.loading("正在处理中...");
    
    // 模拟异步操作
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success("处理完成！");
    }, 3000);
  };

  const showCustomToast = () => {
    toast.custom((t: any) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">!</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                自定义Toast
              </p>
              <p className="mt-1 text-sm text-gray-500">
                这是一个自定义样式的toast提示
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            关闭
          </button>
        </div>
      </div>
    ));
  };

  const showWarningToastCustom = () => {
    toast.warning("警告信息");
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Toast 提示样式测试
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          测试各种类型的toast提示样式和效果
        </p>
      </div>

      {/* 基础Toast测试 */}
      <ComponentCard title="基础Toast测试">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <button
            onClick={showSuccessToast}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            成功提示
          </button>
          <button
            onClick={showErrorToast}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            错误提示
          </button>
          <button
            onClick={showInfoToast}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            信息提示
          </button>
          <button
            onClick={showWarningToastCustom}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            警告提示
          </button>
          <button
            onClick={showLoadingToast}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            加载状态
          </button>
          <button
            onClick={showCustomToast}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            自定义样式
          </button>
        </div>
      </ComponentCard>

      {/* Toast配置说明 */}
      <ComponentCard title="Toast配置说明">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              当前配置
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• <strong>位置:</strong> 页面中间靠上 (top-center, 20%位置)</li>
              <li>• <strong>默认持续时间:</strong> 4秒</li>
              <li>• <strong>成功提示:</strong> 绿色背景，3秒</li>
              <li>• <strong>错误提示:</strong> 红色背景，5秒</li>
              <li>• <strong>加载提示:</strong> 蓝色背景，无限显示</li>
              <li>• <strong>警告提示:</strong> 橙色背景，4秒</li>
              <li>• <strong>间距:</strong> 8px</li>
              <li>• <strong>样式:</strong> 圆角、阴影、边框效果</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              样式特点
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 页面中间靠上位置，更显眼</li>
              <li>• 圆角设计，现代化外观</li>
              <li>• 阴影效果，增强视觉层次</li>
              <li>• 支持深色/浅色主题</li>
              <li>• 平滑的进入/退出动画</li>
              <li>• 可自定义图标和样式</li>
              <li>• 支持手动关闭</li>
            </ul>
          </div>
        </div>
      </ComponentCard>

      {/* 登录错误测试 */}
      <ComponentCard title="登录错误测试">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            模拟登录过程中的各种错误情况
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => toast.error("验证码错误，请重新输入")}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              验证码错误
            </button>
            <button
              onClick={() => toast.error("用户名或密码错误")}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              用户名密码错误
            </button>
            <button
              onClick={() => toast.error("网络连接失败，请检查网络设置")}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              网络错误
            </button>
            <button
              onClick={() => toast.error("服务器错误，请稍后重试")}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              服务器错误
            </button>
          </div>
        </div>
      </ComponentCard>

      {/* 自定义Toaster组件测试 */}
      <ComponentCard title="自定义Toaster组件测试">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            测试自定义Toaster组件的各种配置选项
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                toast.success("使用自定义Toaster组件！");
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              测试自定义组件
            </button>
            <button
              onClick={() => {
                toast.error("自定义组件错误提示");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              测试错误样式
            </button>
          </div>
        </div>
      </ComponentCard>

      {/* Toaster 组件渲染 */}
      <Toaster />
    </div>
  );
}
