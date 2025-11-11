import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTreeDropdownOptions<TNode> {
  data: TNode[];
  value?: number | null;
  disabled?: boolean;
  onChange?: (value: number, node?: TNode) => void;
  onSearch?: (keyword: string) => void;
  getNodeId: (node: TNode) => number;
  getChildren: (node: TNode) => TNode[] | undefined;
  matchSearch: (node: TNode, keyword: string) => boolean;
}

export interface UseTreeDropdownResult<TNode> {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  expandedKeys: Set<number>;
  toggleExpand: (node: TNode, e?: React.MouseEvent) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  filteredData: TNode[];
  selectedNode: TNode | null;
  setSelectedNode: (node: TNode | null) => void;
  handleNodeSelect: (node: TNode) => void;
  handleClear: (e: React.MouseEvent) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useTreeDropdown<TNode>(options: UseTreeDropdownOptions<TNode>): UseTreeDropdownResult<TNode> {
  const {
    data,
    value,
    disabled = false,
    onChange,
    onSearch,
    getNodeId,
    getChildren,
    matchSearch,
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState<TNode[]>(data);
  const [selectedNode, setSelectedNode] = useState<TNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 稳定函数引用，避免依赖项因函数身份变化导致的重复触发
  const getChildrenRef = useRef(getChildren);
  const getNodeIdRef = useRef(getNodeId);
  const matchSearchRef = useRef(matchSearch);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    getChildrenRef.current = getChildren;
  }, [getChildren]);
  useEffect(() => {
    getNodeIdRef.current = getNodeId;
  }, [getNodeId]);
  useEffect(() => {
    matchSearchRef.current = matchSearch;
  }, [matchSearch]);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // 根据 value 查找选中的节点
  useEffect(() => {
    if (value !== undefined && value !== null && value !== 0) {
      const findNode = (nodes: TNode[], targetValue: number): TNode | null => {
        for (const node of nodes) {
          if (getNodeIdRef.current(node) === targetValue) {
            return node;
          }
          const children = getChildrenRef.current(node);
          if (children && children.length) {
            const found = findNode(children, targetValue);
            if (found) return found;
          }
        }
        return null;
      };
      setSelectedNode(findNode(data, value as number));
    } else {
      setSelectedNode(null);
    }
  }, [value, data]);

  // 搜索过滤
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredData(data);
      return;
    }

    const filterNodes = (nodes: TNode[]): TNode[] => {
      return nodes.reduce((acc: TNode[], node) => {
        const matchesSearch = matchSearchRef.current(node, searchValue);
        const children = getChildrenRef.current(node);

        if (matchesSearch) {
          acc.push({ ...(node as unknown as object), children: children ? filterNodes(children) : [] } as TNode);
        } else if (children && children.length) {
          const filteredChildren = filterNodes(children);
          if (filteredChildren.length > 0) {
            acc.push({ ...(node as unknown as object), children: filteredChildren } as TNode);
          }
        }
        return acc;
      }, []);
    };

    setFilteredData(filterNodes(data));
    onSearchRef.current?.(searchValue);
  }, [searchValue, data]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpand = useCallback((node: TNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const key = getNodeIdRef.current(node);
    const next = new Set(expandedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setExpandedKeys(next);
  }, [expandedKeys]);

  const handleNodeSelect = useCallback((node: TNode) => {
    if (disabled) return;
    setSelectedNode(node);
    setIsOpen(false);
    onChange?.(getNodeIdRef.current(node), node);
  }, [disabled, onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setSelectedNode(null);
    onChange?.(0, undefined as unknown as TNode);
  }, [disabled, onChange]);

  return {
    isOpen,
    setIsOpen,
    expandedKeys,
    toggleExpand,
    searchValue,
    setSearchValue,
    filteredData,
    selectedNode,
    setSelectedNode,
    handleNodeSelect,
    handleClear,
    containerRef,
  };
}


