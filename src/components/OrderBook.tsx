import { QuoteRow } from "./QuoteRow";
import { LastPriceBar } from "./LastPriceBar";
import { type QuoteRow as QuoteRowType } from "../utils/transformQuotesWithStatus";

type Props = {
  bids: QuoteRowType[];
  asks: QuoteRowType[];
  lastPrice?: number | null;
  direction?: "up" | "down" | "flat" | null;
};

export const OrderBook: React.FC<Props> = ({
  bids,
  asks,
  lastPrice,
  direction,
}) => (
  <div className="bg-[var(--color-background)] text-[var(--color-text)] py-2 rounded-md w-full">
    <div className="text-lg font-bold mb-2 border-b-purple-100 px-2">Order Book</div>
    <div className="flex text-[var(--color-head)] text-sm font-medium px-2">
      <div className="w-3/12 pt-1 pb-1 text-left">Price (USD)</div>
      <div className="w-4/12 pl-2 pt-1 pb-1 text-right">Size</div>
      <div className="w-5/12 pl-2 pt-1 pb-1 text-right">Total</div>
    </div>

    {asks.map((row) => (
      <QuoteRow key={`ask-${row.price}`} row={row} isBuy={false} />
    ))}

    <LastPriceBar price={lastPrice} direction={direction} />

    {bids.map((row) => (
      <QuoteRow key={`bid-${row.price}`} row={row} isBuy={true} />
    ))}
  </div>
);
