// API响应基础接口
export interface ApiResponse<T = any> {
  code: string;
  data: T;
  msg: string;
}

// 分页响应接口
export interface PageResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 错误响应接口
export interface ErrorResponse {
  code: number;
  msg: string;
  details?: string;
}

// 请求配置接口
export interface RequestConfig {
  url: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}

// 登录表单数据接口
export interface LoginFormData {
  username: string;
  password: string;
  captchaKey?: string;
  captchaCode?: string;
  rememberMe?: boolean;
}

// 登录结果接口
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// 用户信息接口
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  roles?: string[];
  permissions?: string[];
}

// 验证码信息接口
export interface CaptchaInfo {
  captchaKey: string;
  captchaBase64: string;
}
