/**
 * Next.js 中间件
 * 提供路由权限控制、权限验证等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { PermissionMiddleware } from './middleware/permission.middleware';
import logger from './utils/logger';

// 创建权限验证中间件实例
const permissionMiddleware = new PermissionMiddleware({
  enabled: true,
  timeout: 5000,
  retryCount: 3,
  cacheTime: 30 * 60 * 1000, // 30分钟
  logLevel: 'info',
  whitelist: [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/api/auth/*',
    '/api/public/*',
    '/_next/*',
    '/favicon.ico',
    '/debug-auth',
    '/debug-auth-status',
    '/test-login',
    '/test-redirect',
    '/permission-test',
    '/permission-test-direct'
  ],
  blacklist: [
    '/api/admin/*'
  ],
  onPermissionDenied: (request: NextRequest) => {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  },
  onPermissionError: (request: NextRequest, error: Error) => {
    logger.error('权限验证中间件错误:', error);
    return NextResponse.json(
      { error: '权限验证失败', code: 500, message: error.message },
      { status: 500 }
    );
  }
});

/**
 * Next.js 中间件处理函数
 */
export async function middleware(request: NextRequest) {
  try {
    // 执行权限验证中间件
    const response = await permissionMiddleware.execute(request);
    
    if (response) {
      return response;
    }

    // 继续处理请求
    return NextResponse.next();
  } catch (error) {
    logger.error('中间件执行失败:', error);
    return NextResponse.next();
  }
}

/**
 * 中间件匹配配置
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了以下路径：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
