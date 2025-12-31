import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, setShowLoginModal } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated, setShowLoginModal]);

  if (!isAuthenticated) {
    // 这里可以选择返回 null (只弹窗不跳转)，或者跳转回首页
    // 根据需求 "进入时弹出登录注册框"，我们可以渲染一个空状态或者重定向回首页
    // 既然弹窗已经出来了，背景如果是一片空白体验不好，我们让他回到首页更合理
    return <Navigate to="/" replace />;
  }

  return children;
}

