import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkline } from '../components/PriceChart';
import type { MarketCategory } from '../types';

const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string; label: string }> = {
  temperature: { emoji: '🌍', color: 'text-green-700', bg: 'bg-green-50 border-green-100', label: 'Environment' },
  water:       { emoji: '🤝', color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-100',   label: 'Society'     },
  food:        { emoji: '💹', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-100', label: 'Economy'  },
  weather:     { emoji: '🗓️', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100', label: 'Events'  },
};

export function MarketsPage() {
  const { state } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<string>(searchParams.get('category') ?? '');
  const [sortBy, setSortBy] = useState<'volume' | 'traders' | 'date'>('volume');

  useEffect(() => {
    if (category) setSearchParams({ category });
    else setSearchParams({});
  }, [category]);

  const open = state.markets.filter((m) => m.status === 'open');
  const resolved = state.markets.filter((m) => m.status === 'resolved');

  const filtered = (category ? open.filter((m) => m.category === category) : open).sort((a, b) => {
    if (sortBy === 'volume') return b.volume24hCents - a.volume24hCents;
    if (sortBy === 'traders') return b.traderCount - a.traderCount;
    return new Date(a.resolutionDate).getTime() - new Date(b.resolutionDate).getTime();
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Prediction Markets</h1>
        <p className="text-gray-500 text-sm mt-1">
          Every trade includes a mandatory charity donation. Pick your prediction — your giving is guaranteed.
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              category === '' ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setCategory(category === key ? '' : key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 ${
                category === key
                  ? 'bg-green-700 text-white border-green-700'
                  : `${meta.bg} ${meta.color} border-current/20`
              }`}
            >
              {meta.emoji} {meta.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Sort:</span>
          {(['volume', 'traders', 'date'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                sortBy === s ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s === 'volume' ? '24h Volume' : s === 'traders' ? 'Traders' : 'Expiry'}
            </button>
          ))}
        </div>
      </div>

      {/* Market grid */}
      <div className="space-y-3">
        {filtered.map((market) => {
          const meta = CATEGORY_META[market.category];
          const noPrice = 100 - market.yesPrice;
          const up = market.priceHistory[market.priceHistory.length - 1] >= market.priceHistory[0];
          const daysLeft = Math.ceil(
            (new Date(market.resolutionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Link
              key={market.id}
              to={`/markets/${market.id}`}
              className="card flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 hover:border-green-300 hover:shadow-md transition-all block"
            >
              {/* Category icon */}
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${meta.bg}`}>
                {meta.emoji}
              </div>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm leading-snug">{market.title}</p>
                <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-400">
                  <span className={`badge ${meta.bg} ${meta.color} border border-current/10`}>
                    {meta.emoji} {meta.label}
                  </span>
                  <span>📅 {daysLeft > 0 ? `${daysLeft}d left` : 'Expiring soon'}</span>
                  <span>👥 {market.traderCount.toLocaleString()} traders</span>
                  <span>💰 ${(market.volume24hCents / 100).toFixed(0)} vol</span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="hidden sm:block shrink-0">
                <Sparkline history={market.priceHistory} up={up} />
              </div>

              {/* Prices */}
              <div className="flex gap-3 shrink-0">
                <div className="text-center">
                  <div className="text-lg font-extrabold text-green-700">{market.yesPrice}¢</div>
                  <div className="text-xs text-gray-400">YES</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-400">{noPrice}¢</div>
                  <div className="text-xs text-gray-400">NO</div>
                </div>
              </div>

              <span className="text-gray-300 shrink-0 hidden sm:block">→</span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p>No open markets in this category.</p>
        </div>
      )}

      {/* Resolved markets */}
      {resolved.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Resolved Markets</h2>
          <div className="space-y-2">
            {resolved.map((m) => (
              <div key={m.id} className="card px-5 py-3 flex items-center justify-between opacity-60">
                <div>
                  <p className="text-sm font-medium text-gray-600">{m.title}</p>
                  <p className="text-xs text-gray-400">Resolved {m.resolutionDate}</p>
                </div>
                <span className={`badge font-bold ${m.resolvedOutcome === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {m.resolvedOutcome?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
