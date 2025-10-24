import { simpleConfirmDialog } from "@/hooks/useSimpleConfirm";
import { ConfirmDialogType } from "@/components/ui/ConfirmDialog";

export interface SimpleConfirmOptions {
  title?: string;
  message: string;
  type?: ConfirmDialogType;
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
}

// 简化的确认对话框API
export const simpleConfirm = {
  // 基础确认
  confirm: (message: string, options?: Omit<SimpleConfirmOptions, 'message'>) => {
    return new Promise<boolean>((resolve) => {
      simpleConfirmDialog.showConfirm({
        title: options?.title || "确认",
        message,
        type: options?.type || "warning",
        confirmText: options?.confirmText || "确定",
        cancelText: options?.cancelText || "取消",
        showCancelButton: options?.showCancelButton !== false,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  },

  // 成功确认
  success: (message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      simpleConfirmDialog.showConfirm({
        title: title || "操作成功",
        message,
        type: "success",
        confirmText: "好的",
        showCancelButton: false,
        onConfirm: () => resolve(true),
      });
    });
  },

  // 警告确认
  warning: (message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      simpleConfirmDialog.showConfirm({
        title: title || "警告",
        message,
        type: "warning",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  },

  // 危险确认
  danger: (message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      simpleConfirmDialog.showConfirm({
        title: title || "危险操作",
        message,
        type: "danger",
        confirmText: "我确定",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  },

  // 信息提示
  info: (message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      simpleConfirmDialog.showConfirm({
        title: title || "信息提示",
        message,
        type: "info",
        confirmText: "我知道了",
        showCancelButton: false,
        onConfirm: () => resolve(true),
      });
    });
  },
};

// 导出简化的API
export const confirm = simpleConfirm.confirm;
export const success = simpleConfirm.success;
export const warning = simpleConfirm.warning;
export const danger = simpleConfirm.danger;
export const info = simpleConfirm.info;
