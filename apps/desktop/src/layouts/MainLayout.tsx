import { Outlet, NavLink } from 'react-router-dom';
import {
  Calculator,
  History,
  Star,
  TrendingUp,
  LogOut,
  User as UserIcon,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
export default function MainLayout() {
  const { user, logout, setShowLoginModal, isAuthenticated } = useAuth();

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
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`
            }
          >
            <Calculator className="w-5 h-5" />
            计算器
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`
            }
          >
            <History className="w-5 h-5" />
            历史记录
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`
            }
          >
            <Star className="w-5 h-5" />
            我的收藏
          </NavLink>
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={user.username}>
                    {user.username}
                  </p>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                className="text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                size="icon"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              登录 / 注册
            </Button>
          )}
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
