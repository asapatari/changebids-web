import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PriceChart } from '../components/PriceChart';
import { OrderBook } from '../components/OrderBook';
import { TradeForm } from '../components/TradeForm';

const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string; label: string }> = {
  temperature: { emoji: '🌍', color: 'text-green-700', bg: 'bg-green-50 border-green-100', label: 'Environment' },
  water:       { emoji: '🤝', color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-100',   label: 'Society'     },
  food:        { emoji: '💹', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-100', label: 'Economy'  },
  weather:     { emoji: '🗓️', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100', label: 'Events'  },
};

function timeAgo(ts: number) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export function MarketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();

  const market = state.markets.find((m) => m.id === id);
  if (!market) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
        <p className="text-3xl mb-2">🔍</p>
        <p>Market not found.</p>
        <Link to="/markets" className="btn-primary inline-block mt-4">Back to Markets</Link>
      </div>
    );
  }

  const meta = CATEGORY_META[market.category];
  const noPrice = 100 - market.yesPrice;
  const orderBook = state.orderBooks[market.id];
  const recentTrades = state.recentTrades[market.id] ?? [];
  const userPosition = state.positions.find((p) => p.marketId === market.id);
  const daysLeft = Math.ceil(
    (new Date(market.resolutionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const priceChange = market.priceHistory.length > 1
    ? market.yesPrice - market.priceHistory[market.priceHistory.length - 2]
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <Link to="/markets" className="hover:text-gray-600">Markets</Link>
        <span>›</span>
        <span className={`${meta.color} font-medium`}>{meta.emoji} {meta.label}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: market info + chart + order book */}
        <div className="lg:col-span-2 space-y-5">
          {/* Market header */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <span className={`badge ${meta.bg} ${meta.color} border border-current/10 mb-2 inline-block`}>
                  {meta.emoji} {meta.label}
                </span>
                <h1 className="text-xl font-bold text-gray-800 leading-snug">{market.title}</h1>
                <p className="text-gray-500 text-sm mt-2">{market.description}</p>
              </div>
              {market.status === 'resolved' && (
                <span className={`badge font-bold text-sm ${market.resolvedOutcome === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  Resolved {market.resolvedOutcome?.toUpperCase()}
                </span>
              )}
            </div>

            {/* Price display */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-extrabold text-green-700">{market.yesPrice}¢</p>
                <p className="text-xs text-green-600 font-medium mt-1">YES</p>
                <p className={`text-xs mt-0.5 font-medium ${priceChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange)}¢
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-extrabold text-red-600">{noPrice}¢</p>
                <p className="text-xs text-red-500 font-medium mt-1">NO</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-lg font-bold text-gray-600">{market.yesPrice}%</p>
                <p className="text-xs text-gray-400 font-medium mt-1">Implied prob</p>
                <p className="text-xs text-gray-400 mt-0.5">{daysLeft}d left</p>
              </div>
            </div>

            {/* Price chart */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">YES Price History</p>
                <p className="text-xs text-gray-400">{market.priceHistory.length} ticks</p>
              </div>
              <PriceChart history={market.priceHistory} height={100} showLabels />
            </div>
          </div>

          {/* User's position (if any) */}
          {userPosition && (
            <div className="card p-5 border-green-200 bg-green-50/50">
              <p className="text-sm font-bold text-green-800 mb-3">📊 Your Position</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Side</p>
                  <p className={`font-bold ${userPosition.side === 'yes' ? 'text-green-700' : 'text-red-600'}`}>
                    {userPosition.side.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Shares</p>
                  <p className="font-bold text-gray-800">{userPosition.shares}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg cost</p>
                  <p className="font-bold text-gray-800">{userPosition.avgCostCents}¢</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unrealized P&L</p>
                  {(() => {
                    const currentPrice = userPosition.side === 'yes' ? market.yesPrice : noPrice;
                    const pnl = (currentPrice - userPosition.avgCostCents) * userPosition.shares;
                    return (
                      <p className={`font-bold ${pnl >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {pnl >= 0 ? '+' : ''}${(pnl / 100).toFixed(2)}
                      </p>
                    );
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-green-200">
                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-xs text-blue-500 font-medium">Trading Escrow</p>
                  <p className="font-bold text-blue-700">${(userPosition.tradingEscrowCents / 100).toFixed(2)}</p>
                </div>
                <div className="bg-green-100/80 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium">Charity Escrow (fixed)</p>
                  <p className="font-bold text-green-700">${(userPosition.charityEscrowCents / 100).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Book + Recent Trades */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Book (YES)</p>
              {orderBook && <OrderBook orderBook={orderBook} yesPrice={market.yesPrice} />}
            </div>

            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Trades</p>
              <div className="space-y-1.5">
                {recentTrades.slice(0, 10).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${t.side === 'yes' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.side.toUpperCase()}
                    </span>
                    <span className="font-mono text-gray-600">{t.priceCents}¢</span>
                    <span className="text-gray-400">{t.shares} sh</span>
                    <span className="text-gray-300">{timeAgo(t.ts)}</span>
                  </div>
                ))}
                {recentTrades.length === 0 && <p className="text-gray-300 text-xs">No trades yet.</p>}
              </div>
            </div>
          </div>

          {/* Resolution rules */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Resolution Rules</p>
            <p className="text-sm text-gray-600 leading-relaxed">{market.rules}</p>
            <div className="flex gap-4 mt-3 text-xs text-gray-400">
              <span>📅 Resolves {market.resolutionDate}</span>
              <span>👥 {market.traderCount.toLocaleString()} / {market.maxTraders.toLocaleString()} traders</span>
              <span>💰 Max ${(market.maxPositionCents / 100).toFixed(0)} / user (CFTC)</span>
            </div>
          </div>
        </div>

        {/* Right: Trade form */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <p className="text-sm font-bold text-gray-800 mb-4">Place a Trade</p>
            {market.status === 'open' ? (
              <TradeForm market={market} />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-2xl mb-2">🔒</p>
                <p className="text-sm">This market is {market.status}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
