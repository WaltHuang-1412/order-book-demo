import { useEffect, useRef, useState } from "react";
import {
  transformBidsWithStatus,
  transformAsksWithStatus,
  type QuoteRow,
} from "../utils/transformQuotesWithStatus";
import { WebSocketClient } from "../utils/wsClient";

type QuoteMap = Map<string, string>;

export function useOrderBookFeed() {
  const [bids, setBids] = useState<QuoteRow[]>([]);
  const [asks, setAsks] = useState<QuoteRow[]>([]);

  const bidMapRef = useRef<QuoteMap>(new Map());
  const askMapRef = useRef<QuoteMap>(new Map());
  const lastSeqNumRef = useRef<number | null>(null);

  useEffect(() => {
    const ws = new WebSocketClient("wss://ws.btse.com/ws/oss/futures");

    const handleOpen = () => {
      ws.send({ op: "subscribe", args: ["update:BTCPFC_0"] });
    };

    const handleMessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data);
      if (msg.topic !== "update:BTCPFC_0" || !msg.data) return;

      const data = msg.data;

      if (data.type === "snapshot") {
        bidMapRef.current = new Map(data.bids);
        askMapRef.current = new Map(data.asks);

        lastSeqNumRef.current = data.seqNum;

        setBids(transformBidsWithStatus([...bidMapRef.current.entries()]));
        setAsks(transformAsksWithStatus([...askMapRef.current.entries()]));
        return;
      }

      if (data.type === "delta") {
        const { seqNum, prevSeqNum, bids: deltaBids, asks: deltaAsks } = data;
        if (prevSeqNum !== lastSeqNumRef.current) {
          resubscribe(ws);
          return;
        }

        lastSeqNumRef.current = seqNum;

        const bidChanges = applyDeltaWithStatus(bidMapRef.current, deltaBids);
        const askChanges = applyDeltaWithStatus(askMapRef.current, deltaAsks);

        setBids(
          transformBidsWithStatus([...bidMapRef.current.entries()], bidChanges)
        );
        setAsks(
          transformAsksWithStatus([...askMapRef.current.entries()], askChanges)
        );
      }
    };

    ws.on("open", handleOpen);
    ws.on("message", handleMessage);

    return () => {
      ws.off("open", handleOpen);
      ws.off("message", handleMessage);
      ws.close();
    };
  }, []);

  function resubscribe(ws: WebSocketClient) {
    if (ws.getState() !== WebSocket.OPEN) return;

    ws.send({ op: "unsubscribe", args: ["update:BTCPFC_0"] });
    ws.send({ op: "subscribe", args: ["update:BTCPFC_0"] });

    bidMapRef.current.clear();
    askMapRef.current.clear();
    lastSeqNumRef.current = null;
    setBids([]);
    setAsks([]);
  }

  function applyDeltaWithStatus(
    map: QuoteMap,
    deltas: [string, string][]
  ): Record<
    string,
    "new" | "changed-up" | "changed-down" | "unchanged" | "removed"
  > {
    const statusMap: Record<
      string,
      "new" | "changed-up" | "changed-down" | "unchanged" | "removed"
    > = {};

    for (const [price, size] of deltas) {
      const exists = map.has(price);
      const prevSizeStr = map.get(price);

      if (size === "0") {
        if (exists) {
          map.delete(price);
          statusMap[price] = "removed";
        }
      } else {
        const sizeFloat = parseFloat(size);
        const prevSizeFloat = prevSizeStr ? parseFloat(prevSizeStr) : null;

        if (!exists) {
          statusMap[price] = "new";
        } else if (prevSizeFloat !== null && sizeFloat !== prevSizeFloat) {
          statusMap[price] =
            sizeFloat > prevSizeFloat ? "changed-up" : "changed-down";
        } else {
          statusMap[price] = "unchanged";
        }

        map.set(price, size);
      }
    }

    return statusMap;
  }

  return { bids, asks };
}
