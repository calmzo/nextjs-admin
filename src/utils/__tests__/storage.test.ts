/**
 * Storage 工具类测试
 */

import { Storage } from '@/utils/storage';

// Mock logger
jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

describe('Storage', () => {
  beforeEach(() => {
    // 每个测试前清除所有存储
    // 先手动清除所有带前缀的键，再清除所有
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('nextjs_admin_')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('应该保存值到 localStorage', () => {
      Storage.set('test-key', 'test-value');
      expect(localStorage.getItem('nextjs_admin_test-key')).toBe('"test-value"');
    });

    it('应该序列化对象', () => {
      const obj = { name: 'test', age: 20 };
      Storage.set('test-obj', obj);
      expect(localStorage.getItem('nextjs_admin_test-obj')).toBe(JSON.stringify(obj));
    });

    it('应该序列化数组', () => {
      const arr = [1, 2, 3];
      Storage.set('test-arr', arr);
      expect(localStorage.getItem('nextjs_admin_test-arr')).toBe(JSON.stringify(arr));
    });

    it('应该在服务器端环境不执行', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server-side environment where window is undefined
      delete global.window;
      
      Storage.set('test-key', 'test-value');
      // 不应该抛出错误
      
      global.window = originalWindow;
    });

    it('应该在序列化失败时记录错误', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const logger = require('@/utils/logger').default;
      interface CircularObj {
        self?: CircularObj;
      }
      const circularObj: CircularObj = {};
      circularObj.self = circularObj;
      
      Storage.set('circular', circularObj);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('应该从 localStorage 获取值', () => {
      localStorage.setItem('nextjs_admin_test-key', '"test-value"');
      expect(Storage.get('test-key')).toBe('test-value');
    });

    it('应该反序列化对象', () => {
      const obj = { name: 'test', age: 20 };
      localStorage.setItem('nextjs_admin_test-obj', JSON.stringify(obj));
      expect(Storage.get('test-obj')).toEqual(obj);
    });

    it('应该反序列化数组', () => {
      const arr = [1, 2, 3];
      localStorage.setItem('nextjs_admin_test-arr', JSON.stringify(arr));
      expect(Storage.get('test-arr')).toEqual(arr);
    });

    it('应该返回默认值当键不存在时', () => {
      expect(Storage.get('non-existent', 'default')).toBe('default');
      expect(Storage.get('non-existent', { name: 'default' })).toEqual({ name: 'default' });
    });

    it('应该返回 undefined 当键不存在且没有默认值时', () => {
      expect(Storage.get('non-existent')).toBeUndefined();
    });

    it('应该在服务器端环境返回默认值', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server-side environment where window is undefined
      delete global.window;
      
      expect(Storage.get('test-key', 'default')).toBe('default');
      
      global.window = originalWindow;
    });

    it('应该在反序列化失败时记录错误并返回默认值', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const logger = require('@/utils/logger').default;
      localStorage.setItem('nextjs_admin_invalid-json', 'invalid json');
      
      const result = Storage.get('invalid-json', 'default');
      expect(result).toBe('default');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('应该移除指定的键', () => {
      localStorage.setItem('nextjs_admin_test-key', 'value');
      Storage.remove('test-key');
      expect(localStorage.getItem('nextjs_admin_test-key')).toBeNull();
    });

    it('应该只移除带前缀的键', () => {
      localStorage.setItem('nextjs_admin_test-key', 'value');
      localStorage.setItem('other-key', 'value');
      Storage.remove('test-key');
      expect(localStorage.getItem('nextjs_admin_test-key')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('value');
    });

    it('应该在服务器端环境不执行', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server-side environment where window is undefined
      delete global.window;
      
      Storage.remove('test-key');
      // 不应该抛出错误
      
      global.window = originalWindow;
    });
  });

  describe('clear', () => {
    it('应该清除所有带前缀的存储值', () => {
      // 先清理，确保测试环境干净
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => localStorage.removeItem(key));
      
      // 使用 Storage.set 来设置值，确保使用正确的键格式
      Storage.set('key1', 'value1');
      Storage.set('key2', 'value2');
      localStorage.setItem('other-key', 'value');
      
      // 验证设置成功
      expect(Storage.get('key1')).toBe('value1');
      expect(Storage.get('key2')).toBe('value2');
      expect(localStorage.getItem('other-key')).toBe('value');
      
      // 验证键确实存在
      expect(localStorage.getItem('nextjs_admin_key1')).toBe('"value1"');
      expect(localStorage.getItem('nextjs_admin_key2')).toBe('"value2"');
      
      Storage.clear();
      
      // 验证带前缀的键已被清除
      expect(localStorage.getItem('nextjs_admin_key1')).toBeNull();
      expect(localStorage.getItem('nextjs_admin_key2')).toBeNull();
      // 验证其他键未被清除
      expect(localStorage.getItem('other-key')).toBe('value');
      
      // 验证通过 Storage.get 也获取不到
      expect(Storage.get('key1')).toBeUndefined();
      expect(Storage.get('key2')).toBeUndefined();
    });

    it('应该在服务器端环境不执行', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server-side environment where window is undefined
      delete global.window;
      
      Storage.clear();
      // 不应该抛出错误
      
      global.window = originalWindow;
    });

    it('应该只清除带前缀的键', () => {
      // 先清理，确保测试环境干净
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => localStorage.removeItem(key));
      
      // 使用 Storage.set 来设置值，确保使用正确的键格式
      Storage.set('key1', 'value1');
      // prefix_key2 不是以 nextjs_admin_ 开头，所以不应该被清除
      localStorage.setItem('prefix_key2', 'value2');
      localStorage.setItem('other-key', 'value');
      
      // 验证设置成功
      expect(Storage.get('key1')).toBe('value1');
      expect(localStorage.getItem('prefix_key2')).toBe('value2');
      expect(localStorage.getItem('other-key')).toBe('value');
      
      // 验证键确实存在
      expect(localStorage.getItem('nextjs_admin_key1')).toBe('"value1"');
      
      Storage.clear();
      
      // 验证带前缀的键已被清除
      expect(localStorage.getItem('nextjs_admin_key1')).toBeNull();
      // prefix_key2 和 other-key 不应该被清除
      expect(localStorage.getItem('prefix_key2')).toBe('value2');
      expect(localStorage.getItem('other-key')).toBe('value');
      
      // 验证通过 Storage.get 也获取不到
      expect(Storage.get('key1')).toBeUndefined();
    });
  });
});

