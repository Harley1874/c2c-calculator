import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function CalculatorPage() {
  const {
    usdtPrice,
    customPrice,
    setCustomPrice,
    loading,
    lastUpdated,
    fetchData,
    getActivePrice,
    saveHistoryRecord,
  } = useApp();

  const [amount, setAmount] = useState<string>('');
  const [recordName, setRecordName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Clean up timeout
  useEffect(() => {
    // No cleanup needed anymore
  }, []);

  const calculateValue = () => {
    const price = getActivePrice();
    if (isNaN(price) || !amount) return 0;
    return (parseFloat(amount) * price).toFixed(2);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const success = await saveHistoryRecord(amount, recordName);

      if (success) {
        setAmount('');
        setRecordName('');
        toast.success('记录已保存');

        // Focus amount input
        const amountInput = document.getElementById('amount-input');
        if (amountInput) amountInput.focus();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold mb-2">汇率计算</h2>
          <p className="text-neutral-500">实时拉取C2C价格进行计算</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          loading={loading}
          className="gap-2"
        >
          {!loading && <RefreshCw className="w-4 h-4" />}
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
                  step="any"
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
              <div className="text-sm text-neutral-400 pl-8">(实时汇率: ¥{usdtPrice})</div>
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
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">数量 (USDT)</label>
            <Input
              id="amount-input"
              type="number"
              step="any"
              placeholder="输入 USDT 数量"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg mt-2"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">预估价值 (CNY)</label>
            <Input
              type="text"
              placeholder="预估价值"
              value={calculateValue()}
              className="text-lg bg-neutral-50 dark:bg-neutral-900 mt-2 text-blue-600"
              readOnly
              tabIndex={-1}
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <Input
              type="text"
              placeholder="记录名称 (可选)"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
              className=""
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              type="submit"
              loading={isSaving}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
            >
              保存到记录
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
