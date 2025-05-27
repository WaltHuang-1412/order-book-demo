import { useOrderBookFeed } from "./hooks/useOrderBookFeed";
import { useLastPriceSocket } from "./hooks/useLastPriceSocket";
import { OrderBook } from "./components/OrderBook";
export default function App() {
  const { bids, asks } = useOrderBookFeed();
  const { lastPrice, direction } = useLastPriceSocket();
  return (
    <div className="flex justify-center w-full h-full ">
      <OrderBook
        bids={bids.slice(0, 8)}
        asks={asks.slice(0, 8)}
        lastPrice={lastPrice}
        direction={direction}
      />
    </div>
  );
}
