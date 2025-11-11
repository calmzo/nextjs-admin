import request from '@/utils/request';
import type { LoginFormData, LoginResult, CaptchaInfo } from '@/types/api';

const AUTH_BASE_URL = '/admin/system/auth';

export const AuthAPI = {
  /**
   * 用户登录
   * @param data 登录表单数据
   * @returns Promise<LoginResult>
   */
  login(data: LoginFormData): Promise<LoginResult> {
    // 构建URL编码的表单数据
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    if (data.captchaKey) {
      formData.append('captchaKey', data.captchaKey);
    }
    if (data.captchaCode) {
      formData.append('captchaCode', data.captchaCode);
    }
    if (data.rememberMe !== undefined) {
      formData.append('rememberMe', data.rememberMe.toString());
    }
    
    return request({
      url: `${AUTH_BASE_URL}/login`,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns Promise<LoginResult>
   */
  refreshToken(refreshToken: string): Promise<LoginResult> {
    return request({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: 'post',
      params: { refreshToken },
      headers: {
        Authorization: 'no-auth',
      },
    });
  },

  /**
   * 用户登出
   * @returns Promise<void>
   */
  logout(): Promise<void> {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: 'delete',
    });
  },

  /**
   * 获取验证码
   * @returns Promise<CaptchaInfo>
   */
  getCaptcha(): Promise<CaptchaInfo> {
    return request({
      url: '/admin/system/auth/captcha',
      method: 'get',
      headers: {
        Authorization: 'no-auth',
      },
    });
  },

  /**
   * 忘记密码
   * @param email 邮箱地址
   * @returns Promise<void>
   */
  forgotPassword(email: string): Promise<void> {
    return request({
      url: `${AUTH_BASE_URL}/forgot-password`,
      method: 'post',
      data: { email },
    });
  },

  /**
   * 重置密码
   * @param data 重置密码数据
   * @returns Promise<void>
   */
  resetPassword(data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    return request({
      url: `${AUTH_BASE_URL}/reset-password`,
      method: 'post',
      data,
    });
  },
};

export default AuthAPI;
