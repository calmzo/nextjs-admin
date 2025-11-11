/**
 * 字典相关 hooks
 * 参考 vue3-element-admin 实现，提供持久化缓存和请求队列机制
 */

import { useState, useEffect, useCallback } from 'react';
import DictAPI, { DictItemPageVO } from '@/api/dict.api';
import { Storage } from '@/utils/storage';
import logger from '@/utils/logger';

const DICT_CACHE_KEY = 'dict_cache';

// 字典项缓存（内存缓存，用于快速访问）
const dictCache = new Map<string, DictItemPageVO[]>();

// 请求队列（防止重复请求）
const requestQueue = new Map<string, Promise<DictItemPageVO[]>>();

/**
 * 从 localStorage 初始化缓存
 */
const initializeCache = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const cachedData = Storage.get<Record<string, DictItemPageVO[]>>(DICT_CACHE_KEY, {});
    if (cachedData) {
      Object.entries(cachedData).forEach(([key, value]) => {
        dictCache.set(key, value);
      });
    }
  } catch (error) {
    logger.error('Failed to initialize dict cache from localStorage:', error);
  }
};

// 初始化时加载缓存
if (typeof window !== 'undefined') {
  initializeCache();
}

/**
 * 缓存字典数据
 * @param dictCode 字典编码
 * @param data 字典项列表
 */
const cacheDictItems = (dictCode: string, data: DictItemPageVO[]) => {
  dictCache.set(dictCode, data);
  
  // 同步到 localStorage
  try {
    const cachedData = Storage.get<Record<string, DictItemPageVO[]>>(DICT_CACHE_KEY, {}) || {};
    cachedData[dictCode] = data;
    Storage.set(DICT_CACHE_KEY, cachedData);
  } catch (error) {
    logger.error(`Failed to save dict cache for ${dictCode}:`, error);
  }
};

/**
 * 加载字典数据（如果缓存中没有则请求）
 * @param dictCode 字典编码
 */
const loadDictItems = async (dictCode: string): Promise<DictItemPageVO[]> => {
  if (!dictCode) return [];

  // 先检查内存缓存
  if (dictCache.has(dictCode)) {
    return dictCache.get(dictCode)!;
  }

  // 检查是否有正在进行的请求，如果有则等待该请求完成
  if (requestQueue.has(dictCode)) {
    return requestQueue.get(dictCode)!;
  }

  // 创建新的请求
  const requestPromise = DictAPI.getDictItems(dictCode)
    .then((data) => {
      cacheDictItems(dictCode, data);
      requestQueue.delete(dictCode);
      return data;
    })
    .catch((error) => {
      requestQueue.delete(dictCode);
      logger.error(`Failed to load dict items for ${dictCode}:`, error);
      throw error;
    });

  // 将请求加入队列
  requestQueue.set(dictCode, requestPromise);

  return requestPromise;
};

/**
 * 获取字典项列表（带缓存和请求队列）
 */
export const useDictItems = (dictCode: string) => {
  const [items, setItems] = useState<DictItemPageVO[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!dictCode) {
      setItems([]);
      return;
    }

    // 先检查缓存，如果有缓存直接返回，不设置 loading
    if (dictCache.has(dictCode)) {
      setItems(dictCache.get(dictCode)!);
      return;
    }

    // 检查是否有正在进行的请求
    if (requestQueue.has(dictCode)) {
      try {
        const cachedItems = await requestQueue.get(dictCode)!;
        setItems(cachedItems);
      } catch (error) {
        logger.error(`Failed to load dict items for ${dictCode}:`, error);
        setItems([]);
      }
      return;
    }

    // 创建新的请求
    setLoading(true);
    try {
      const itemsList = await loadDictItems(dictCode);
      setItems(itemsList);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dictCode]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, refetch: fetchItems };
};

/**
 * 根据字典编码和值获取字典项
 */
export const useDictItem = (dictCode: string, value: string | number | undefined) => {
  const { items } = useDictItems(dictCode);
  
  const dictItem = items.find(item => {
    // 支持字符串和数字比较（使用 == 匹配 vue3-element-admin 的行为）
    return String(item.value) == String(value);
  });

  return {
    label: dictItem?.label || '',
    tagType: dictItem?.tagType || undefined,
  };
};

/**
 * 移除指定字典缓存
 * @param dictCode 字典编码
 */
export const removeDictCache = (dictCode: string) => {
  dictCache.delete(dictCode);
  
  // 从 localStorage 中移除
  try {
    const cachedData = Storage.get<Record<string, DictItemPageVO[]>>(DICT_CACHE_KEY, {}) || {};
    delete cachedData[dictCode];
    Storage.set(DICT_CACHE_KEY, cachedData);
  } catch (error) {
    logger.error(`Failed to remove dict cache for ${dictCode}:`, error);
  }
};

/**
 * 清空所有字典缓存
 */
export const clearDictCache = () => {
  dictCache.clear();
  Storage.remove(DICT_CACHE_KEY);
};
