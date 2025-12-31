import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getC2CList } from '../lib/api';
import { CalculationHistory } from '@c2c/shared';

export type { CalculationHistory };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AppContextType {
  usdtPrice: number | null;
  customPrice: string;
  setCustomPrice: (price: string) => void;
  history: CalculationHistory[];
  loading: boolean;
  lastUpdated: Date | null;
  fetchData: () => Promise<void>;
  saveHistoryRecord: (amount: string, name: string) => Promise<boolean>;
  clearHistory: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getActivePrice: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usdtPrice, setUsdtPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [history, setHistory] = useState<CalculationHistory[]>([]);

  // 加载历史记录
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/records`);
      if (res.ok) {
        const data = await res.json();
        // 转换数据格式以匹配 CalculationHistory
        const formatted: CalculationHistory[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          timestamp: new Date(item.createdAt).getTime(),
          price: Number(item.price),
          amount: Number(item.amount),
          total: Number(item.total),
          isFavorite: item.isFavorite,
        }));
        setHistory(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getC2CList();
      if (res.data && res.data.length > 0) {
        const bestPrice = res.data.reduce((max: number, item: any) => {
          return Math.max(max, Number(item.adv.price));
        }, 0);
        setUsdtPrice(bestPrice);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch C2C list', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getActivePrice = useCallback(() => {
    if (customPrice) return parseFloat(customPrice);
    return usdtPrice || 0;
  }, [customPrice, usdtPrice]);

  const saveHistoryRecord = async (amountStr: string, name: string) => {
    const price = getActivePrice();
    if (isNaN(price) || price <= 0 || !amountStr) return false;
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) return false;

    const total = parseFloat((val * price).toFixed(2));

    try {
      const res = await fetch(`${API_URL}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: val.toString(),
          price: price.toString(),
          total: total.toString(),
          name: name.trim() || undefined,
        }),
      });

      if (res.ok) {
        await fetchHistory(); // 重新加载列表
        return true;
      }
    } catch (error) {
      console.error('Failed to save record:', error);
    }
    return false;
  };

  const clearHistory = async () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      try {
        const res = await fetch(`${API_URL}/records`, { method: 'DELETE' });
        if (res.ok) {
          setHistory([]);
        }
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/records/${id}/favorite`, { method: 'PATCH' });
      if (res.ok) {
        setHistory(prev => prev.map(item => 
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        ));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      usdtPrice,
      customPrice,
      setCustomPrice,
      history,
      loading,
      lastUpdated,
      fetchData,
      saveHistoryRecord,
      clearHistory,
      deleteItem,
      toggleFavorite,
      getActivePrice,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
