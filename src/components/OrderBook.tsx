import type { OrderBook as OrderBookType } from '../types';

interface Props {
  orderBook: OrderBookType;
  yesPrice: number;
}

export function OrderBook({ orderBook, yesPrice }: Props) {
  const { bids, asks } = orderBook;
  const maxShares = Math.max(...[...bids, ...asks].map((e) => e.shares), 1);

  const Row = ({
    entry,
    side,
  }: {
    entry: { priceCents: number; shares: number };
    side: 'bid' | 'ask';
  }) => {
    const pct = (entry.shares / maxShares) * 100;
    const isBid = side === 'bid';
    const barColor = isBid ? 'bg-green-100' : 'bg-red-50';
    const textColor = isBid ? 'text-green-700' : 'text-red-600';
    return (
      <div className="relative flex items-center justify-between text-xs py-0.5 px-2 rounded overflow-hidden">
        <div
          className={`absolute inset-y-0 ${isBid ? 'right-0' : 'left-0'} ${barColor}`}
          style={{ width: `${pct}%` }}
        />
        <span className={`relative font-mono font-semibold ${textColor}`}>
          {entry.priceCents}¢
        </span>
        <span className="relative text-gray-500">{entry.shares}</span>
      </div>
    );
  };

  return (
    <div className="text-xs">
      {/* Header */}
      <div className="flex justify-between text-gray-400 font-medium px-2 mb-1">
        <span>Price (YES)</span>
        <span>Shares</span>
      </div>

      {/* Asks (sell orders — lowest ask first) */}
      <div className="space-y-0.5 mb-1">
        {asks.slice(0, 5).reverse().map((a, i) => (
          <Row key={i} entry={a} side="ask" />
        ))}
      </div>

      {/* Spread */}
      <div className="flex items-center gap-2 px-2 py-1 my-1">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
          {yesPrice}¢
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Bids (buy orders — highest bid first) */}
      <div className="space-y-0.5">
        {bids.slice(0, 5).map((b, i) => (
          <Row key={i} entry={b} side="bid" />
        ))}
      </div>
    </div>
  );
}
