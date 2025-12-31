import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X } from 'lucide-react';

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!showLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username.length < 3 || password.length < 3) {
        setError('用户名和密码至少需要3个字符');
        return;
    }

    const success = isLogin 
      ? await login({ username, password })
      : await register({ username, password });

    if (!success) {
      setError(isLogin ? '登录失败，请检查用户名密码' : '注册失败，可能用户已存在');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md p-6 rounded-xl shadow-xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={() => setShowLoginModal(false)}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? '登录' : '注册新账号'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">用户名</label>
            <Input 
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <Input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            {isLogin ? '登录' : '注册'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-neutral-500">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-blue-600 hover:underline ml-1"
          >
            {isLogin ? '立即注册' : '直接登录'}
          </button>
        </div>
      </div>
    </div>
  );
}

