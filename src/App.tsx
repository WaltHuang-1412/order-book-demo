import { useOrderBookFeed } from "./hooks/useOrderBookFeed";
import { OrderBook } from "./components/OrderBook";
import { useLastPriceSocket } from "./hooks/useLastPriceSocket";

export default function App() {
  const { bids, asks } = useOrderBookFeed();
  const { lastPrice, direction } = useLastPriceSocket();
  return (
    <div className="flex justify-center mt-10">
      <OrderBook
        bids={bids.slice(0, 8)}
        asks={asks.slice(0, 8)}
        lastPrice={lastPrice}
        direction={direction}
      />
    </div>
  );
}
