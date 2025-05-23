import React from "react";
import clsx from "clsx";
import { type QuoteRow } from "../utils/transformQuotesWithStatus";

type QuoteRowProps = {
  row: QuoteRow;
  isBuy: boolean;
};

const QuoteRow: React.FC<QuoteRowProps> = ({ row, isBuy }) => {
  const { price, size, total, percent, status } = row;
  return (
    <div
      className={clsx(
        "relative flex w-full text-right text-sm",
        "transition-colors duration-500 hover:bg-[var(--color-row-hover)]",
        status === "new" &&
          (isBuy ? "animate-flash-green" : "animate-flash-red")
      )}
    >
      {/* 背景條 */}
      <div
        className="absolute top-0 right-0 h-full z-0"
        style={{
          width: `${percent * 100}%`,
          backgroundColor: isBuy
            ? "var(--color-buy-bar)"
            : "var(--color-sell-bar)",
        }}
      />

      <div
        className="w-1/3 px-2 relative z-10"
        style={{
          color: isBuy ? "var(--color-buy-price)" : "var(--color-sell-price)",
        }}
      >
        {price.toLocaleString()}
      </div>
      <div
        className={clsx(
          "w-1/3 px-2 relative z-10",
          status === "changed-up" && "animate-flash-green",
          status === "changed-down" && "animate-flash-red"
        )}
      >
        {size.toLocaleString()}
      </div>
      <div className="w-1/3 px-2 relative z-10">{total.toLocaleString()}</div>
    </div>
  );
};

type OrderBookTableProps = {
  bids: QuoteRow[];
  asks: QuoteRow[];
  lastPrice?: number | null;
  direction?: "up" | "down" | "flat" | null;
};

export const OrderBookTable: React.FC<OrderBookTableProps> = ({
  bids,
  asks,
  lastPrice,
  direction,
}) => {
  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text)] p-2 rounded-md w-full">
      {/* Header */}
      <div className="text-lg font-bold mb-2 border-b-purple-100">Order Book</div>
      <div className="flex text-[var(--color-head)] text-sm font-medium">
        <div className="w-1/3 px-2 text-right">Price</div>
        <div className="w-1/3 px-2 text-right">Size</div>
        <div className="w-1/3 px-2 text-right">Total</div>
      </div>

      {/* Ask Rows */}
      {asks.map((row) => (
        <QuoteRow key={`ask-${row.price}`} row={row} isBuy={false} />
      ))}

      {/* Last Price Row */}
      {lastPrice !== undefined && (
        <div className="py-1">
          <div
            className={clsx(
              "text-center font-semibold text-lg py-1 rounded",
              direction === "up" &&
                "text-[var(--color-buy-price)] bg-[var(--color-buy-bar)]",
              direction === "down" &&
                "text-[var(--color-sell-price)] bg-[var(--color-sell-bar)]",
              direction === "flat" &&
                "text-[var(--color-text)] bg-[rgba(134,152,170,0.12)]"
            )}
          >
            {lastPrice?.toLocaleString() ?? "--"}
            {direction === "up" && " ↑"}
            {direction === "down" && " ↓"}
          </div>
        </div>
      )}

      {/* Bid Rows */}
      {bids.map((row) => (
        <QuoteRow key={`bid-${row.price}`} row={row} isBuy={true} />
      ))}
    </div>
  );
};
