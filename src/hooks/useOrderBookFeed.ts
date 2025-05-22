import { useEffect, useRef, useState } from "react";
import { type QuoteRow, transformQuotes } from "../utils/transformQuotes";
import throttle from "lodash-es/throttle"

type QuoteMap = Map<string, string>;

export function useOrderBookFeed() {
  const [bids, setBids] = useState<QuoteRow[]>([]);
  const [asks, setAsks] = useState<QuoteRow[]>([]);

  const bidMapRef = useRef<QuoteMap>(new Map());
  const askMapRef = useRef<QuoteMap>(new Map());
  const lastSeqNumRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // ✅ 加入 throttle：每 200ms 最多更新一次畫面
  const throttledUpdate = useRef(
    throttle(() => {
      setBids(transformQuotes([...bidMapRef.current.entries()], true));
      setAsks(transformQuotes([...askMapRef.current.entries()], false));
    }, 200)
  ).current;

  useEffect(() => {
    const ws = new WebSocket("wss://ws.btse.com/ws/oss/futures");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ op: "subscribe", args: ["update:BTCPFC_0"] }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.topic !== "update:BTCPFC_0" || !msg.data) return;
      const data = msg.data;

      if (data.type === "snapshot") {
        bidMapRef.current = new Map(data.bids);
        askMapRef.current = new Map(data.asks);
        lastSeqNumRef.current = data.seqNum;

        setBids(transformQuotes([...bidMapRef.current.entries()], true));
        setAsks(transformQuotes([...askMapRef.current.entries()], false));
        return;
      }

      if (data.type === "delta") {
        const { seqNum, prevSeqNum, bids: deltaBids, asks: deltaAsks } = data;

        if (prevSeqNum !== lastSeqNumRef.current) {
          console.warn("⚠️ SEQ mismatch. Re-subscribing...");
          resubscribe();
          return;
        }

        lastSeqNumRef.current = seqNum;

        applyDelta(bidMapRef.current, deltaBids);
        applyDelta(askMapRef.current, deltaAsks);

        // ✅ 改用 throttle 更新畫面
        throttledUpdate();
      }
    };

    return () => {
      ws.close();
      throttledUpdate.cancel();
    };
  }, [throttledUpdate]);

  function applyDelta(map: QuoteMap, deltas: [string, string][]) {
    for (const [price, size] of deltas) {
      if (size === "0") map.delete(price);
      else map.set(price, size);
    }
  }

  function resubscribe() {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({ op: "unsubscribe", args: ["update:BTCPFC_0"] }));
    ws.send(JSON.stringify({ op: "subscribe", args: ["update:BTCPFC_0"] }));

    bidMapRef.current.clear();
    askMapRef.current.clear();
    lastSeqNumRef.current = null;
    setBids([]);
    setAsks([]);
  }

  return { bids, asks };
}
