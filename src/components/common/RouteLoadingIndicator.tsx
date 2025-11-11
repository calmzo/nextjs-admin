"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";

/**
 * 顶部进度条组件
 */
const TopProgressBar = ({ loading }: { loading: boolean }) => {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 清理之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (loading) {
      // 开始加载时，快速显示进度到 30%
      setProgress(30);
      
      // 模拟进度增长
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 90; // 保持 90% 直到加载完成
          }
          // 缓慢增加进度，每次增加 1-5%
          return prev + Math.random() * 4 + 1;
        });
      }, 150);
    } else {
      // 加载完成，快速到 100% 然后隐藏
      setProgress(100);
      const timer = setTimeout(() => {
        setProgress(0);
      }, 150);
      return () => clearTimeout(timer);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [loading]);

  if (!mounted) {
    return null;
  }

  if (!loading && progress === 0) {
    return null;
  }

  const progressBar = (
    <div 
      className="fixed inset-x-0 top-0 z-[99999] h-1"
      style={{
        pointerEvents: "none",
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 transition-all duration-200 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(59, 130, 246, 0.6)",
        }}
      />
    </div>
  );

  return createPortal(progressBar, document.body);
};

/**
 * 路由加载指示器组件
 * 监听路由变化并显示统一的加载状态
 */
export default function RouteLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const prevPathnameRef = useRef<string>("");
  const prevSearchParamsRef = useRef<string>("");
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 监听全局导航事件（Link 点击和 router.push）
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]");
      
      if (link) {
        const href = link.getAttribute("href");
        // 检查是否是内部链接
        if (href && !href.startsWith("http") && !href.startsWith("mailto:") && !href.startsWith("#")) {
          const currentUrl = `${pathname}${searchParams ? `?${searchParams.toString()}` : ""}`;
          // 如果点击的链接与当前路径不同，立即显示加载
          if (href !== currentUrl && href !== pathname) {
            setIsLoading(true);
          }
        }
      }
    };

    // 监听所有链接点击
    document.addEventListener("click", handleClick, true);
    
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [pathname, searchParams]);

  // 监听路由变化
  useEffect(() => {
    const currentPathname = pathname;
    const currentSearchParams = searchParams?.toString() || "";
    
    // 检查路由是否真的发生了变化
    const pathnameChanged = prevPathnameRef.current !== currentPathname;
    const searchParamsChanged = prevSearchParamsRef.current !== currentSearchParams;
    
    if (pathnameChanged || searchParamsChanged) {
      // 清除之前的超时定时器
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      // 如果之前有路径，说明是路由切换
      if (prevPathnameRef.current) {
        setIsLoading(true);
      }

      // 更新之前的路径和搜索参数
      prevPathnameRef.current = currentPathname;
      prevSearchParamsRef.current = currentSearchParams;

      // 设置加载完成的超时
      // Next.js App Router 会在路由组件加载完成后自动更新 DOM
      // 我们使用一个合理的延迟来隐藏加载指示器
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, 300); // 最小显示时间，避免闪烁
    } else if (!prevPathnameRef.current) {
      // 首次加载
      prevPathnameRef.current = currentPathname;
      prevSearchParamsRef.current = currentSearchParams;
      setIsLoading(true);
      
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, 300);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [pathname, searchParams, router]);

  return <TopProgressBar loading={isLoading} />;
}

