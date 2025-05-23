import { useEffect, useRef, useState } from "react";

type PriceDirection = "up" | "down" | "flat" | null;

export function useLastPriceSocket() {
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [direction, setDirection] = useState<PriceDirection>(null);
  const prevPriceRef = useRef<number | null>(null);

  useEffect(() => {
    const ws = new WebSocket("wss://ws.btse.com/ws/futures");

    ws.onopen = () => {
      console.log("✅ WS opened");
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: ["tradeHistoryApi:BTCPFC"],
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.event === "subscribe") {
          console.log("✅ Subscribed to", msg.channel);
          return;
        }

        if (msg.topic === "tradeHistoryApi") {
          if (!Array.isArray(msg.data) || msg.data.length === 0) {
            console.log("⚠️ data is empty array");
            return;
          }

          const price = parseFloat(msg.data[0].price);
          const prev = prevPriceRef.current;

          let dir: PriceDirection = "flat";
          if (prev !== null) {
            if (price > prev) dir = "up";
            else if (price < prev) dir = "down";
          }

          console.log("📈 price:", price, "| prev:", prev, "| dir:", dir);

          prevPriceRef.current = price;
          setLastPrice(price);
          setDirection(dir);
        }
      } catch (e) {
        console.error("❌ LastPrice parse error", e);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    return () => {
      ws.close();
      console.log("🛑 WS closed");
    };
  }, []);

  return { lastPrice, direction };
}
