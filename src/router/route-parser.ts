/**
 * 路由解析器
 * 提供完整的路由解析功能，包括路径参数解析、查询参数解析、路由匹配等
 */

// ==================== 类型定义 ====================

/**
 * 路由参数类型
 */
export type RouteParamType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

/**
 * 路由参数定义
 */
export interface RouteParamDef {
  // 参数名称
  name: string;
  // 参数类型
  type: RouteParamType;
  // 是否必需
  required?: boolean;
  // 默认值
  defaultValue?: unknown;
  // 验证函数
  validate?: (value: unknown) => boolean;
  // 转换函数
  transform?: (value: unknown) => unknown;
}

/**
 * 路由配置
 */
export interface RouteConfig {
  // 路由路径（支持动态参数，如 /user/:id）
  path: string;
  // 路由名称
  name?: string;
  // 路由别名
  alias?: string[];
  // 路由元信息
  meta?: Record<string, unknown>;
  // 路径参数定义
  params?: RouteParamDef[];
  // 查询参数定义
  queryParams?: RouteParamDef[];
  // 重定向路径
  redirect?: string;
  // 是否精确匹配
  exact?: boolean;
  // 是否区分大小写
  caseSensitive?: boolean;
}

/**
 * 解析后的路由参数
 */
export interface ParsedRouteParams {
  // 路径参数
  pathParams: Record<string, unknown>;
  // 查询参数
  queryParams: Record<string, unknown>;
  // 哈希值
  hash?: string;
  // 完整路径
  fullPath: string;
  // 基础路径
  basePath: string;
}

/**
 * 路由匹配结果
 */
export interface RouteMatchResult {
  // 是否匹配
  matched: boolean;
  // 匹配的路由配置
  route?: RouteConfig;
  // 解析后的参数
  params?: ParsedRouteParams;
  // 匹配的路径部分
  matchedPath?: string;
  // 匹配的索引
  matchIndex?: number;
}

/**
 * 路由解析器配置
 */
export interface RouteParserConfig {
  // 默认路由参数类型
  defaultParamType?: RouteParamType;
  // 是否严格模式
  strict?: boolean;
  // 是否自动类型转换
  autoTypeConversion?: boolean;
  // 路由配置列表
  routes?: RouteConfig[];
}

// ==================== 路由解析器类 ====================

/**
 * 路由解析器
 */
export class RouteParser {
  private config: Required<RouteParserConfig>;
  private routes: RouteConfig[] = [];
  private routeCache: Map<string, RouteConfig> = new Map();

  constructor(config: RouteParserConfig = {}) {
    this.config = {
      defaultParamType: 'string',
      strict: false,
      autoTypeConversion: true,
      routes: [],
      ...config
    };

    this.routes = this.config.routes || [];
    this.indexRoutes();
  }

  /**
   * 索引路由配置
   */
  private indexRoutes(): void {
    this.routeCache.clear();
    this.routes.forEach(route => {
      if (route.name) {
        this.routeCache.set(route.name, route);
      }
      if (route.alias) {
        route.alias.forEach(alias => {
          this.routeCache.set(alias, route);
        });
      }
    });
  }

  /**
   * 添加路由配置
   */
  addRoute(route: RouteConfig): void {
    this.routes.push(route);
    this.indexRoutes();
  }

  /**
   * 添加多个路由配置
   */
  addRoutes(routes: RouteConfig[]): void {
    this.routes.push(...routes);
    this.indexRoutes();
  }

  /**
   * 移除路由配置
   */
  removeRoute(pathOrName: string): boolean {
    const index = this.routes.findIndex(
      route => route.path === pathOrName || route.name === pathOrName
    );
    
    if (index !== -1) {
      this.routes.splice(index, 1);
      this.indexRoutes();
      return true;
    }
    
    return false;
  }

  /**
   * 获取路由配置
   */
  getRoute(pathOrName: string): RouteConfig | undefined {
    return this.routeCache.get(pathOrName) || 
           this.routes.find(route => route.path === pathOrName || route.name === pathOrName);
  }

  /**
   * 获取所有路由配置
   */
  getRoutes(): RouteConfig[] {
    return [...this.routes];
  }

  /**
   * 解析路径参数
   */
  parsePathParams(path: string, routeConfig: RouteConfig): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    
    if (!routeConfig.params || routeConfig.params.length === 0) {
      return params;
    }

    // 提取路径中的参数
    const pathSegments = path.split('/').filter(Boolean);
    const routeSegments = routeConfig.path.split('/').filter(Boolean);
    
