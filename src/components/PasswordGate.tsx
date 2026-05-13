import { useState, useEffect } from 'react';

const SESSION_KEY = 'cb_auth';
const CORRECT = 'invest2026';

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') setUnlocked(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === CORRECT) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden ${shake ? 'animate-shake' : ''}`}
        style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-green-800 to-green-600 px-8 py-8 text-center">
          <div className="text-4xl mb-3">🌿</div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">ChangeBids</h1>
          <p className="text-green-200 text-sm mt-1">A Prediction Market that Creates Change</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <p className="text-sm text-gray-500 text-center mb-6">
            This is a private demo. Enter the access password to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className={`input text-center tracking-widest text-base ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="••••••••••"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(false); }}
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-500 text-center mt-2 font-medium">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base">
              Enter →
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          30%       { transform: translateX(8px); }
          45%       { transform: translateX(-6px); }
          60%       { transform: translateX(6px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
