"use client";
import { useState, useCallback } from "react";
import { ConfirmDialogType } from "@/components/ui/ConfirmDialog";
import logger from '@/utils/logger';

export interface SimpleConfirmConfig {
  title?: string;
  message: string;
  type?: ConfirmDialogType;
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface SimpleConfirmState {
  isOpen: boolean;
  config: SimpleConfirmConfig | null;
  loading: boolean;
}

export function useSimpleConfirm() {
  const [state, setState] = useState<SimpleConfirmState>({
    isOpen: false,
    config: null,
    loading: false,
  });

  const showConfirm = useCallback((config: SimpleConfirmConfig) => {
    setState({
      isOpen: true,
      config,
      loading: false,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      config: null,
      loading: false,
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  return {
    ...state,
    showConfirm,
    close,
    setLoading,
  };
}

// 创建全局实例
let globalShowConfirm: ((config: SimpleConfirmConfig) => void) | null = null;
let globalClose: (() => void) | null = null;
let globalSetLoading: ((loading: boolean) => void) | null = null;

export const simpleConfirmDialog = {
  setGlobalFunctions: (
    showConfirm: (config: SimpleConfirmConfig) => void,
    close: () => void,
    setLoading: (loading: boolean) => void
  ) => {
    globalShowConfirm = showConfirm;
    globalClose = close;
    globalSetLoading = setLoading;
  },

  showConfirm: (config: SimpleConfirmConfig) => {
    if (globalShowConfirm) {
      globalShowConfirm(config);
    } else {
      logger.warn("Simple confirm dialog not initialized");
    }
  },

  close: () => {
    if (globalClose) {
      globalClose();
    }
  },

  setLoading: (loading: boolean) => {
    if (globalSetLoading) {
      globalSetLoading(loading);
    }
  },
};
