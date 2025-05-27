import { useEffect, useRef, useState } from "react";
import { WebSocketClient } from "../utils/wsClient";

export type PriceDirection = "up" | "down" | "flat" | null;

export function useLastPriceSocket() {
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [direction, setDirection] = useState<PriceDirection>(null);
  const prevPrice = useRef<number | null>(null);

  useEffect(() => {
    const ws = new WebSocketClient("wss://ws.btse.com/ws/futures");

    const handleOpen = () => {
      console.log("[LastPrice WS] connected");
      ws.send({
        op: "subscribe",
        args: ["tradeHistoryApi:BTCPFC"],
      });
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "subscribe") {
          console.log("[LastPrice WS] subscribed to", msg.channel);
          return;
        }

        if (msg.topic !== "tradeHistoryApi") return;
        if (!Array.isArray(msg.data) || msg.data.length === 0) return;
        if (msg.data[0].symbol !== "BTCPFC") return;

        const price = parseFloat(msg.data[0].price);
        const prev = prevPrice.current;

        let dir: PriceDirection = "flat";
        if (prev !== null) {
          if (price > prev) dir = "up";
          else if (price < prev) dir = "down";
        }

        prevPrice.current = price;
        setLastPrice(price);
        setDirection(dir);
      } catch (err) {
        console.error("[LastPrice WS] parse error:", err);
      }
    };

    ws.on("open", handleOpen);
    ws.on("message", handleMessage);

    ws.on("error", (e) => {
      console.error("[LastPrice WS] connection error:", e);
    });

    ws.on("close", () => {
      console.log("[LastPrice WS] disconnected");
    });

    return () => {
      ws.off("open", handleOpen);
      ws.off("message", handleMessage);
      ws.close();
    };
  }, []);

  return { lastPrice, direction };
}
