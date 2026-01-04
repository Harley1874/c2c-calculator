import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getServerPrice, forceRefreshPrice } from '../lib/api';
import { request } from '../lib/http';
import { CalculationHistory } from '@c2c/shared';
import { useAuth } from './AuthContext';

export type { CalculationHistory };

interface AppContextType {
  usdtPrice: number | null;
  customPrice: string;
  setCustomPrice: (price: string) => void;
  history: CalculationHistory[];
  loading: boolean;
  historyLoading: boolean;
  lastUpdated: Date | null;
  fetchData: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  saveHistoryRecord: (amount: string, name: string) => Promise<boolean>;
  clearHistory: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getActivePrice: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, setShowLoginModal } = useAuth();
  const [usdtPrice, setUsdtPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [history, setHistory] = useState<CalculationHistory[]>([]);

  // 加载历史记录 (仅当已登录)
  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const data = await request<any[]>('/records');
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
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
        fetchHistory();
    } else {
        setHistory([]); // 登出清空
    }
  }, [isAuthenticated, fetchHistory]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getServerPrice();
      if (res && res.price) {
        setUsdtPrice(res.price);
        setLastUpdated(new Date(res.updatedAt));
      }
    } catch (error) {
      console.error('Failed to fetch C2C price', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await forceRefreshPrice();
      if (res && res.price) {
        setUsdtPrice(res.price);
        setLastUpdated(new Date(res.updatedAt));
      }
    } catch (error) {
      console.error('Failed to force refresh C2C price', error);
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
    if (!isAuthenticated) {
        setShowLoginModal(true);
        return false;
    }

    const price = getActivePrice();
    if (isNaN(price) || price <= 0 || !amountStr) return false;
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) return false;

    const total = parseFloat((val * price).toFixed(2));

    try {
      await request('/records', {
        method: 'POST',
        body: JSON.stringify({
          amount: val.toString(),
          price: price.toString(),
          total: total.toString(),
          name: name.trim() || undefined,
        }),
      });

      await fetchHistory();
      return true;
    } catch (error) {
      console.error('Failed to save record:', error);
    }
    return false;
  };

  const clearHistory = async () => {
    console.log('clearHistory', isAuthenticated);
    if (!isAuthenticated) return;
    
    try {
      await request('/records', { method: 'DELETE' });
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await request(`/records/${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await request(`/records/${id}/favorite`, { method: 'PATCH' });
      setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      ));
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
      historyLoading,
      lastUpdated,
      fetchData,
      forceRefresh,
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
