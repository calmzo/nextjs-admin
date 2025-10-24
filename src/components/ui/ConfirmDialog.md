# 通用确认对话框组件

## 概述

这是一个通用的确认对话框组件，提供了类似Vue3项目中Element Plus的简单调用方式。支持多种类型（成功、警告、危险、信息）和自定义配置。

## 特性

- 🎨 **多种类型**: 支持 success、warning、danger、info 四种类型
- 🔧 **高度可配置**: 支持自定义标题、消息、按钮文本等
- 🚀 **简单调用**: 提供类似Vue3项目的简化API
- 📱 **响应式设计**: 支持移动端和桌面端
- 🌙 **深色模式**: 支持深色主题
- ⌨️ **键盘支持**: 支持ESC键关闭
- 🔄 **加载状态**: 支持异步操作和加载状态

## 安装和设置

### 1. 在根组件中添加全局提供者

```tsx
// app/layout.tsx
import { SimpleConfirmDialogProvider } from "@/components/ui/SimpleConfirmDialogProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SimpleConfirmDialogProvider />
      </body>
    </html>
  );
}
```

### 2. 使用简化的API

```tsx
import { confirm, success, warning, danger, info } from "@/utils/simpleConfirmDialog";

// 基础确认
const result = await confirm("确定要删除这个项目吗？");

// 成功确认
await success("操作已成功完成！");

// 警告确认
const result = await warning("此操作可能会影响系统性能，确定继续吗？");

// 危险确认
const result = await danger("此操作将永久删除所有数据，无法恢复！");

// 信息提示
await info("系统将在5分钟后进行维护，请保存您的工作。");
```

## 使用方法

### 方法1: 简化API（推荐）

```tsx
import { confirm, success, warning, danger, info } from "@/utils/simpleConfirmDialog";

function MyComponent() {
  const handleDelete = async () => {
    const result = await confirm("确定要删除这个项目吗？");
    if (result) {
      // 用户确认删除
      console.log("删除成功");
    } else {
      // 用户取消删除
      console.log("取消删除");
    }
  };

  const handleSuccess = async () => {
    await success("操作已成功完成！");
  };

  return (
    <button onClick={handleDelete}>删除项目</button>
  );
}
```

### 方法2: 直接使用ConfirmDialog组件

```tsx
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useState } from "react";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    setIsOpen(true);
  };

  const handleConfirm = () => {
    // 执行删除操作
    console.log("删除成功");
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={handleDelete}>删除项目</button>
      
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="确认删除"
        message="确定要删除这个项目吗？此操作不可撤销。"
        type="warning"
      />
    </>
  );
}
```

## API 参考

### 简化API

#### `confirm(message, options?)`
显示基础确认对话框

**参数:**
- `message: string` - 确认消息
- `options?: ConfirmOptions` - 可选配置

**返回值:** `Promise<boolean>` - 用户是否确认

#### `success(message, title?)`
显示成功确认对话框

**参数:**
- `message: string` - 成功消息
- `title?: string` - 可选标题

**返回值:** `Promise<boolean>` - 总是返回true

#### `warning(message, title?)`
显示警告确认对话框

**参数:**
- `message: string` - 警告消息
- `title?: string` - 可选标题

**返回值:** `Promise<boolean>` - 用户是否确认

#### `danger(message, title?)`
显示危险确认对话框

**参数:**
- `message: string` - 危险消息
- `title?: string` - 可选标题

**返回值:** `Promise<boolean>` - 用户是否确认

#### `info(message, title?)`
显示信息确认对话框

**参数:**
- `message: string` - 信息消息
- `title?: string` - 可选标题

**返回值:** `Promise<boolean>` - 总是返回true

### 配置选项

```tsx
interface ConfirmOptions {
  title?: string;           // 对话框标题
  message: string;         // 确认消息
  type?: ConfirmDialogType; // 对话框类型
  confirmText?: string;     // 确认按钮文本
  cancelText?: string;      // 取消按钮文本
  showCancelButton?: boolean; // 是否显示取消按钮
}
```

### 对话框类型

```tsx
type ConfirmDialogType = "warning" | "danger" | "info" | "success";
```

## 样式自定义

组件使用Tailwind CSS，支持以下自定义：

- 背景颜色和透明度
- 图标颜色和大小
- 按钮样式和颜色
- 文字颜色和大小
- 圆角和阴影

## 注意事项

1. **全局提供者**: 使用简化API时，必须在根组件中添加`SimpleConfirmDialogProvider`
2. **异步操作**: 支持异步操作，会自动显示加载状态
3. **键盘支持**: 支持ESC键关闭对话框
4. **响应式**: 在移动端和桌面端都有良好的显示效果
5. **深色模式**: 自动适配深色主题

## 示例

查看 `src/components/example/SimpleConfirmTestExample.tsx` 获取完整的使用示例。
