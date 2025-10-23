/**
 * 身份验证工具类
 * 集中管理所有与认证相关的功能，包括：
 * - 登录状态判断
 * - Token 的存取
 * - 记住我功能的状态管理
 */
export class Auth {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly REMEMBER_ME_KEY = 'remember_me';

  /**
   * 判断用户是否已登录
   * @returns 是否已登录
   */
  static isLoggedIn(): boolean {
    return !!Auth.getAccessToken();
  }

  /**
   * 获取当前有效的访问令牌
   * 会根据"记住我"状态从适当的存储位置获取
   * @returns 当前有效的访问令牌
   */
  static getAccessToken(): string {
    if (typeof window === 'undefined') return '';
    
    const isRememberMe = Auth.getRememberMe();
    // 根据"记住我"状态决定从哪个存储位置获取token
    return isRememberMe
      ? localStorage.getItem(Auth.ACCESS_TOKEN_KEY) || ''
      : sessionStorage.getItem(Auth.ACCESS_TOKEN_KEY) || '';
  }

  /**
   * 获取刷新令牌
   * @returns 当前有效的刷新令牌
   */
  static getRefreshToken(): string {
    if (typeof window === 'undefined') return '';
    
    const isRememberMe = Auth.getRememberMe();
    return isRememberMe
      ? localStorage.getItem(Auth.REFRESH_TOKEN_KEY) || ''
      : sessionStorage.getItem(Auth.REFRESH_TOKEN_KEY) || '';
  }

  /**
   * 设置访问令牌和刷新令牌
   * @param accessToken 访问令牌
   * @param refreshToken 刷新令牌
   * @param rememberMe 是否记住我
   */
  static setTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    if (typeof window === 'undefined') return;
    
    // 保存"记住我"状态
    Auth.setRememberMe(rememberMe);

    if (rememberMe) {
      // 使用localStorage长期保存
      localStorage.setItem(Auth.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(Auth.REFRESH_TOKEN_KEY, refreshToken);
      // 清除sessionStorage中可能存在的token
      sessionStorage.removeItem(Auth.ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(Auth.REFRESH_TOKEN_KEY);
    } else {
      // 使用sessionStorage临时保存
      sessionStorage.setItem(Auth.ACCESS_TOKEN_KEY, accessToken);
      sessionStorage.setItem(Auth.REFRESH_TOKEN_KEY, refreshToken);
      // 清除localStorage中可能存在的token
      localStorage.removeItem(Auth.ACCESS_TOKEN_KEY);
      localStorage.removeItem(Auth.REFRESH_TOKEN_KEY);
    }
  }

  /**
   * 清除所有身份验证相关的数据
   */
  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(Auth.ACCESS_TOKEN_KEY);
    localStorage.removeItem(Auth.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(Auth.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(Auth.REFRESH_TOKEN_KEY);
    // 不清除记住我设置，保留用户偏好
  }

  /**
   * 获取"记住我"状态
   * @returns 是否记住我
   */
  static getRememberMe(): boolean {
    if (typeof window === 'undefined') return false;
    
    const rememberMe = localStorage.getItem(Auth.REMEMBER_ME_KEY);
    return rememberMe === 'true';
  }

  /**
   * 设置"记住我"状态
   * @param rememberMe 是否记住我
   */
  private static setRememberMe(rememberMe: boolean): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(Auth.REMEMBER_ME_KEY, rememberMe.toString());
  }

  /**
   * 清除记住我状态
   */
  static clearRememberMe(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(Auth.REMEMBER_ME_KEY);
  }
}
