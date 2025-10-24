"use client";
import React, { useEffect } from "react";
import { useSimpleConfirm, simpleConfirmDialog } from "@/hooks/useSimpleConfirm";
import ConfirmDialog from "./ConfirmDialog";

export function SimpleConfirmDialogProvider() {
  const { isOpen, config, loading, showConfirm, close, setLoading } = useSimpleConfirm();

  useEffect(() => {
    // 注册全局函数
    simpleConfirmDialog.setGlobalFunctions(showConfirm, close, setLoading);
  }, [showConfirm, close, setLoading]);

  if (!config) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={close}
      onConfirm={() => {
        if (config?.onConfirm) {
          config.onConfirm();
        }
        close(); // 确认后自动关闭弹窗
      }}
      title={config.title || "确认"}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      type={config.type}
      loading={loading}
      showCancelButton={config.showCancelButton}
    />
  );
}
