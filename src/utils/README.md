# API请求封装说明

## 概述

本项目使用axios进行HTTP请求封装，提供了统一的请求/响应处理、Token管理、错误处理等功能。

## 文件结构

```
src/
├── utils/
│   ├── request.ts          # 核心请求封装
├── api/
│   ├── auth.api.ts         # 认证相关API
│   └── user.api.ts         # 用户相关API
├── store/
│   └── authStore.ts        # 认证状态管理
└── types/
    └── api.ts              # API类型定义
```

## 核心功能

### 1. 请求拦截器
- 自动添加Authorization头
- 支持no-auth标记跳过Token添加
- 统一请求配置

### 2. 响应拦截器
- 统一响应格式处理（code="00000"表示成功）
- 自动错误提示
- Token过期自动刷新（code="A0001"）
- 会话过期自动跳转（code="A0002"）

### 3. Token管理
- 自动Token存储和获取
- Token刷新机制
- 会话过期处理

## 使用方法

### 基础请求
```typescript
import request from '@/utils/request';

// GET请求
const data = await request({
  url: '/api/users',
  method: 'get'
});

// POST请求
const result = await request({
  url: '/api/users',
  method: 'post',
  data: { name: 'John' }
});
```

### 认证相关
```typescript
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();

// 登录
await authStore.login({
  username: 'admin',
  password: '123456',
  captchaCode: '1234',
  captchaKey: 'key123',
  rememberMe: true
});

// 登出
await authStore.logout();

// 获取用户信息
const userInfo = await authStore.getUserInfo();
```

### API接口调用
```typescript
import AuthAPI from '@/api/auth.api';

// 登录
const result = await AuthAPI.login({
  username: 'admin',
  password: '123456',
  captchaCode: '1234',
  captchaKey: 'key123',
  rememberMe: true
});

// 获取验证码
const captcha = await AuthAPI.getCaptcha();
// 接口路径: /prod-api/admin/system/auth/captcha
```

### 登录组件使用
```typescript
// 在页面中使用登录组件
import SignInForm from '@/components/auth/SignInForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-gray-100">
        {/* 左侧内容 */}
      </div>
      <SignInForm />
    </div>
  );
}
```

### 登录组件特性
- **智能表单验证**: 实时验证和错误提示
- **焦点事件处理**: 输入框焦点时显示提示信息
- **验证码功能**: 自动获取和刷新验证码，支持加载状态
- **键盘支持**: 支持Enter键提交表单
- **用户体验**: 加载状态、错误提示、成功反馈
- **API集成**: 使用/prod-api前缀的后端接口

## 环境配置

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## 错误处理

系统会自动处理以下错误：
- 网络错误
- 服务器错误
- Token过期
- 会话过期

错误信息会通过toast自动显示给用户。

## 响应格式说明

所有API响应都遵循统一的格式：

```typescript
interface ApiResponse<T = any> {
  code: string;
  data: T;
  msg: string;
}
```

### 状态码说明
- `"00000"`: 请求成功
- `"A0001"`: Token过期，需要刷新
- `"A0002"`: 会话过期，需要重新登录
- 其他: 业务错误或系统错误

## 注意事项

1. 所有API请求都会自动添加Token（除非设置Authorization: 'no-auth'）
2. Token过期时会自动刷新，无需手动处理
3. 会话过期时会自动跳转到登录页
4. 所有错误都会统一处理和提示
5. 验证码接口返回格式：`{ code: "00000", data: { captchaBase64: "data:image/jpeg;base64,...", captchaKey: "xxx" }, msg: "一切ok" }`
