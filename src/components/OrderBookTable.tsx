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
    <tr
      className={clsx(
        "transition-colors duration-500 relative",
        "hover:bg-[var(--color-row-hover)]",
        status === "new" &&
          (isBuy ? "animate-flash-green" : "animate-flash-red")
      )}
    >
      <td
        className="px-2 text-right w-1/3"
        style={{
          color: isBuy ? "var(--color-buy-price)" : "var(--color-sell-price)",
        }}
      >
        {price.toLocaleString()}
      </td>
      <td
        className={clsx(
          "px-2 text-right w-1/3",
          status === "changed-up" && "animate-flash-green",
          status === "changed-down" && "animate-flash-red"
        )}
      >
        {size.toLocaleString()}
      </td>
      <td className="px-2 text-right w-1/3">
        <div
          className="absolute top-0 right-0 h-full"
          style={{
            width: `${percent * 100}%`,
            backgroundColor: isBuy
              ? "var(--color-buy-bar)"
              : "var(--color-sell-bar)",
          }}
        />
        <span className="relative z-10">{total.toLocaleString()}</span>
      </td>
    </tr>
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
    <div className="bg-[var(--color-background)] text-[var(--color-text)] p-4 rounded-md w-full max-w-md">
      <table className="w-full border-collapse text-sm">
        <thead className="text-[var(--color-head)]">
          <tr>
            <th className="text-right px-2">Price</th>
            <th className="text-right px-2">Size</th>
            <th className="text-right px-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {asks.map((row) => (
            <QuoteRow key={`ask-${row.price}`} row={row} isBuy={false} />
          ))}

          {lastPrice !== undefined && (
            <tr>
              <td colSpan={3} className="py-1">
                <div
                  className={clsx(
                    "text-center font-semibold text-lg py-1 rounded",
                    direction === "up" &&
                      "text-[var(--color-buy-price)] bg-[var(--color-buy-bar)]",
                    direction === "down" &&
                      "text-[var(--color-sell-price)] bg-[var(--color-sell-bar)]",
                    direction === "flat" &&
                      "text-[var(--color-flat-text)] bg-[var(--color-flat-bar)]"
                  )}
                >
                  {lastPrice?.toLocaleString() ?? "--"}
                  {direction === "up" && " ↑"}
                  {direction === "down" && " ↓"}
                </div>
              </td>
            </tr>
          )}

          {bids.map((row) => (
            <QuoteRow key={`bid-${row.price}`} row={row} isBuy={true} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
