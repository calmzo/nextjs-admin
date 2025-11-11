"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  
  // Close sidebar on route change (for mobile)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 使用 useCallback 确保函数引用稳定
  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const toggleSubmenu = useCallback((item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  }, []);

  const handleSetIsHovered = useCallback((isHovered: boolean) => {
    setIsHovered(isHovered);
  }, []);

  const handleSetActiveItem = useCallback((item: string | null) => {
    setActiveItem(item);
  }, []);

  // 计算 isExpanded 值（考虑移动端）
  const computedIsExpanded = useMemo(() => {
    return isMobile ? false : isExpanded;
  }, [isMobile, isExpanded]);

  // 使用 useMemo 确保 context value 对象引用稳定，避免不必要的重新渲染
  const contextValue = useMemo(
    () => ({
      isExpanded: computedIsExpanded,
      isMobileOpen,
      isHovered,
      activeItem,
      openSubmenu,
      toggleSidebar,
      toggleMobileSidebar,
      setIsHovered: handleSetIsHovered,
      setActiveItem: handleSetActiveItem,
      toggleSubmenu,
    }),
    [
      computedIsExpanded,
      isMobileOpen,
      isHovered,
      activeItem,
      openSubmenu,
      toggleSidebar,
      toggleMobileSidebar,
      handleSetIsHovered,
      handleSetActiveItem,
      toggleSubmenu,
    ]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};
