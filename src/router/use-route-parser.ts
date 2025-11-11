/**
 * 路由解析器 Hook
 * 提供在 React 组件中使用路由解析器的便捷方式
 */

"use client";

import { useMemo, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { RouteParser, createRouteParser, buildQueryString } from './route-parser';
import logger from '@/utils/logger';
import type { 
  RouteConfig, 
  ParsedRouteParams, 
  RouteMatchResult,
  RouteParserConfig 
} from './route-parser';

/**
 * useRouteParser Hook 配置
 */
export interface UseRouteParserConfig extends RouteParserConfig {
  // 是否自动解析当前路由
  autoParse?: boolean;
}

/**
 * useRouteParser Hook 返回值
 */
export interface UseRouteParserReturn {
  // 路由解析器实例
  parser: RouteParser;
  // 当前解析的路由参数
  parsedRoute: ParsedRouteParams | null;
  // 当前匹配的路由
  matchedRoute: RouteMatchResult | null;
  // 解析指定路径
  parseRoute: (
    path: string,
    searchParams?: URLSearchParams | Record<string, string | string[]>,
    hash?: string
  ) => ParsedRouteParams;
  // 匹配路由
  matchRoute: (path: string, options?: { exact?: boolean }) => RouteMatchResult;
  // 生成路由路径
  generatePath: (
    routeNameOrPath: string,
    params?: Record<string, string | number | boolean>,
    queryParams?: Record<string, string | number | boolean>
  ) => string;
  // 添加路由配置
  addRoute: (route: RouteConfig) => void;
  // 添加多个路由配置
  addRoutes: (routes: RouteConfig[]) => void;
  // 获取路由配置
  getRoute: (pathOrName: string) => RouteConfig | undefined;
  // 获取所有路由配置
  getRoutes: () => RouteConfig[];
  // 解析查询参数
  parseQueryParams: (searchParams?: URLSearchParams | Record<string, string | string[]>) => Record<string, unknown>;
  // 构建查询字符串
  buildQueryString: (params: Record<string, string | number | boolean>) => string;
}

/**
 * 路由解析器 Hook
 */
export function useRouteParser(config: UseRouteParserConfig = {}): UseRouteParserReturn {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const {
    autoParse = true,
    ...parserConfig
  } = config;

  // 提取 parserConfig 的属性作为依赖项
  const {
    defaultParamType,
    strict,
    autoTypeConversion,
    routes
  } = parserConfig;

  // 创建路由解析器实例
  const parser = useMemo(() => {
    return createRouteParser({
      defaultParamType,
      strict,
      autoTypeConversion,
      routes
    });
  }, [defaultParamType, strict, autoTypeConversion, routes]);

  // 解析当前路由
  const parsedRoute = useMemo<ParsedRouteParams | null>(() => {
    if (!autoParse) return null;
    
    try {
      const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
      return parser.parseRoute(pathname, searchParams, hash);
    } catch (error) {
      logger.error('解析路由失败:', error);
      return null;
    }
  }, [pathname, searchParams, autoParse, parser]);

  // 匹配当前路由
  const matchedRoute = useMemo<RouteMatchResult | null>(() => {
    if (!autoParse) return null;
    
    try {
      return parser.matchRoute(pathname);
    } catch (error) {
      logger.error('匹配路由失败:', error);
      return null;
    }
  }, [pathname, autoParse, parser]);

  // 解析指定路径
  const parseRoute = useCallback((
    path: string,
    searchParams?: URLSearchParams | Record<string, string | string[]>,
    hash?: string
  ): ParsedRouteParams => {
    return parser.parseRoute(path, searchParams, hash);
  }, [parser]);

  // 匹配路由
  const matchRoute = useCallback((path: string, options?: { exact?: boolean }): RouteMatchResult => {
    return parser.matchRoute(path, options);
  }, [parser]);

  // 生成路由路径
  const generatePath = useCallback((
    routeNameOrPath: string,
    params?: Record<string, string | number | boolean>,
    queryParams?: Record<string, string | number | boolean>
  ): string => {
    return parser.generatePath(routeNameOrPath, params, queryParams);
  }, [parser]);

  // 添加路由配置
  const addRoute = useCallback((route: RouteConfig) => {
    parser.addRoute(route);
  }, [parser]);

  // 添加多个路由配置
  const addRoutes = useCallback((routes: RouteConfig[]) => {
    parser.addRoutes(routes);
  }, [parser]);

  // 获取路由配置
  const getRoute = useCallback((pathOrName: string): RouteConfig | undefined => {
    return parser.getRoute(pathOrName);
  }, [parser]);

  // 获取所有路由配置
  const getRoutes = useCallback((): RouteConfig[] => {
    return parser.getRoutes();
  }, [parser]);

  // 解析查询参数
  const parseQueryParamsHelper = useCallback((
    searchParams?: URLSearchParams | Record<string, string | string[]>
  ): Record<string, unknown> => {
    if (!searchParams) return {};
    return parser.parseQueryParams(searchParams);
  }, [parser]);

  // 构建查询字符串
  const buildQueryStringHelper = useCallback((params: Record<string, string | number | boolean>): string => {
    return buildQueryString(params);
  }, []);

  return {
    parser,
    parsedRoute,
    matchedRoute,
    parseRoute,
    matchRoute,
    generatePath,
    addRoute,
    addRoutes,
    getRoute,
    getRoutes,
    parseQueryParams: parseQueryParamsHelper,
    buildQueryString: buildQueryStringHelper
  };
}

/**
 * 简化的路由解析 Hook（仅解析当前路由）
 */
export function useCurrentRoute() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { parsedRoute, matchedRoute } = useRouteParser({ autoParse: true });

  return {
    pathname,
    searchParams,
    parsedRoute,
    matchedRoute,
    // 路径参数
    pathParams: parsedRoute?.pathParams || {},
    // 查询参数
    queryParams: parsedRoute?.queryParams || {},
    // 哈希值
    hash: parsedRoute?.hash,
    // 匹配的路由配置
    route: matchedRoute?.route
  };
}

/**
 * 解析查询参数的 Hook
 */
export function useQueryParams<T = Record<string, unknown>>(): T {
  const searchParams = useSearchParams();
  const { parser } = useRouteParser({ autoParse: false });
  
  const queryParams = useMemo(() => {
    try {
      return parser.parseQueryParams(searchParams) as T;
    } catch (error) {
      logger.error('解析查询参数失败:', error);
      return {} as T;
    }
  }, [searchParams, parser]);

  return queryParams;
}

/**
 * 解析路径参数的 Hook
 */
export function usePathParams<T = Record<string, string>>(): T {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pathname = usePathname();
  const { matchedRoute } = useRouteParser({ autoParse: true });
  
  const pathParams = useMemo(() => {
    return (matchedRoute?.params?.pathParams || {}) as T;
  }, [matchedRoute]);

  return pathParams;
}

export default useRouteParser;
