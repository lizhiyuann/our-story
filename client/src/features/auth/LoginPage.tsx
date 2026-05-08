// 登录页面：用户名密码登录表单
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');  // 登录成功后跳转首页
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-bg to-pink-100">
      <div className="bg-white rounded-card shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-primary mb-2">❤️ 给最爱的你</h1>
        <p className="text-center text-gray-400 text-sm mb-6">登录后开始记录美好时光</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-card hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录 ❤️'}
          </button>
        </form>
      </div>
    </div>
  );
}
