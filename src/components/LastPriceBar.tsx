import clsx from "clsx";

type Props = {
  price?: number | null;
  direction?: "up" | "down" | "flat" | null;
};

export const LastPriceBar: React.FC<Props> = ({ price, direction }) => (
  <div className="py-1">
    <div
      className={clsx(
        "text-center font-semibold text-lg py-1 rounded",
        direction === "up" &&
          "text-[var(--color-buy-price)] bg-[var(--color-buy-bar)]",
        direction === "down" &&
          "text-[var(--color-sell-price)] bg-[var(--color-sell-bar)]",
        direction === "flat" &&
          "text-[var(--color-text)] bg-[var(--color-flat-bar)]"
      )}
    >
      {price?.toLocaleString() ?? "--"}
      {direction === "up" && " ↑"}
      {direction === "down" && " ↓"}
    </div>
  </div>
);
