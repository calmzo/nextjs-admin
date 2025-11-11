/**
 * 树形组件导出文件
 */

export { default as DeptTreeTable } from './DeptTreeTable';
export { default as DeptTreeSelector } from './DeptTreeSelector';
export { default as DeptTreeDropdown } from './DeptTreeDropdown';
export { default as MenuTreeTable } from './MenuTreeTable';

// 导出类型
export type {
  DeptNode,
  TreeTableColumn,
  DeptTreeTableProps,
  DeptTreeSelectorProps,
  DeptTreeDropdownProps,
  TreeNodeAction,
  TreeConfig,
} from '@/types/dept-tree';

export type {
  MenuNode,
  MenuTreeTableColumn,
  MenuTreeTableProps,
  MenuTreeSelectorProps,
  MenuTreeNodeAction,
} from '@/types/menu-tree';
