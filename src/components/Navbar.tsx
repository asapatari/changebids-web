import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';

export function Navbar() {
  const { state, dispatch } = useApp();
  const { user, walletCents } = state;
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to || location.pathname.startsWith(to + '/');
    return (
      <Link
        to={to}
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
          active ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-green-800 text-lg tracking-tight">ChangeBids</span>
            <span className="hidden lg:flex items-center gap-2 ml-1">
              <span className="text-gray-300 font-light select-none">|</span>
              <span className="text-sm text-gray-500 font-medium italic whitespace-nowrap">A Prediction Market for Change</span>
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/markets', 'Markets')}
            {user && navLink('/portfolio', 'Portfolio')}
            {user?.role === 'admin' && navLink('/admin', 'Admin')}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-green-600 font-medium">Balance</span>
                  <span className="text-sm font-bold text-green-800">
                    ${(walletCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors"
                  >
                    <span className="w-5 h-5 bg-green-700 text-white rounded-full text-xs flex items-center justify-center font-bold">
                      {user.fullName[0]}
                    </span>
                    <span className="hidden sm:block">{user.fullName.split(' ')[0]}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-2 border-b border-gray-50">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/portfolio"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Portfolio
                      </Link>
                      <button
                        onClick={() => { dispatch({ type: 'LOGOUT' }); setMenuOpen(false); }}
                        className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => dispatch({ type: 'OPEN_AUTH', payload: 'login' })}
                  className="btn-secondary text-sm py-1.5"
                >
                  Sign in
                </button>
                <button
                  onClick={() => dispatch({ type: 'OPEN_AUTH', payload: 'register' })}
                  className="btn-primary text-sm py-1.5"
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {state.authModal && <AuthModal />}

      {/* Toast notification */}
      {state.notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm animate-fade-in ${
            state.notification.kind === 'success'
              ? 'bg-green-700 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {state.notification.kind === 'success' ? '✓ ' : '✕ '}
          {state.notification.msg}
        </div>
      )}
    </>
  );
}
