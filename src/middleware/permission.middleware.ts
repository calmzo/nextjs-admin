/**
 * 权限验证中间件
 * 提供权限验证、权限控制、权限管理等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { PermissionAPI } from '@/api/permission.api';
import logger from '@/utils/logger';
import type {
  UserPermissionCheckRequest,
  RolePermissionCheckRequest,
  MenuPermissionCheckRequest,
  ButtonPermissionCheckRequest,
  PermissionValidationContext
} from '@/types';

// ==================== 权限验证中间件配置 ====================

/**
 * 权限验证中间件配置
 */
export interface PermissionMiddlewareConfig {
  // 是否启用权限验证
  enabled: boolean;
  
  // 权限验证超时时间（毫秒）
  timeout: number;
  
  // 权限验证重试次数
  retryCount: number;
  
  // 权限验证缓存时间（毫秒）
  cacheTime: number;
  
  // 权限验证日志级别
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  // 权限验证白名单
  whitelist: string[];
  
  // 权限验证黑名单
  blacklist: string[];
  
  // 权限验证失败处理
  onPermissionDenied: (request: NextRequest) => NextResponse;
  
  // 权限验证错误处理
  onPermissionError: (request: NextRequest, error: Error) => NextResponse;
}

/**
 * 权限验证中间件默认配置
 */
export const DEFAULT_PERMISSION_MIDDLEWARE_CONFIG: PermissionMiddlewareConfig = {
  enabled: true,
  timeout: 5000,
  retryCount: 3,
  cacheTime: 30 * 60 * 1000, // 30分钟
  logLevel: 'info',
  whitelist: [],
  blacklist: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPermissionDenied: (_request: NextRequest) => {
    return NextResponse.json(
      { error: '权限不足', code: 403 },
      { status: 403 }
    );
  },
  onPermissionError: (request: NextRequest, error: Error) => {
    return NextResponse.json(
      { error: '权限验证失败', code: 500, message: error.message },
      { status: 500 }
    );
  }
};

// ==================== 权限验证中间件 ====================

/**
 * 权限验证中间件
 */
export class PermissionMiddleware {
  private config: PermissionMiddlewareConfig;
  private permissionCache: Map<string, unknown> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();

  constructor(config: Partial<PermissionMiddlewareConfig> = {}) {
    this.config = { ...DEFAULT_PERMISSION_MIDDLEWARE_CONFIG, ...config };
  }

  /**
   * 执行权限验证中间件
   */
  async execute(request: NextRequest): Promise<NextResponse | null> {
    try {
      // 检查是否启用权限验证
      if (!this.config.enabled) {
        return null;
      }

      // 检查白名单
      if (this.isWhitelisted(request)) {
        return null;
      }

      // 检查黑名单
      if (this.isBlacklisted(request)) {
        return this.config.onPermissionDenied(request);
      }

      // 执行权限验证
      const hasPermission = await this.checkPermission(request);
      
      if (!hasPermission) {
        return this.config.onPermissionDenied(request);
      }

      return null;
    } catch (error) {
      logger.error('权限验证中间件执行失败:', error);
      return this.config.onPermissionError(request, error as Error);
    }
  }

  /**
   * 检查白名单
   */
  private isWhitelisted(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    return this.config.whitelist.some(pattern => this.matchPattern(pathname, pattern));
  }

  /**
   * 检查黑名单
   */
  private isBlacklisted(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    return this.config.blacklist.some(pattern => this.matchPattern(pathname, pattern));
  }

