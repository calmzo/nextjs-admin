/**
 * Logger 工具类测试
 * 测试日志相关的所有功能
 */

import logger, { type LoggerConfig } from '@/utils/logger';

describe('Logger', () => {
  let originalEnv: string | undefined;
  let consoleSpy: {
    log: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    debug: jest.SpyInstance;
    group: jest.SpyInstance;
    groupCollapsed: jest.SpyInstance;
    groupEnd: jest.SpyInstance;
    table: jest.SpyInstance;
    time: jest.SpyInstance;
    timeEnd: jest.SpyInstance;
    assert: jest.SpyInstance;
    clear: jest.SpyInstance;
    trace: jest.SpyInstance;
    dir: jest.SpyInstance;
  };
  let performanceMark: jest.Mock;
  let performanceMeasure: jest.Mock;

  beforeEach(() => {
    // 保存原始环境变量
    originalEnv = process.env.NODE_ENV;
    
    // Mock console 方法
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      group: jest.spyOn(console, 'group').mockImplementation(),
      groupCollapsed: jest.spyOn(console, 'groupCollapsed').mockImplementation(),
      groupEnd: jest.spyOn(console, 'groupEnd').mockImplementation(),
      table: jest.spyOn(console, 'table').mockImplementation(),
      time: jest.spyOn(console, 'time').mockImplementation(),
      timeEnd: jest.spyOn(console, 'timeEnd').mockImplementation(),
      assert: jest.spyOn(console, 'assert').mockImplementation(),
      clear: jest.spyOn(console, 'clear').mockImplementation(),
      trace: jest.spyOn(console, 'trace').mockImplementation(),
      dir: jest.spyOn(console, 'dir').mockImplementation(),
    };

    // Mock performance API
    performanceMark = jest.fn();
    performanceMeasure = jest.fn();
    const performanceGetEntriesByName = jest.fn(() => [{ duration: 100 }]);
    
    global.performance = {
      now: jest.fn(() => Date.now()),
      mark: performanceMark,
      measure: performanceMeasure,
      getEntriesByName: performanceGetEntriesByName,
    } as unknown as Performance;
    
    // 确保 performance.measure 被识别为函数
    Object.defineProperty(global.performance, 'measure', {
      value: performanceMeasure,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.performance, 'mark', {
      value: performanceMark,
      writable: true,
      configurable: true,
    });

    // 重置配置为开发环境
    process.env.NODE_ENV = 'development';
    logger.setConfig({ enabled: true });
  });

  afterEach(() => {
    // 恢复环境变量
    process.env.NODE_ENV = originalEnv;
    
    // 恢复所有 console spy
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('basic logging methods', () => {
    it('should log messages with formatting', () => {
      logger.log('test message');
      
      expect(consoleSpy.log).toHaveBeenCalled();
      const callArgs = consoleSpy.log.mock.calls[0];
      expect(callArgs.length).toBeGreaterThan(1);
    });

    it('should info messages', () => {
      logger.info('info message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should warn messages', () => {
      logger.warn('warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should error messages', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should debug messages', () => {
      logger.debug('debug message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should get current config', () => {
      const config = logger.getConfig();
      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('showTimestamp');
      expect(config).toHaveProperty('showLevel');
      expect(config).toHaveProperty('levelPrefix');
    });

    it('should update config', () => {
      const newConfig: Partial<LoggerConfig> = {
        enabled: false,
        showTimestamp: false,
      };
      
      logger.setConfig(newConfig);
      const config = logger.getConfig();
      
      expect(config.enabled).toBe(false);
      expect(config.showTimestamp).toBe(false);
    });

    it('should not log when disabled', () => {
      logger.setConfig({ enabled: false });
      logger.log('should not appear');
      
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should always log errors even when disabled', () => {
      logger.setConfig({ enabled: false });
      logger.error('error should appear');
      
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('group methods', () => {
    it('should create a group', () => {
      logger.group('Test Group', () => {
        logger.log('inside group');
      });
      
      expect(consoleSpy.group).toHaveBeenCalledWith('Test Group');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should create a collapsed group', () => {
      logger.groupCollapsed('Collapsed Group', () => {
        logger.log('inside collapsed group');
      });
      
      expect(consoleSpy.groupCollapsed).toHaveBeenCalledWith('Collapsed Group');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    it('should execute callback even when disabled', () => {
      logger.setConfig({ enabled: false });
      const callback = jest.fn();
      
      logger.group('Test', callback);
      
      expect(callback).toHaveBeenCalled();
      expect(consoleSpy.group).not.toHaveBeenCalled();
    });
  });

  describe('performance timing', () => {
    it('should start a timer', () => {
      logger.time('test-timer');
      
      expect(consoleSpy.time).toHaveBeenCalledWith('test-timer');
    });

    it('should end a timer', () => {
      logger.time('test-timer');
      logger.timeEnd('test-timer');
      
      expect(consoleSpy.timeEnd).toHaveBeenCalledWith('test-timer');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should warn when ending non-existent timer', () => {
      logger.timeEnd('non-existent');
      
      expect(consoleSpy.warn).toHaveBeenCalled();
      const warnCall = consoleSpy.warn.mock.calls[0];
      expect(warnCall.some((arg) => typeof arg === 'string' && arg.includes('does not exist'))).toBe(true);
    });

    it('should warn when starting duplicate timer', () => {
      logger.time('duplicate');
      logger.time('duplicate');
      
      expect(consoleSpy.warn).toHaveBeenCalled();
      const warnCall = consoleSpy.warn.mock.calls[0];
      expect(warnCall.some((arg) => typeof arg === 'string' && arg.includes('already exists'))).toBe(true);
    });

    it('should not start timer when disabled', () => {
      logger.setConfig({ enabled: false });
      logger.time('test-timer');
      
      expect(consoleSpy.time).not.toHaveBeenCalled();
    });
  });

  describe('performance marks', () => {
    it('should create a mark', () => {
      logger.mark('test-mark');
      
      expect(performanceMark).toHaveBeenCalledWith('test-mark');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should measure between marks', () => {
      // 需要先创建标记
      performanceMark.mockClear();
      performanceMeasure.mockClear();
      
      logger.mark('start');
      logger.measure('test-measure', 'start');
      
      // measure 需要 startMark 存在，但我们的 mock 可能没有正确处理
      // 检查是否调用了 measure（即使可能因为 mock 问题而失败）
      expect(performanceMeasure).toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('should output table', () => {
      const data = [{ a: 1, b: 2 }];
      logger.table(data);
      
      expect(consoleSpy.table).toHaveBeenCalledWith(data, undefined);
    });

    it('should output table with columns', () => {
      const data = [{ a: 1, b: 2 }];
      const columns = ['a'];
      logger.table(data, columns);
      
      expect(consoleSpy.table).toHaveBeenCalledWith(data, columns);
    });

    it('should assert condition', () => {
      logger.assert(true, 'should not appear');
      logger.assert(false, 'should appear');
      
      expect(consoleSpy.assert).toHaveBeenCalledTimes(2);
    });

    it('should clear console', () => {
      logger.clear();
      expect(consoleSpy.clear).toHaveBeenCalled();
    });

    it('should trace stack', () => {
      logger.trace();
      expect(consoleSpy.trace).toHaveBeenCalled();
    });

    it('should trace with label', () => {
      logger.trace('test label');
      expect(consoleSpy.debug).toHaveBeenCalled();
      const debugCall = consoleSpy.debug.mock.calls[0];
      expect(debugCall.some((arg) => arg === 'test label')).toBe(true);
      expect(consoleSpy.trace).toHaveBeenCalled();
    });

    it('should output dir', () => {
      const obj = { test: 'value' };
      logger.dir(obj);
      expect(consoleSpy.dir).toHaveBeenCalledWith(obj, undefined);
    });

    it('should output json', () => {
      const obj = { test: 'value' };
      logger.json(obj);
      expect(consoleSpy.log).toHaveBeenCalledWith(JSON.stringify(obj, null, 2));
    });
  });

  describe('environment behavior', () => {
    it('should be enabled in development', () => {
      process.env.NODE_ENV = 'development';
      logger.setConfig({ enabled: true });
      
      logger.log('test');
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should respect disabled config in production', () => {
      process.env.NODE_ENV = 'production';
      logger.setConfig({ enabled: false });
      
      logger.log('test');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should always log errors in production', () => {
      process.env.NODE_ENV = 'production';
      logger.setConfig({ enabled: false });
      
      logger.error('error');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('formatting', () => {
    it('should include timestamp when enabled', () => {
      logger.setConfig({ showTimestamp: true, showLevel: false });
      logger.log('test');
      
      const callArgs = consoleSpy.log.mock.calls[0];
      expect(callArgs[0]).toMatch(/\[\d{2}:\d{2}:\d{2}\.\d{3}\]/);
    });

    it('should include level prefix when enabled', () => {
      logger.setConfig({ showTimestamp: false, showLevel: true });
      logger.log('test');
      
      const callArgs = consoleSpy.log.mock.calls[0];
      expect(callArgs[0]).toContain('[LOG]');
    });

    it('should format multiple arguments', () => {
      logger.log('arg1', 'arg2', { key: 'value' });
      
      const callArgs = consoleSpy.log.mock.calls[0];
      expect(callArgs.length).toBeGreaterThan(3);
    });
  });
});

