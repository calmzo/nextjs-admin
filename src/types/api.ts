// API响应基础接口
export interface ApiResponse<T = unknown> {
  code: string;
  data: T;
  msg: string;
}

// 分页响应接口
export interface PageResponse<T = unknown> {
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
  data?: unknown;
  params?: unknown;
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
  perms?: string[];
}

// 验证码信息接口
export interface CaptchaInfo {
  captchaKey: string;
  captchaBase64: string;
}

// 分页查询基础接口
export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页结果接口
export interface PageResult<T = unknown> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

// 选项类型接口
export interface OptionType {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// Excel导入结果接口
export interface ExcelResult {
  successCount: number;
  failureCount: number;
  errors?: string[];
}
