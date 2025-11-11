/**
 * 日志工具
 * 
 * 功能特性：
 * - 环境感知：开发环境输出，生产环境静默（error 除外）
 * - 日志级别：log, info, warn, error, debug
 * - 日志分组：支持 console.group
 * - 性能监控：支持性能计时
 * - 格式化输出：自动添加时间戳和日志级别标识
 * - 类型安全：完整的 TypeScript 类型支持
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  /** 是否启用日志输出 */
  enabled: boolean;
  /** 是否显示时间戳 */
  showTimestamp: boolean;
  /** 是否显示日志级别 */
  showLevel: boolean;
  /** 日志级别前缀映射 */
  levelPrefix: Record<LogLevel, string>;
}

interface PerformanceTimer {
  label: string;
  startTime: number;
}

/**
 * 环境判断
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 默认配置
 */
const defaultConfig: LoggerConfig = {
  enabled: isDevelopment,
  showTimestamp: true,
  showLevel: true,
  levelPrefix: {
    log: '📝',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    debug: '🐛',
  },
};

/**
 * 当前配置（可动态修改）
 */
let config: LoggerConfig = { ...defaultConfig };

/**
 * 性能计时器存储
 */
const timers = new Map<string, PerformanceTimer>();

/**
 * 格式化时间戳
 */
function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

/**
 * 格式化日志消息
 */
function formatMessage(level: LogLevel, args: unknown[]): unknown[] {
  const parts: unknown[] = [];
  
  if (config.showTimestamp) {
    parts.push(`[${formatTimestamp()}]`);
  }
  
  if (config.showLevel) {
    parts.push(`${config.levelPrefix[level]} [${level.toUpperCase()}]`);
  }
  
  return [...parts, ...args];
}

/**
 * 日志工具类
 */
class Logger {
  /**
   * 更新配置
   */
  setConfig(newConfig: Partial<LoggerConfig>): void {
    config = { ...config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  getConfig(): Readonly<LoggerConfig> {
    return { ...config };
  }

  /**
   * 基础日志方法
   */
  private logInternal(level: LogLevel, ...args: unknown[]): void {
    // error 始终输出，其他级别根据配置决定
    if (!config.enabled && level !== 'error') {
      return;
    }

    const formattedArgs = formatMessage(level, args);
    const consoleMethod = console[level] || console.log;
    consoleMethod(...formattedArgs);
  }

  /**
   * 普通日志
   */
  log(...args: unknown[]): void {
    this.logInternal('log', ...args);
  }

  /**
   * 信息日志
   */
  info(...args: unknown[]): void {
    this.logInternal('info', ...args);
  }

  /**
   * 警告日志
   */
  warn(...args: unknown[]): void {
    this.logInternal('warn', ...args);
  }

  /**
   * 错误日志（始终输出）
   */
  error(...args: unknown[]): void {
    this.logInternal('error', ...args);
  }

  /**
   * 调试日志
   */
  debug(...args: unknown[]): void {
    this.logInternal('debug', ...args);
  }

  /**
   * 日志分组
   * @param groupName 分组名称
   * @param callback 分组内的日志回调
   * @param collapsed 是否折叠（默认 false）
   */
  group(groupName: string, callback: () => void, collapsed: boolean = false): void {
    if (!config.enabled) {
      callback();
      return;
    }

    const groupMethod = collapsed ? console.groupCollapsed : console.group;
    groupMethod(groupName);
    try {
      callback();
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 折叠分组
   */
  groupCollapsed(groupName: string, callback: () => void): void {
    this.group(groupName, callback, true);
  }

  /**
   * 表格输出
   */
  table(data: unknown, columns?: string[]): void {
    if (!config.enabled) return;
    console.table(data, columns);
  }

  /**
   * 开始性能计时
   * @param label 计时器标签
   */
  time(label: string): void {
    if (!config.enabled) return;
    
    if (timers.has(label)) {
      this.warn(`Timer "${label}" already exists. Overwriting...`);
    }
    
    timers.set(label, {
      label,
      startTime: performance.now(),
    });
    
    console.time(label);
  }

  /**
   * 结束性能计时
   * @param label 计时器标签
   */
  timeEnd(label: string): void {
    if (!config.enabled) return;
    
    const timer = timers.get(label);
    if (!timer) {
      this.warn(`Timer "${label}" does not exist.`);
      return;
    }
    
    const duration = performance.now() - timer.startTime;
    console.timeEnd(label);
    timers.delete(label);
    
    // 额外输出格式化的时间信息
    this.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  }

  /**
   * 性能标记（用于性能分析）
   * @param label 标记名称
   */
  mark(label: string): void {
    if (!config.enabled) return;
    if (typeof performance.mark === 'function') {
      performance.mark(label);
      this.debug(`📍 Mark: ${label}`);
    }
  }

  /**
   * 测量两个标记之间的性能
   * @param name 测量名称
   * @param startMark 开始标记
   * @param endMark 结束标记
   */
  measure(name: string, startMark: string, endMark?: string): void {
    if (!config.enabled) return;
    if (typeof performance.measure === 'function') {
      try {
        performance.measure(name, startMark, endMark);
        const measures = performance.getEntriesByName(name, 'measure');
        if (measures.length > 0) {
          const duration = measures[0].duration;
          this.debug(`📊 Measure "${name}": ${duration.toFixed(2)}ms`);
        }
      } catch (error) {
        this.warn(`Failed to measure "${name}":`, error);
      }
    }
  }

  /**
   * 断言
   * @param condition 断言条件
   * @param message 错误消息
   */
  assert(condition: boolean, ...message: unknown[]): void {
    if (!config.enabled) return;
    console.assert(condition, ...message);
  }

  /**
   * 清空控制台（仅在开发环境）
   */
  clear(): void {
    if (!config.enabled) return;
    console.clear();
  }

  /**
   * 输出堆栈跟踪
   * @param label 标签
   */
  trace(label?: string): void {
    if (!config.enabled) return;
    if (label) {
      this.debug(label);
    }
    console.trace();
  }

  /**
   * 输出对象结构（深度展开）
   */
  dir(obj: unknown, options?: { depth?: number }): void {
    if (!config.enabled) return;
    console.dir(obj, options);
  }

  /**
   * 输出对象（JSON 格式）
   */
  json(obj: unknown): void {
    if (!config.enabled) return;
    console.log(JSON.stringify(obj, null, 2));
  }
}

/**
 * 创建日志实例
 */
const logger = new Logger();

/**
 * 导出日志工具
 */
export default logger;

/**
 * 命名导出（方便按需导入）
 */
export const { log, info, warn, error, debug, group, groupCollapsed, table, time, timeEnd, mark, measure, assert, clear, trace, dir, json } = logger;

/**
 * 导出类型
 */
export type { LoggerConfig, LogLevel };
