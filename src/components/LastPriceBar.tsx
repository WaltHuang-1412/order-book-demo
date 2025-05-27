import clsx from "clsx";
import ArrowDownIcon from "../assets/icons/ArrowDownIcon.svg?react";
console.log("ArrowDownIcon :>> ", ArrowDownIcon);
type Props = {
  price?: number | null;
  direction?: "up" | "down" | "flat" | null;
};

export const LastPriceBar: React.FC<Props> = ({ price, direction }) => (
  <div
    className={clsx(
      "py-2 rounded my-1",
      direction === "up" &&
        "text-[var(--color-buy-price)] bg-[var(--color-buy-bar)]",
      direction === "down" &&
        "text-[var(--color-sell-price)] bg-[var(--color-sell-bar)]",
      direction === "flat" &&
        "text-[var(--color-text)] bg-[var(--color-flat-bar)]"
    )}
  >
    <div className="flex justify-center items-center text-center font-semibold text-lg">
      {price?.toLocaleString() ?? "--"}
      {direction === "up" && (
        <ArrowDownIcon className="w-4 h-4 ml-1 inline-block align-middle rotate-180" />
      )}
      {direction === "down" && (
        <ArrowDownIcon className="w-4 h-4 ml-1 inline-block align-middle" />
      )}
    </div>
  </div>
);