    routeSegments.forEach((segment, index) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        const paramDef = routeConfig.params?.find(p => p.name === paramName);
        const paramValue = pathSegments[index];
        
        if (paramDef) {
          params[paramName] = this.parseParamValue(paramValue, paramDef);
        } else if (this.config.autoTypeConversion) {
          params[paramName] = this.autoConvertType(paramValue);
        } else {
          params[paramName] = paramValue;
        }
      }
    });

    return params;
  }

  /**
   * 解析查询参数
   */
  parseQueryParams(
    searchParams: URLSearchParams | Record<string, string | string[]>,
    routeConfig?: RouteConfig
  ): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    const queryDefs = routeConfig?.queryParams || [];

    // 转换为标准格式
    const query: Record<string, string | string[]> = {};
    if (searchParams instanceof URLSearchParams) {
      searchParams.forEach((value, key) => {
        if (query[key]) {
          const existing = Array.isArray(query[key]) ? query[key] : [query[key]];
          query[key] = [...existing, value];
        } else {
          query[key] = value;
        }
      });
    } else {
      Object.assign(query, searchParams);
    }

    // 解析每个查询参数
    Object.keys(query).forEach(key => {
      const paramDef = queryDefs.find(p => p.name === key);
      const rawValue = query[key];
      
      if (paramDef) {
        params[key] = this.parseParamValue(rawValue, paramDef);
      } else if (this.config.autoTypeConversion) {
        params[key] = this.autoConvertType(rawValue);
      } else {
        params[key] = rawValue;
      }
    });

    // 应用默认值
    queryDefs.forEach(paramDef => {
      if (!(paramDef.name in params) && paramDef.defaultValue !== undefined) {
        params[paramDef.name] = paramDef.defaultValue;
      }
    });

    return params;
  }

  /**
   * 解析参数值
   */
  private parseParamValue(value: unknown, paramDef: RouteParamDef): unknown {
    if (value === null || value === undefined) {
      if (paramDef.defaultValue !== undefined) {
        return paramDef.defaultValue;
      }
      if (paramDef.required && this.config.strict) {
        throw new Error(`参数 ${paramDef.name} 是必需的`);
      }
      return value;
    }

    // 类型转换
    let convertedValue: unknown = value;
    if (paramDef.transform) {
      convertedValue = paramDef.transform(value);
    } else {
      convertedValue = this.convertType(value, paramDef.type);
    }

    // 验证
    if (paramDef.validate && !paramDef.validate(convertedValue)) {
      if (this.config.strict) {
        throw new Error(`参数 ${paramDef.name} 验证失败`);
      }
    }

    return convertedValue;
  }

  /**
   * 自动类型转换
   */
  private autoConvertType(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map(v => this.autoConvertType(v));
    }

    if (typeof value === 'string') {
      // 尝试转换为数字
      if (/^-?\d+$/.test(value)) {
        return parseInt(value, 10);
      }
      // 尝试转换为浮点数
      if (/^-?\d*\.\d+$/.test(value)) {
        return parseFloat(value);
      }
      // 尝试转换为布尔值
      if (value === 'true' || value === 'false') {
        return value === 'true';
      }
      // 尝试转换为日期
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return value;
  }

  /**
   * 类型转换
   */
  private convertType(value: unknown, type: RouteParamType): unknown {
    switch (type) {
      case 'number':
        return Array.isArray(value) 
          ? value.map(v => Number(v))
          : Number(value);
      
      case 'boolean':
        return Array.isArray(value)
          ? value.map(v => v === 'true' || v === true || v === '1')
          : (value === 'true' || value === true || value === '1');
      
      case 'date':
        return Array.isArray(value)
          ? value.map(v => new Date(v as string | number | Date))
          : new Date(value as string | number | Date);
      
      case 'array':
        return Array.isArray(value) ? value : [value];
      
      case 'object':
        try {
          return typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          return value;
        }
      
      case 'string':
      default:
        return Array.isArray(value) ? value.map(String) : String(value);
    }
  }

  /**
   * 匹配路由
   */
  matchRoute(path: string, options?: { exact?: boolean }): RouteMatchResult {
    const normalizedPath = this.normalizePath(path);
    const exact = options?.exact ?? false;

    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      const matchResult = this.matchPath(normalizedPath, route, exact);
      
      if (matchResult.matched) {
        return {
          ...matchResult,
          route,
          matchIndex: i
        };
      }
    }

    return { matched: false };
  }

  /**
   * 匹配路径
   */
  private matchPath(path: string, routeConfig: RouteConfig, exact: boolean): RouteMatchResult {
    const routePath = routeConfig.path;
    const caseSensitive = routeConfig.caseSensitive ?? false;
    
    // 构建正则表达式
    const pattern = this.buildRoutePattern(routePath, caseSensitive);
    const regex = new RegExp(pattern);
    
    // 测试匹配
    const match = path.match(regex);
    
    if (!match) {
      return { matched: false };
    }

    // 检查精确匹配
    if (exact || routeConfig.exact) {
      const fullMatch = match[0];
      if (fullMatch !== path) {
        return { matched: false };
      }
    }

    // 解析路径参数
    const pathParams = this.parsePathParams(path, routeConfig);
    
    return {
      matched: true,
      matchedPath: match[0],
      params: {
        pathParams,
        queryParams: {},
        fullPath: path,
        basePath: match[0]
      }
    };
  }

  /**
   * 构建路由模式正则表达式
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private buildRoutePattern(path: string, _caseSensitive: boolean): string {
    // 转义特殊字符
    let pattern = path
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:\w+/g, '([^/]+)');
    
    // 添加开始和结束锚点
    pattern = `^${pattern}`;
    
    // 如果不是精确匹配，允许后面有内容
    if (!this.config.strict) {
      pattern = `${pattern}(?:/.*)?$`;
    } else {
      pattern = `${pattern}$`;
    }
    
    return pattern;
  }

  /**
   * 规范化路径
   */
  private normalizePath(path: string): string {
    // 移除查询参数和哈希
    const [basePath] = path.split('?');
    const [cleanPath] = basePath.split('#');
    
    // 规范化斜杠
    return cleanPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  /**
   * 解析完整路由
   */
  parseRoute(
    path: string,
    searchParams?: URLSearchParams | Record<string, string | string[]>,
    hash?: string
  ): ParsedRouteParams {
    // 匹配路由
    const matchResult = this.matchRoute(path);
    
    if (!matchResult.matched || !matchResult.route) {
      // 如果没有匹配的路由，返回基础解析结果
      return {
        pathParams: {},
        queryParams: searchParams ? this.parseQueryParams(searchParams) : {},
        hash,
        fullPath: path,
        basePath: path.split('?')[0].split('#')[0]
      };
    }

    // 解析查询参数
    const queryParams = searchParams 
      ? this.parseQueryParams(searchParams, matchResult.route)
      : {};

    // 合并结果
    return {
      ...matchResult.params!,
      queryParams,
      hash,
      fullPath: path
    };
  }

  /**
   * 生成路由路径
   */
  generatePath(
    routeNameOrPath: string,
    params?: Record<string, unknown>,
    queryParams?: Record<string, unknown>
  ): string {
    const route = this.getRoute(routeNameOrPath);
    
    if (!route) {
      // 如果找不到路由配置，直接返回路径
      return routeNameOrPath;
    }

    // 替换路径参数
    let path = route.path;
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        path = path.replace(`:${key}`, String(value));
      });
    }

    // 添加查询参数
    if (queryParams && Object.keys(queryParams).length > 0) {
      const query = new URLSearchParams();
      Object.keys(queryParams).forEach(key => {
        const value = queryParams[key];
        if (Array.isArray(value)) {
          value.forEach(v => query.append(key, String(v)));
        } else {
          query.append(key, String(value));
        }
      });
      path += `?${query.toString()}`;
    }

    return path;
  }

  /**
   * 验证路由参数
   */
  validateParams(
    params: Record<string, unknown>,
    paramDefs: RouteParamDef[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    paramDefs.forEach(paramDef => {
      const value = params[paramDef.name];
      
      // 检查必需参数
      if (paramDef.required && (value === null || value === undefined)) {
        errors.push(`参数 ${paramDef.name} 是必需的`);
        return;
      }

      // 如果值存在，进行验证
      if (value !== null && value !== undefined) {
        // 类型验证
        const convertedValue = paramDef.transform 
          ? paramDef.transform(value)
          : this.convertType(value, paramDef.type);

        // 自定义验证
        if (paramDef.validate && !paramDef.validate(convertedValue)) {
          errors.push(`参数 ${paramDef.name} 验证失败`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// ==================== 工具函数 ====================

/**
 * 创建路由解析器实例
 */
export function createRouteParser(config?: RouteParserConfig): RouteParser {
  return new RouteParser(config);
}

/**
 * 解析 URL
 */
export function parseUrl(url: string): {
  pathname: string;
  searchParams: URLSearchParams;
  hash: string;
} {
  try {
    // SSR 兼容性检查
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost';
    
    const urlObj = new URL(url, baseUrl);
    return {
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams,
      hash: urlObj.hash.slice(1)
    };
  } catch {
    // 如果 URL 解析失败，尝试手动解析
    const [pathWithQuery, hash] = url.split('#');
    const [pathname, search] = pathWithQuery.split('?');
    const searchParams = new URLSearchParams(search || '');
    
    return {
      pathname,
      searchParams,
      hash: hash || ''
    };
  }
}

/**
 * 构建查询字符串
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });
  
  return query.toString();
}

/**
 * 解析查询字符串
 */
export function parseQueryString(queryString: string): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  const query = new URLSearchParams(queryString);
  
  query.forEach((value, key) => {
    if (params[key]) {
      const existing = Array.isArray(params[key]) ? params[key] : [params[key]];
      params[key] = [...existing, value];
    } else {
      params[key] = value;
    }
  });
  
  return params;
}

// ==================== 默认导出 ====================

export default RouteParser;
