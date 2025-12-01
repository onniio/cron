import Dexie, { Table } from 'dexie';

export interface CronHistory {
  id?: number;
  expression: string;
  description: string;
  timezone: string;
  dialect: string;
  createdAt: Date;
  isFavorite?: boolean;
  tags?: string[];
}

export class CronDatabase extends Dexie {
  history!: Table<CronHistory>;

  constructor() {
    super('CronGuruDB');
    this.version(1).stores({
      history: '++id, expression, createdAt, isFavorite'
    });
  }
}

export const db = new CronDatabase();

// 历史记录相关操作
export const addToHistory = async (item: Omit<CronHistory, 'id' | 'createdAt'>) => {
  // 检查是否已存在相同表达式
  const existing = await db.history
    .where('expression')
    .equals(item.expression)
    .first();

  if (existing) {
    // 更新时间
    await db.history.update(existing.id!, { createdAt: new Date() });
    return existing.id;
  }

  // 添加新记录
  return await db.history.add({
    ...item,
    createdAt: new Date()
  });
};

export const getHistory = async (limit: number = 20) => {
  return await db.history
    .orderBy('createdAt')
    .reverse()
    .limit(limit)
    .toArray();
};

export const getFavorites = async () => {
  return await db.history
    .where('isFavorite')
    .equals(1)
    .toArray();
};

export const toggleFavorite = async (id: number) => {
  const item = await db.history.get(id);
  if (item) {
    await db.history.update(id, { isFavorite: !item.isFavorite });
  }
};

export const deleteHistoryItem = async (id: number) => {
  await db.history.delete(id);
};

export const clearHistory = async () => {
  await db.history.clear();
};
