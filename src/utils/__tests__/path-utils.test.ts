/**
 * 路径工具函数测试
 */

import {
  convertComponentToPath,
  convertPathToComponent,
  isPathMatch,
  getParentPath,
  getPathDepth,
} from '@/utils/path-utils';

describe('path-utils', () => {
  describe('convertComponentToPath', () => {
    it('应该将组件路径转换为路由路径', () => {
      expect(convertComponentToPath('system/dept/index')).toBe('/system/dept');
      expect(convertComponentToPath('system/user/index')).toBe('/system/user');
      expect(convertComponentToPath('system/index')).toBe('/system');
    });

    it('应该处理已包含 /index 的路径', () => {
      expect(convertComponentToPath('/system/dept/index')).toBe('/system/dept');
    });

    it('应该处理不以 /index 结尾的路径', () => {
      expect(convertComponentToPath('system/dept')).toBe('/system/dept');
      expect(convertComponentToPath('/system/dept')).toBe('/system/dept');
    });

    it('应该处理空字符串', () => {
      expect(convertComponentToPath('')).toBe('');
    });

    it('应该确保路径以 / 开头', () => {
      expect(convertComponentToPath('system/dept/index')).toBe('/system/dept');
      expect(convertComponentToPath('/system/dept/index')).toBe('/system/dept');
    });
  });

  describe('convertPathToComponent', () => {
    it('应该将路由路径转换为组件路径', () => {
      expect(convertPathToComponent('/system/dept')).toBe('system/dept/index');
      expect(convertPathToComponent('/system/user')).toBe('system/user/index');
      expect(convertPathToComponent('/system')).toBe('system/index');
    });

    it('应该处理不以 / 开头的路径', () => {
      expect(convertPathToComponent('system/dept')).toBe('system/dept/index');
    });

    it('应该处理空字符串', () => {
      expect(convertPathToComponent('')).toBe('');
    });

    it('应该添加 /index 后缀', () => {
      expect(convertPathToComponent('/system/dept')).toBe('system/dept/index');
      expect(convertPathToComponent('/system')).toBe('system/index');
    });
  });

  describe('isPathMatch', () => {
    it('应该精确匹配相同路径', () => {
      expect(isPathMatch('/system/dept', '/system/dept')).toBe(true);
      expect(isPathMatch('/system/user', '/system/user')).toBe(true);
    });

    it('应该匹配子路径', () => {
      expect(isPathMatch('/system/dept/list', '/system/dept')).toBe(true);
      expect(isPathMatch('/system/user/edit', '/system/user')).toBe(true);
    });

    it('应该特殊处理 /system 路径', () => {
      expect(isPathMatch('/system/dept', '/system')).toBe(true);
      expect(isPathMatch('/system/user', '/system')).toBe(true);
      expect(isPathMatch('/system', '/system')).toBe(true);
    });

    it('应该不匹配不相关的路径', () => {
      expect(isPathMatch('/system/dept', '/system/user')).toBe(false);
      expect(isPathMatch('/system/dept', '/dashboard')).toBe(false);
      expect(isPathMatch('/system', '/dashboard')).toBe(false);
    });

    it('应该不匹配父路径', () => {
      expect(isPathMatch('/system', '/system/dept')).toBe(false);
    });
  });

  describe('getParentPath', () => {
    it('应该返回父级路径', () => {
      expect(getParentPath('/system/dept')).toBe('/system');
      expect(getParentPath('/system/dept/list')).toBe('/system/dept');
      expect(getParentPath('/system/user/edit')).toBe('/system/user');
    });

    it('应该处理根路径', () => {
      expect(getParentPath('/')).toBe('/');
      expect(getParentPath('')).toBe('/');
    });

    it('应该处理单级路径', () => {
      expect(getParentPath('/system')).toBe('/');
    });

    it('应该处理多级路径', () => {
      expect(getParentPath('/system/dept/user')).toBe('/system/dept');
      expect(getParentPath('/a/b/c/d')).toBe('/a/b/c');
    });
  });

  describe('getPathDepth', () => {
    it('应该返回路径的层级深度', () => {
      expect(getPathDepth('/system')).toBe(1);
      expect(getPathDepth('/system/dept')).toBe(2);
      expect(getPathDepth('/system/dept/list')).toBe(3);
    });

    it('应该处理根路径', () => {
      expect(getPathDepth('/')).toBe(0);
      expect(getPathDepth('')).toBe(0);
    });

    it('应该处理多级路径', () => {
      expect(getPathDepth('/a/b/c/d')).toBe(4);
      expect(getPathDepth('/system/user/edit')).toBe(3);
    });

    it('应该忽略末尾的斜杠', () => {
      expect(getPathDepth('/system/')).toBe(1);
      expect(getPathDepth('/system/dept/')).toBe(2);
    });
  });
});

