import React from "react";

type QuoteRow = {
  price: number;
  size: number;
  total: number;
  percent: number; // total / sideTotal
};

type Props = {
  asks: QuoteRow[];
  bids: QuoteRow[];
  lastPrice: number | null;
  direction: "up" | "down" | "flat" | null;
};

export const OrderBook: React.FC<Props> = ({
  asks,
  bids,
  lastPrice,
  direction,
}) => {
  return (
    <div className="bg-background text-text p-4 w-[360px] font-mono text-sm">
      <h2 className="text-head text-base mb-2">Order Book</h2>

      <div className="grid grid-cols-3 gap-x-2 text-head mb-1">
        <span className="text-right">Price (USD)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Sell Orders */}
      <div className="space-y-[1px] mb-2">
        {asks.map((row) => (
          <QuoteRowView key={row.price} row={row} side="sell" />
        ))}
      </div>

      {/* Last Price */}
      <div
        className={`text-center font-bold text-xl py-2 rounded transition-all duration-300 ${
          direction === "up"
            ? "text-buy-price bg-flash-green"
            : direction === "down"
            ? "text-sell-price bg-flash-red"
            : "text-head"
        }`}
      >
        {lastPrice ? lastPrice.toLocaleString() : "--"}
      </div>

      {/* Buy Orders */}
      <div className="space-y-[1px] mt-2">
        {bids.map((row) => (
          <QuoteRowView key={row.price} row={row} side="buy" />
        ))}
      </div>
    </div>
  );
};

const QuoteRowView: React.FC<{
  row: QuoteRow;
  side: "buy" | "sell";
}> = ({ row, side }) => {
  const { price, size, total, percent } = row;

  const barColor = side === "buy" ? "bg-buy-bar" : "bg-sell-bar";
  const priceColor = side === "buy" ? "text-buy-price" : "text-sell-price";

  return (
    <div className="relative h-[20px]">
      <div
        className={`absolute inset-0 ${barColor}`}
        style={{ width: `${percent * 100}%` }}
      />
      <div className="relative z-10 grid grid-cols-3 gap-x-2">
        <span className={`text-right ${priceColor}`}>
          {price.toLocaleString()}
        </span>
        <span className="text-right">{size.toLocaleString()}</span>
        <span className="text-right">{total.toLocaleString()}</span>
      </div>
    </div>
  );
};
