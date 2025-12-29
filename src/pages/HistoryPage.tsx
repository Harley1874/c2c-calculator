import { Button } from '../components/ui/button';
import { Trash2, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HistoryPage() {
  const { history, clearHistory, deleteItem, toggleFavorite } = useApp();

  return (
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
            <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_100px] p-4 text-sm font-medium text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50">
              <div>时间</div>
              <div>名称</div>
              <div>单价</div>
              <div>数量 (USDT)</div>
              <div className="text-right">总价 (CNY)</div>
              <div className="text-right">操作</div>
            </div>
            {history.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_100px] p-4 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors items-center"
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
                <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${item.isFavorite ? 'text-yellow-500' : 'text-neutral-400'}`}
                      title={item.isFavorite ? "取消收藏" : "收藏"}
                    >
                      <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

