import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getC2CList } from '../lib/api';
import { CalculationHistory } from '@c2c/shared';

export type { CalculationHistory };

interface AppContextType {
  usdtPrice: number | null;
  customPrice: string;
  setCustomPrice: (price: string) => void;
  history: CalculationHistory[];
  loading: boolean;
  lastUpdated: Date | null;
  fetchData: () => Promise<void>;
  saveHistoryRecord: (amount: string, name: string) => boolean;
  clearHistory: () => void;
  deleteItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getActivePrice: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usdtPrice, setUsdtPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    const saved = localStorage.getItem('c2c-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('c2c-history', JSON.stringify(history));
  }, [history]);

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

  const saveHistoryRecord = (amountStr: string, name: string) => {
    const price = getActivePrice();
    if (isNaN(price) || price <= 0 || !amountStr) return false;
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) return false;

    const newRecord: CalculationHistory = {
      id: Date.now().toString(),
      name: name.trim() || undefined,
      timestamp: Date.now(),
      price: price,
      amount: val,
      total: parseFloat((val * price).toFixed(2)),
      isFavorite: false,
    };
    setHistory(prev => [newRecord, ...prev]);
    return true;
  };

  const clearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      setHistory([]);
    }
  };

  const deleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
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

