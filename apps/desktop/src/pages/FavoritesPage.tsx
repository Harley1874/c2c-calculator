import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Trash2, Star, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FavoritesPage() {
  const { history, deleteItem, toggleFavorite, historyLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredFavorites = history
    .filter(item => item.isFavorite)
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (item.name?.toLowerCase().includes(q)) ||
        item.amount.toString().includes(q) ||
        item.price.toString().includes(q) ||
        item.total.toString().includes(q)
      );
    });

  const totalPages = Math.ceil(filteredFavorites.length / ITEMS_PER_PAGE);
  const currentFavorites = filteredFavorites.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold">我的收藏</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input 
            placeholder="搜索记录..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-white dark:bg-neutral-800"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {historyLoading ? (
          <div className="p-12 flex justify-center items-center text-neutral-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>加载中...</span>
          </div>
        ) : currentFavorites.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            {searchQuery ? '没有找到匹配的收藏记录' : '暂无收藏记录'}
          </div>
        ) : (
          <>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_100px] p-4 text-sm font-medium text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50">
                <div>时间</div>
                <div>名称</div>
                <div>单价</div>
                <div>数量 (USDT)</div>
                <div className="text-right">总价 (CNY)</div>
                <div className="text-right">操作</div>
              </div>
              {currentFavorites.map((item) => (
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
                        className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-yellow-500"
                        title="取消收藏"
                      >
                        <Star className="w-4 h-4 fill-current" />
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <div className="text-sm text-neutral-500">
                  第 {page} 页 / 共 {totalPages} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

