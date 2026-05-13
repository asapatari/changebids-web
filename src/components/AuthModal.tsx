import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function AuthModal() {
  const { state, dispatch, login } = useApp();
  const isLogin = state.authModal === 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const ok = login(email, password);
      if (!ok) setError('Invalid email or password. Try demo@changebids.org / password');
    } else {
      // For PoC: register creates a generic account (not persisted across refresh)
      setError('Registration is disabled in the demo. Use demo@changebids.org / password');
    }
  }

  function quickLogin(e: string) {
    setEmail(e);
    setPassword('password');
    login(e, 'password');
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && dispatch({ type: 'CLOSE_AUTH' })}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-800 to-green-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">
                {isLogin ? 'Welcome back' : 'Join ChangeBids'}
              </h2>
              <p className="text-green-200 text-sm mt-1">
                {isLogin ? 'Sign in to your account' : 'Start trading for the planet'}
              </p>
            </div>
            <button
              onClick={() => dispatch({ type: 'CLOSE_AUTH' })}
              className="text-green-200 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Demo quick-login buttons */}
          <div className="mb-5 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700 font-semibold mb-2">DEMO ACCOUNTS</p>
            <div className="flex gap-2">
              <button
                onClick={() => quickLogin('demo@changebids.org')}
                className="flex-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-1.5 px-2 rounded-lg transition-colors"
              >
                👤 User demo
              </button>
              <button
                onClick={() => quickLogin('admin@changebids.org')}
                className="flex-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-1.5 px-2 rounded-lg transition-colors"
              >
                🔑 Admin demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <label className="label">Full name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  required
                />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full mt-1">
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => dispatch({ type: 'OPEN_AUTH', payload: isLogin ? 'register' : 'login' })}
              className="text-green-700 font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
