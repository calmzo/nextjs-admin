/**
 * 菜单树形组件相关类型定义
 */

// 菜单节点选项接口（用于下拉选择器）
export interface MenuNodeOption {
  value: number;
  label: string;
  parentId: number;
  children?: MenuNodeOption[];
}

// 菜单节点基础接口
export interface MenuNode {
  id: number;
  name: string;
  path: string; // 路由路径（兼容 routePath）
  routeName?: string; // 路由名称
  routePath?: string; // 路由路径（后端返回）
  component?: string; // 组件路径
  icon?: string;
  type: number | string; // 菜单类型：1/CATALOG-目录, 2/MENU-菜单, 3/BUTTON-按钮, EXTLINK-外链
  parentId: number;
  sort: number;
  status: number;
  visible: number; // 是否显示: 1-显示, 0-隐藏
  perm?: string; // 权限标识
  createTime?: string | null;
  updateTime?: string | null;
  children?: MenuNode[];
  level?: number; // 层级深度
  isLeaf?: boolean; // 是否为叶子节点
  expanded?: boolean; // 是否展开
}

// 树形表格列配置
export interface MenuTreeTableColumn {
  key: string;
  title: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: MenuNode, index: number) => React.ReactNode;
}

// 树形表格属性
export interface MenuTreeTableProps {
  data: MenuNode[];
  columns: MenuTreeTableColumn[];
  loading?: boolean;
  defaultExpandedKeys?: number[];
  onNodeClick?: (node: MenuNode) => void;
  onNodeToggle?: (node: MenuNode, expanded: boolean) => void;
  onEdit?: (node: MenuNode) => void;
  onDelete?: (node: MenuNode) => void;
  onAdd?: (parentNode?: MenuNode) => void;
  onView?: (node: MenuNode) => void;
  onStatusChange?: (node: MenuNode, status: number) => void;
  showCheckbox?: boolean;
  onCheck?: (checkedKeys: number[], checkedNodes: MenuNode[]) => void;
  checkedKeys?: number[];
  className?: string;
  showActions?: boolean;
  showStatusToggle?: boolean;
}

// 树形选择器属性
export interface MenuTreeSelectorProps {
  data: MenuNode[];
  value?: number | number[];
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onChange?: (value: number | number[], node: MenuNode | MenuNode[]) => void;
  onSearch?: (value: string) => void;
  showSearch?: boolean;
  allowClear?: boolean;
  maxTagCount?: number;
  className?: string;
}

// 树节点操作事件
export interface MenuTreeNodeAction {
  type: 'add' | 'edit' | 'delete' | 'view';
  node: MenuNode;
}

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 1, // 目录
  MENU = 2,      // 菜单
  EXTLINK = 3,   // 外链
  BUTTON = 4     // 按钮
}

// 菜单类型字符串枚举（后端返回）
export enum MenuTypeString {
  CATALOG = 'CATALOG',   // 目录
  MENU = 'MENU',         // 菜单
  BUTTON = 'BUTTON',     // 按钮
  EXTLINK = 'EXTLINK'    // 外链
}

// 将字符串类型转换为数字类型
export const convertMenuTypeToString = (type: number | string): string => {
  if (typeof type === 'string') {
    return type;
  }
  switch (type) {
    case MenuType.DIRECTORY:
      return MenuTypeString.CATALOG;
    case MenuType.MENU:
      return MenuTypeString.MENU;
    case MenuType.EXTLINK:
      return MenuTypeString.EXTLINK;
    case MenuType.BUTTON:
      return MenuTypeString.BUTTON;
    default:
      return '';
  }
};

// 将字符串类型转换为数字类型
export const convertMenuTypeToNumber = (type: number | string): number => {
  if (typeof type === 'number') {
    return type;
  }
  switch (type) {
    case MenuTypeString.CATALOG:
      return MenuType.DIRECTORY;
    case MenuTypeString.MENU:
      return MenuType.MENU;
    case MenuTypeString.EXTLINK:
      return MenuType.EXTLINK;
    case MenuTypeString.BUTTON:
      return MenuType.BUTTON;
    default:
      return MenuType.DIRECTORY;
  }
};

// 数据转换工具函数
export const convertMenuNodeOptionToMenuNode = (option: MenuNodeOption, level = 0): MenuNode => {
  // 验证输入数据
  if (!option || typeof option.value === 'undefined' || option.value === null) {
    throw new Error(`Invalid option: value is ${option?.value}`);
  }

  if (!option.label) {
    throw new Error(`Missing label for option with value ${option.value}`);
  }

  // 转换子节点
  let children: MenuNode[] | undefined = undefined;
  if (option.children && option.children.length > 0) {
    children = option.children.map((child) => {
      return convertMenuNodeOptionToMenuNode(child, level + 1);
    });
  }

  return {
    id: option.value,
    name: option.label,
    path: '',
    type: MenuType.DIRECTORY,
    parentId: option.parentId,
    sort: 0,
    status: 1,
    visible: 1,
    level,
    isLeaf: !option.children || option.children.length === 0,
    expanded: false,
    children
  };
};

// 批量转换函数
export const convertMenuNodeOptionsToMenuNodes = (options: MenuNodeOption[]): MenuNode[] => {
  return options.map((option) => {
    return convertMenuNodeOptionToMenuNode(option);
  });
};

