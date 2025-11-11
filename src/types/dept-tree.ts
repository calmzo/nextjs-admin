/**
 * 部门树形组件相关类型定义
 */

import logger from '@/utils/logger';

// 部门节点选项接口（用于下拉选择器）
export interface DeptNodeOption {
  value: number;
  label: string;
  parentId: number;
  children?: DeptNodeOption[];
}

// 部门节点基础接口
export interface DeptNode {
  id: number;
  name: string;
  code: string;
  parentId: number;
  sort: number;
  status: number;
  leader?: string;
  phone?: string;
  email?: string;
  createTime?: string | null;
  updateTime?: string | null;
  children?: DeptNode[];
  level?: number; // 层级深度
  isLeaf?: boolean; // 是否为叶子节点
  expanded?: boolean; // 是否展开
}

// 树形表格列配置
export interface TreeTableColumn {
  key: string;
  title: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: DeptNode, index: number) => React.ReactNode;
}

// 树形表格属性
export interface DeptTreeTableProps {
  data: DeptNode[];
  columns: TreeTableColumn[];
  loading?: boolean;
  defaultExpandedKeys?: number[];
  defaultExpandAll?: boolean;
  onNodeClick?: (node: DeptNode) => void;
  onNodeToggle?: (node: DeptNode, expanded: boolean) => void;
  onEdit?: (node: DeptNode) => void;
  onDelete?: (node: DeptNode) => void;
  onAdd?: (parentNode?: DeptNode) => void;
  onView?: (node: DeptNode) => void;
  onStatusChange?: (node: DeptNode, status: number) => void;
  showCheckbox?: boolean;
  onCheck?: (checkedKeys: number[], checkedNodes: DeptNode[]) => void;
  checkedKeys?: number[];
  className?: string;
  showActions?: boolean;
  showStatusToggle?: boolean;
}

// 树形选择器属性
export interface DeptTreeSelectorProps {
  data: DeptNode[];
  value?: number | number[];
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onChange?: (value: number | number[], node: DeptNode | DeptNode[]) => void;
  onSearch?: (value: string) => void;
  showSearch?: boolean;
  allowClear?: boolean;
  maxTagCount?: number;
  className?: string;
}

// 下拉树选择器属性
export interface DeptTreeDropdownProps {
  data: DeptNode[];
  value?: number | number[];
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onChange?: (value: number | number[], node: DeptNode | DeptNode[]) => void;
  onSearch?: (value: string) => void;
  showSearch?: boolean;
  allowClear?: boolean;
  maxTagCount?: number;
  dropdownStyle?: React.CSSProperties;
  className?: string;
}

// 树节点操作事件
export interface TreeNodeAction {
  type: 'add' | 'edit' | 'delete' | 'view';
  node: DeptNode;
}

// 树形组件通用配置
export interface TreeConfig {
  showIcon?: boolean;
  showLine?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  draggable?: boolean;
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: number[];
  defaultCheckedKeys?: number[];
  defaultSelectedKeys?: number[];
}

// 数据转换工具函数
export const convertDeptNodeOptionToDeptNode = (option: DeptNodeOption, level = 0): DeptNode => {
  // 验证输入数据
  if (!option || typeof option.value === 'undefined' || option.value === null) {
    logger.error('❌ convertDeptNodeOptionToDeptNode - 无效的选项:', option);
    throw new Error(`Invalid option: value is ${option?.value}`);
  }

  if (!option.label) {
    logger.error('❌ convertDeptNodeOptionToDeptNode - 缺少 label:', option);
    throw new Error(`Missing label for option with value ${option.value}`);
  }

  // 转换子节点
  let children: DeptNode[] | undefined = undefined;
  if (option.children && option.children.length > 0) {
    try {
      children = option.children.map((child) => {
        const childResult = convertDeptNodeOptionToDeptNode(child, level + 1);
        return childResult;
      });
    } catch (error) {
      logger.error('❌ convertDeptNodeOptionToDeptNode - 转换子节点时出错:', error);
      throw error;
    }
  }

  const result = {
    id: option.value,
    name: option.label,
    code: option.label, // 使用 label 作为 code
    parentId: option.parentId,
    sort: 0, // 默认排序
    status: 1, // 默认启用状态
    level,
    isLeaf: !option.children || option.children.length === 0,
    expanded: false,
    children
  };

  // 验证结果
  if (typeof result.id === 'undefined' || result.id === null) {
    logger.error('❌ convertDeptNodeOptionToDeptNode - 结果 id 无效:', result);
    throw new Error(`Result id is invalid: ${result.id}`);
  }

  return result;
};

// 批量转换函数
export const convertDeptNodeOptionsToDeptNodes = (options: DeptNodeOption[]): DeptNode[] => {
  try {
    const result = options.map((option, index) => {
      try {
        const converted = convertDeptNodeOptionToDeptNode(option);
        return converted;
      } catch (error) {
        logger.error(`❌ convertDeptNodeOptionsToDeptNodes - 选项 ${index} 转换失败:`, error);
        throw new Error(`Failed to convert option ${index}: ${error}`);
      }
    });

    return result;
  } catch (error) {
    logger.error('❌ convertDeptNodeOptionsToDeptNodes - 批量转换失败:', error);
    throw error;
  }
};
