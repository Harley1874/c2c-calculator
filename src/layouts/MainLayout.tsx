import { Outlet, NavLink } from 'react-router-dom';
import { Calculator, History, Star, TrendingUp } from 'lucide-react';

export default function MainLayout() {
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
          <NavLink
            to="/"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Calculator className="w-5 h-5" />
            计算器
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <History className="w-5 h-5" />
            历史记录
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Star className="w-5 h-5" />
            我的收藏
          </NavLink>
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-xs text-neutral-500 text-center">Based on Binance C2C</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

