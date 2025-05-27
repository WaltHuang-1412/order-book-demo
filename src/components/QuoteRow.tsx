import React from "react";
import clsx from "clsx";
import { type QuoteRow as QuoteRowType } from "../utils/transformQuotesWithStatus";

type QuoteRowProps = {
  row: QuoteRowType;
  isBuy: boolean;
};

export const QuoteRow: React.FC<QuoteRowProps> = ({ row, isBuy }) => {
  const { price, size, total, percent, status } = row;

  return (
    <div
      className={clsx(
        "relative flex w-full text-sm px-2",
        "transition-colors duration-500 hover:bg-[var(--color-row-hover)]",
        status === "new" &&
          (isBuy ? "animate-flash-green" : "animate-flash-red")
      )}
    >
      {/* 背景條：高度為 92% */}
      <div
        className="absolute right-0"
        style={{
          top: "4%",
          bottom: "4%",
          width: `${percent * 100}%`,
          backgroundColor: isBuy
            ? "var(--color-buy-bar)"
            : "var(--color-sell-bar)",
        }}
      />

      {/* Price */}
      <div
        className="w-3/12 pt-1 pb-1 text-left relative"
        style={{
          color: isBuy ? "var(--color-buy-price)" : "var(--color-sell-price)",
        }}
      >
        {price.toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
      </div>

      {/* Size */}
      <div
        className={clsx(
          "w-4/12 pl-2 pt-1 pb-1 text-right relative",
          status === "changed-up" && "animate-flash-green",
          status === "changed-down" && "animate-flash-red"
        )}
      >
        {size.toLocaleString()}
      </div>

      {/* Total */}
      <div className="w-5/12 pl-2 pt-1 pb-1 text-right relative">
        {total.toLocaleString()}
      </div>
    </div>
  );
};
