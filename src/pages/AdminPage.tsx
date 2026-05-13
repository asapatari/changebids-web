import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { MarketCategory, Side } from '../types';

const CATEGORY_META: Record<string, { emoji: string }> = {
  temperature: { emoji: '🌡️' },
  water:       { emoji: '💧' },
  food:        { emoji: '🌾' },
  weather:     { emoji: '🌪️' },
};

export function AdminPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { user, markets, charities, positions, ledger } = state;

  const [activeTab, setActiveTab] = useState<'markets' | 'charities' | 'activity'>('markets');
  const [resolveModal, setResolveModal] = useState<{ id: string; title: string } | null>(null);
  const [newMarket, setNewMarket] = useState({
    title: '', description: '', category: 'temperature' as MarketCategory,
    rules: '', resolutionDate: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-3xl mb-3">🔑</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Admin access required</h2>
        <p className="text-gray-500 text-sm mb-4">Sign in with an admin account to access this page.</p>
        <button onClick={() => dispatch({ type: 'OPEN_AUTH', payload: 'login' })} className="btn-primary">
          Sign in
        </button>
      </div>
    );
  }

  // Stats
  const openMarkets = markets.filter((m) => m.status === 'open').length;
  const resolvedMarkets = markets.filter((m) => m.status === 'resolved').length;
  const totalVolume = markets.reduce((s, m) => s + m.volume24hCents, 0);
  const totalCharityEscrow = positions.reduce((s, p) => s + p.charityEscrowCents, 0);
  const totalTrades = Object.values(state.recentTrades).reduce((s, ts) => s + ts.length, 0);

  function handleResolve(outcome: Side) {
    if (!resolveModal) return;
    dispatch({ type: 'RESOLVE_MARKET', payload: { marketId: resolveModal.id, outcome } });
    setResolveModal(null);
  }

  function handleAddMarket(e: React.FormEvent) {
    e.preventDefault();
    if (!newMarket.title || !newMarket.resolutionDate) {
      dispatch({ type: 'NOTIFY', payload: { msg: 'Title and resolution date are required.', kind: 'error' } });
      return;
    }
    dispatch({ type: 'ADD_MARKET', payload: newMarket });
    setNewMarket({ title: '', description: '', category: 'temperature', rules: '', resolutionDate: '' });
    setShowAddForm(false);
  }

  const Tab = ({ id, label }: { id: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        activeTab === id ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">ChangeBids Platform Management</p>
        </div>
        <span className="badge bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1">ADMIN</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-7">
        {[
          { label: 'Open Markets', value: openMarkets, color: 'text-green-700' },
          { label: 'Resolved', value: resolvedMarkets, color: 'text-gray-600' },
          { label: '24h Volume', value: `$${(totalVolume / 100).toFixed(0)}`, color: 'text-blue-700' },
          { label: 'Charity Locked', value: `$${(totalCharityEscrow / 100).toFixed(2)}`, color: 'text-green-700' },
          { label: 'Total Trades', value: totalTrades, color: 'text-gray-700' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5">
        <Tab id="markets" label="Markets" />
        <Tab id="charities" label="Charities" />
        <Tab id="activity" label="Activity Log" />
      </div>

      {/* Markets tab */}
      {activeTab === 'markets' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{markets.length} total markets</p>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary text-sm">
              + Add Market
            </button>
          </div>

          {/* Add market form */}
          {showAddForm && (
            <div className="card p-6 mb-5 border-green-200">
              <h3 className="font-bold text-gray-800 mb-4">Create New Market</h3>
              <form onSubmit={handleAddMarket} className="space-y-3">
                <div>
                  <label className="label">Market Question (title)</label>
                  <input
                    className="input" required
                    placeholder="Will X happen by [date]?"
                    value={newMarket.title}
                    onChange={(e) => setNewMarket((n) => ({ ...n, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input min-h-[80px] resize-none"
                    placeholder="Detailed description of the outcome..."
                    value={newMarket.description}
                    onChange={(e) => setNewMarket((n) => ({ ...n, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="input"
                      value={newMarket.category}
                      onChange={(e) => setNewMarket((n) => ({ ...n, category: e.target.value as MarketCategory }))}
                    >
                      {Object.keys(CATEGORY_META).map((c) => (
                        <option key={c} value={c}>{CATEGORY_META[c].emoji} {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Resolution Date</label>
                    <input
                      type="date" className="input" required
                      value={newMarket.resolutionDate}
                      onChange={(e) => setNewMarket((n) => ({ ...n, resolutionDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Resolution Rules</label>
                  <textarea
                    className="input min-h-[60px] resize-none"
                    placeholder="Resolution source and criteria..."
                    value={newMarket.rules}
                    onChange={(e) => setNewMarket((n) => ({ ...n, rules: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="btn-primary">Create Market</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Markets table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Market</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">YES</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Volume</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {markets.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{CATEGORY_META[m.category]?.emoji}</span>
                        <div>
                          <p className="font-medium text-gray-800 leading-snug line-clamp-1">{m.title}</p>
                          <p className="text-xs text-gray-400">Resolves {m.resolutionDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-bold text-green-700">{m.yesPrice}¢</span>
                    </td>
                    <td className="px-3 py-3 text-right text-gray-600">
                      ${(m.volume24hCents / 100).toFixed(0)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {m.status === 'open' && (
                        <span className="badge bg-green-100 text-green-700">Open</span>
                      )}
                      {m.status === 'resolved' && (
                        <span className={`badge font-bold ${m.resolvedOutcome === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {m.resolvedOutcome?.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Link
                          to={`/markets/${m.id}`}
                          className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 font-medium"
                        >
                          View
                        </Link>
                        {m.status === 'open' && (
                          <button
                            onClick={() => setResolveModal({ id: m.id, title: m.title })}
                            className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 font-medium"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charities tab */}
      {activeTab === 'charities' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{c.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <span className="badge bg-green-100 text-green-700 text-xs">Active</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">{c.description}</p>
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400">
                  Escrow pending: <span className="font-semibold text-green-700">
                    ${(positions.filter((p) => p.charityId === c.id).reduce((s, p) => s + p.charityEscrowCents, 0) / 100).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity log tab */}
      {activeTab === 'activity' && (
        <div className="card overflow-hidden">
          {ledger.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No activity yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {ledger.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      entry.type === 'payout' ? 'bg-green-100 text-green-700' :
                      entry.type === 'fee' ? 'bg-orange-100 text-orange-700' :
                      entry.type === 'deposit' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600 truncate">{entry.description}</span>
                  </div>
                  <div className="text-right shrink-0">
                    {entry.amountCents !== 0 && (
                      <p className={`text-sm font-bold ${entry.amountCents > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                        {entry.amountCents > 0 ? '+' : ''}${(Math.abs(entry.amountCents) / 100).toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-gray-300">{new Date(entry.ts).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resolve confirmation modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Resolve Market</h3>
            <p className="text-gray-600 text-sm mb-1 font-medium">{resolveModal.title}</p>
            <p className="text-gray-400 text-xs mb-6">
              Resolving a market is final. All positions will be settled and charity escrow funds will be disbursed.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleResolve('yes')}
                className="py-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 text-green-800 font-bold rounded-xl transition-all"
              >
                ✓ Resolve YES
              </button>
              <button
                onClick={() => handleResolve('no')}
                className="py-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 text-red-700 font-bold rounded-xl transition-all"
              >
                ✗ Resolve NO
              </button>
            </div>

            <button
              onClick={() => setResolveModal(null)}
              className="btn-secondary w-full text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