  /**
   * 匹配路径模式
   */
  private matchPattern(pathname: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern === pathname) return true;
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    if (pattern.startsWith('*')) {
      return pathname.endsWith(pattern.slice(1));
    }
    return false;
  }

  /**
   * 检查权限
   */
  private async checkPermission(request: NextRequest): Promise<boolean> {
    try {
      // 从请求中提取权限信息
      const permissionContext = this.extractPermissionContext(request);
      
      if (!permissionContext) {
        return true; // 没有权限信息，默认允许
      }

      // 检查缓存
      const cacheKey = this.generateCacheKey(permissionContext);
      const cachedResult = this.getCachedResult(cacheKey);
      
      if (cachedResult !== null) {
        return cachedResult;
      }

      // 执行权限验证
      const result = await this.executePermissionCheck(permissionContext);
      
      // 缓存结果
      this.setCachedResult(cacheKey, result);
      
      return result;
    } catch (error) {
      logger.error('权限验证失败:', error);
      return false;
    }
  }

  /**
   * 从请求中提取权限信息
   */
  private extractPermissionContext(request: NextRequest): PermissionValidationContext | null {
    try {
      const url = request.nextUrl;
      const pathname = url.pathname;
      const searchParams = url.searchParams;
      
      // 从URL参数中提取权限信息
      const userId = searchParams.get('userId');
      const action = searchParams.get('action');
      
      if (!action) {
        return null;
      }

      // 构建权限验证上下文
      const context: PermissionValidationContext = {
        userId: userId ? parseInt(userId) : 0,
        resourceType: this.getResourceType(pathname),
        resourcePath: pathname,
        action, // action 在这里被使用
        context: {
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          timestamp: Date.now()
        }
      };

      return context;
    } catch (error) {
      logger.error('提取权限信息失败:', error);
      return null;
    }
  }

  /**
   * 获取资源类型
   */
  private getResourceType(pathname: string): string {
    if (pathname.startsWith('/api/user')) return 'user';
    if (pathname.startsWith('/api/role')) return 'role';
    if (pathname.startsWith('/api/menu')) return 'menu';
    if (pathname.startsWith('/api/button')) return 'button';
    return 'unknown';
  }

  /**
   * 执行权限验证
   */
  private async executePermissionCheck(context: PermissionValidationContext): Promise<boolean> {
    try {
      // 根据资源类型执行不同的权限验证
      switch (context.resourceType) {
        case 'user':
          return await this.checkUserPermission(context);
        case 'role':
          return await this.checkRolePermission(context);
        case 'menu':
          return await this.checkMenuPermission(context);
        case 'button':
          return await this.checkButtonPermission(context);
        default:
          return true; // 未知资源类型，默认允许
      }
    } catch (error) {
      logger.error('权限验证执行失败:', error);
      return false;
    }
  }

  /**
   * 验证用户权限
   */
  private async checkUserPermission(context: PermissionValidationContext): Promise<boolean> {
    try {
      const permissionRequest: UserPermissionCheckRequest = {
        userId: context.userId,
        resourceType: context.resourceType,
        resourcePath: context.resourcePath,
        action: context.action,
        context: context.context
      };
      
      const result = await PermissionAPI.checkUserPermission(permissionRequest);
      return result.hasPermission;
    } catch (error) {
      logger.error('用户权限验证失败:', error);
      return false;
    }
  }

  /**
   * 验证角色权限
   */
  private async checkRolePermission(context: PermissionValidationContext): Promise<boolean> {
    try {
      const request: RolePermissionCheckRequest = {
        roleId: context.userId, // 这里假设userId是roleId
        resourceType: context.resourceType,
        resourcePath: context.resourcePath,
        action: context.action,
        context: context.context
      };
      
      const result = await PermissionAPI.checkRolePermission(request);
      return result.hasPermission;
    } catch (error) {
      logger.error('角色权限验证失败:', error);
      return false;
    }
  }

  /**
   * 验证菜单权限
   */
  private async checkMenuPermission(context: PermissionValidationContext): Promise<boolean> {
    try {
      const request: MenuPermissionCheckRequest = {
        menuId: context.userId, // 这里假设userId是menuId
        userId: context.userId,
        action: context.action,
        context: context.context
      };
      
      const result = await PermissionAPI.checkMenuPermission(request);
      return result.hasPermission;
    } catch (error) {
      logger.error('菜单权限验证失败:', error);
      return false;
    }
  }

  /**
   * 验证按钮权限
   */
  private async checkButtonPermission(context: PermissionValidationContext): Promise<boolean> {
    try {
      const request: ButtonPermissionCheckRequest = {
        buttonId: context.userId, // 这里假设userId是buttonId
        userId: context.userId,
        action: context.action,
        context: context.context
      };
      
      const result = await PermissionAPI.checkButtonPermission(request);
      return result.hasPermission;
    } catch (error) {
      logger.error('按钮权限验证失败:', error);
      return false;
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(context: PermissionValidationContext): string {
    return `${context.resourceType}:${context.userId}:${context.action}:${context.resourcePath}`;
  }

  /**
   * 获取缓存结果
   */
  private getCachedResult(cacheKey: string): boolean | null {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp) return null;
    
    if (Date.now() - timestamp > this.config.cacheTime) {
      this.permissionCache.delete(cacheKey);
      this.cacheTimestamps.delete(cacheKey);
      return null;
    }
    
    const cached = this.permissionCache.get(cacheKey);
    return typeof cached === 'boolean' ? cached : null;
  }

  /**
   * 设置缓存结果
   */
  private setCachedResult(cacheKey: string, result: boolean): void {
    this.permissionCache.set(cacheKey, result);
    this.cacheTimestamps.set(cacheKey, Date.now());
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.permissionCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<PermissionMiddlewareConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ==================== 权限验证中间件工具函数 ====================

/**
 * 权限验证中间件工具函数
 */
export const PermissionMiddlewareUtils = {
  /**
   * 创建权限验证中间件
   */
  create: (config?: Partial<PermissionMiddlewareConfig>): PermissionMiddleware => {
    return new PermissionMiddleware(config);
  },

  /**
   * 创建默认权限验证中间件
   */
  createDefault: (): PermissionMiddleware => {
    return new PermissionMiddleware();
  },

  /**
   * 创建权限验证中间件配置
   */
  createConfig: (config: Partial<PermissionMiddlewareConfig>): PermissionMiddlewareConfig => {
    return { ...DEFAULT_PERMISSION_MIDDLEWARE_CONFIG, ...config };
  }
};

// ==================== 权限验证中间件常量 ====================

/**
 * 权限验证中间件常量
 */
export const PERMISSION_MIDDLEWARE_CONSTANTS = {
  // 默认配置
  DEFAULT_CONFIG: DEFAULT_PERMISSION_MIDDLEWARE_CONFIG,
  
  // 权限验证超时时间
  TIMEOUT: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000
  },
  
  // 权限验证重试次数
  RETRY_COUNT: {
    NONE: 0,
    LOW: 1,
    MEDIUM: 3,
    HIGH: 5
  },
  
  // 权限验证缓存时间
  CACHE_TIME: {
    SHORT: 5 * 60 * 1000,    // 5分钟
    MEDIUM: 30 * 60 * 1000,   // 30分钟
    LONG: 60 * 60 * 1000      // 1小时
  },
  
  // 权限验证日志级别
  LOG_LEVEL: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  }
} as const;
