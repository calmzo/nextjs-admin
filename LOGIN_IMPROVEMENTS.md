# 登录页面事件完善总结

## 🎯 改进目标
参考Vue项目的登录页面事件处理逻辑，完善Next.js项目的登录页面事件处理功能。

## ✅ 完成的改进

### 1. 🔒 CapsLock检测功能
- **功能**: 实时检测用户是否开启了大写锁定
- **实现**: 在密码输入框添加`onKeyUp`事件监听
- **用户体验**: 当CapsLock开启时显示警告提示，防止用户输入错误

```typescript
// 检查CapsLock状态
const checkCapsLock = (event: React.KeyboardEvent) => {
  if (event instanceof KeyboardEvent) {
    setIsCapsLock(event.getModifierState("CapsLock"));
  }
};
```

### 2. ⌨️ 键盘事件处理优化
- **功能**: 支持Enter键快速提交表单
- **实现**: 为所有输入框添加`onKeyDown`事件处理
- **用户体验**: 用户可以在任何输入框中按Enter键提交表单

```typescript
// 处理键盘事件
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    handleSubmit(onSubmit)();
  }
};
```

### 3. 🔄 重定向目标解析
- **功能**: 安全解析登录后的重定向目标
- **实现**: 参考Vue项目的`resolveRedirectTarget`函数
- **安全性**: 防止开放重定向攻击，只允许同源重定向

```typescript
// 解析重定向目标
const resolveRedirectTarget = (searchParams: URLSearchParams): string => {
  const defaultPath = "/";
  const rawRedirect = searchParams.get("redirect") || defaultPath;
  
  try {
    // 验证路径是否安全（防止开放重定向攻击）
    const url = new URL(rawRedirect, window.location.origin);
    if (url.origin !== window.location.origin) {
      return defaultPath;
    }
    return url.pathname + url.search;
  } catch {
    return defaultPath;
  }
};
```

### 4. 🚨 增强错误处理
- **功能**: 根据不同的错误类型显示相应的用户友好提示
- **实现**: 创建`handleLoginError`函数处理各种错误场景
- **错误类型**: 
  - Token过期 (A0001)
  - 会话过期 (A0002)
  - 用户名或密码错误 (401)
  - 验证码错误 (403)
  - 登录尝试次数过多 (429)
  - 服务器错误 (500+)

```typescript
// 处理登录错误
const handleLoginError = (error: any) => {
  let errorMessage = "登录失败，请重试";
  
  if (error?.response?.data?.msg) {
    errorMessage = error.response.data.msg;
  } else if (error?.code === "A0001") {
    errorMessage = "Token已过期，请重新登录";
  } else if (error?.code === "A0002") {
    errorMessage = "会话已过期，请重新登录";
  }
  // ... 更多错误处理
  
  toast.error(errorMessage);
};
```

### 5. 📝 表单验证规则完善
- **功能**: 添加严格的表单验证规则和实时反馈
- **实现**: 使用`react-hook-form`的`mode: "onChange"`实现实时验证
- **验证规则**:
  - **用户名**: 2-20字符，只能包含字母、数字、下划线和中文
  - **密码**: 6-32字符，必须包含字母和数字
  - **验证码**: 4-6字符，只能包含字母和数字

```typescript
// 用户名验证
{
  required: "用户名不能为空",
  minLength: { value: 2, message: "用户名至少2个字符" },
  maxLength: { value: 20, message: "用户名不能超过20个字符" },
  pattern: {
    value: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
    message: "用户名只能包含字母、数字、下划线和中文"
  }
}

// 密码验证
{
  required: "密码不能为空",
  minLength: { value: 6, message: "密码至少6个字符" },
  maxLength: { value: 32, message: "密码不能超过32个字符" },
  pattern: {
    value: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
    message: "密码必须包含字母和数字"
  }
}
```

### 6. 🎛️ 智能按钮状态
- **功能**: 根据表单验证状态智能启用/禁用登录按钮
- **实现**: 使用`isValid`和`isDirty`状态控制按钮
- **用户体验**: 只有表单完全有效且用户已输入内容时才允许提交

```typescript
<Button 
  className="w-full" 
  size="sm"
  disabled={loading || !isValid || !isDirty}
>
  {loading ? "登录中..." : "登录"}
</Button>
```

### 7. 🔧 Input组件增强
- **功能**: 为Input组件添加键盘事件支持
- **实现**: 扩展`InputProps`接口，添加`onKeyDown`和`onKeyUp`事件
- **兼容性**: 保持向后兼容，新事件为可选属性

```typescript
interface InputProps {
  // ... 现有属性
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
```

## 🚀 用户体验提升

1. **实时反馈**: 用户输入时立即看到验证结果
2. **智能提示**: 根据错误类型显示相应的帮助信息
3. **键盘友好**: 支持Enter键快速提交，CapsLock状态提醒
4. **安全重定向**: 防止恶意重定向攻击
5. **智能按钮**: 只有表单有效时才允许提交
6. **错误恢复**: 登录失败时自动刷新验证码

## 📋 技术实现要点

- **状态管理**: 使用React Hooks管理组件状态
- **表单处理**: 使用`react-hook-form`进行表单验证和管理
- **错误处理**: 统一的错误处理机制，支持多种错误类型
- **类型安全**: 完整的TypeScript类型定义
- **用户体验**: 实时验证、智能提示、键盘支持

## 🎉 总结

通过参考Vue项目的登录页面事件处理逻辑，我们成功完善了Next.js项目的登录页面，实现了：

- ✅ CapsLock检测和提示
- ✅ 键盘事件处理优化
- ✅ 安全的重定向解析
- ✅ 增强的错误处理机制
- ✅ 完善的表单验证规则
- ✅ 智能的按钮状态管理
- ✅ Input组件的功能扩展

这些改进大大提升了登录页面的用户体验和安全性，使登录流程更加流畅和用户友好。
