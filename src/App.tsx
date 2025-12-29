import { useState, useEffect } from 'react';
import { getC2CList } from './lib/api';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Calculator, History, RefreshCw, Trash2, TrendingUp } from 'lucide-react';

interface CalculationHistory {
  id: string;
  name?: string;
  timestamp: number;
  price: number;
  amount: number;
  total: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');
  const [usdtPrice, setUsdtPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [recordName, setRecordName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    const saved = localStorage.getItem('c2c-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getC2CList();
      if (res.data && res.data.length > 0) {
        // 获取最高价格
        const bestPrice = res.data.reduce((max: number, item: Types.C2C.AdItem) => {
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
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('c2c-history', JSON.stringify(history));
  }, [history]);

  const getActivePrice = () => {
    if (customPrice) return parseFloat(customPrice);
    return usdtPrice || 0;
  };

  const calculateValue = () => {
    const price = getActivePrice();
    if (isNaN(price) || !amount) return 0;
    return (parseFloat(amount) * price).toFixed(2);
  };

  const saveHistory = () => {
    const price = getActivePrice();
    if (isNaN(price) || price <= 0 || !amount) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const newRecord: CalculationHistory = {
      id: Date.now().toString(),
      name: recordName.trim() || undefined,
      timestamp: Date.now(),
      price: price,
      amount: val,
      total: parseFloat((val * price).toFixed(2)),
    };
    setHistory([newRecord, ...history]);
    setRecordName('');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            C2C Calculator
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Calculator className="w-5 h-5" />
            计算器
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <History className="w-5 h-5" />
            历史记录
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-xs text-neutral-500 text-center">Based on Binance C2C</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {activeTab === 'calculator' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold mb-2">汇率计算</h2>
                  <p className="text-neutral-500">实时拉取币安C2C价格进行计算</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  刷新汇率
                </Button>
              </div>

              {/* Price Card */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-neutral-500">当前计算单价 (CNY)</div>
                      {customPrice ? (
                        <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                          自定义
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                          实时汇率
                        </span>
                      )}
                    </div>
                    
                    <div className="relative group">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl md:text-4xl font-bold text-blue-600 select-none">¥</span>
                        <Input
                          type="number"
                          placeholder={usdtPrice ? usdtPrice.toString() : '0.00'}
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          className="text-5xl md:text-6xl font-mono font-bold text-blue-600 bg-transparent border-none shadow-none p-0 h-auto w-full max-w-[400px] focus-visible:ring-0 placeholder:text-blue-600 focus:placeholder:text-blue-600/30 transition-all"
                        />
                      </div>
                      
                      {!customPrice && (
                        <div className="absolute -bottom-5 left-8 text-xs text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          点击输入自定义价格
                        </div>
                      )}
                    </div>

                    {customPrice && usdtPrice && (
                      <div className="text-sm text-neutral-400 pl-8">
                        (实时汇率: ¥{usdtPrice})
                      </div>
                    )}
                  </div>

                  {lastUpdated && (
                    <div className="text-xs text-neutral-400 pb-2">
                      更新时间: {lastUpdated.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Calculation Form */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">数量 (USDT)</label>
                    <Input
                      type="number"
                      placeholder="输入 USDT 数量"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">预估价值 (CNY)</label>
                    <Input
                      type="text"
                      placeholder="预估价值"
                      value={calculateValue()}
                      disabled
                      className="text-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full space-y-2">
                    <Input
                      type="text"
                      placeholder="记录名称 (可选)"
                      value={recordName}
                      onChange={(e) => setRecordName(e.target.value)}
                      className=""
                    />
                  </div>
                  <Button
                    onClick={saveHistory}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                  >
                    保存到记录
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">历史记录</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空
                </Button>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                {history.length === 0 ? (
                  <div className="p-12 text-center text-neutral-500">暂无记录</div>
                ) : (
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    <div className="grid grid-cols-5 p-4 text-sm font-medium text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50">
                      <div>时间</div>
                      <div>名称</div>
                      <div>单价</div>
                      <div>数量 (USDT)</div>
                      <div className="text-right">总价 (CNY)</div>
                    </div>
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-5 p-4 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors items-center"
                      >
                        <div className="text-neutral-500 text-xs">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                        <div className="text-neutral-900 dark:text-neutral-100 font-medium truncate pr-2" title={item.name}>
                          {item.name || '-'}
                        </div>
                        <div className="font-mono">¥{item.price}</div>
                        <div className="font-mono">{item.amount}</div>
                        <div className="font-mono text-right font-bold text-blue-600">
                          ¥{item.total.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
