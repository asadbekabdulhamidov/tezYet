import { useEffect, useRef, useState } from "react";
import { buildOrderWsUrl } from "../lib/wsUrl";
import { normalizeWsOrderPatch } from "../lib/wsOrderDetail";
import type { OrderDetail } from "../types/orderDetail";

type OnPatch = (patch: Partial<OrderDetail>) => void;

const MOCK_TOKEN = "dev-access-token";

export function useOrderDetailSocket(
  orderId: number | null,
  accessToken: string | null,
  enabled: boolean,
  onPatch: OnPatch,
) {
  const [wsConnected, setWsConnected] = useState(false);
  const onPatchRef = useRef(onPatch);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    onPatchRef.current = onPatch;
  }, [onPatch]);

  useEffect(() => {
    if (!enabled || !orderId || !accessToken || accessToken === MOCK_TOKEN) {
      setWsConnected(false);
      return;
    }

    let stopped = false;
    let attempt = 0;

    const cleanupWs = () => {
      if (reconnectRef.current !== null) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };

    const connect = () => {
      cleanupWs();
      if (stopped) return;

      let url: string;
      try {
        url = buildOrderWsUrl(accessToken, orderId);
      } catch {
        setWsConnected(false);
        return;
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!stopped) {
          attempt = 0;
          setWsConnected(true);
        }
      };

      ws.onmessage = (ev) => {
        try {
          const parsed: unknown = JSON.parse(String(ev.data));
          const patch = normalizeWsOrderPatch(parsed);
          if (patch) {
            onPatchRef.current(patch);
          }
        } catch {
          /* */
        }
      };

      ws.onerror = () => ws.close();

      ws.onclose = () => {
        setWsConnected(false);
        if (stopped) return;
        attempt += 1;
        const delay = Math.min(30_000, 2000 * 2 ** Math.min(attempt, 4));
        reconnectRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stopped = true;
      cleanupWs();
    };
  }, [enabled, orderId, accessToken]);

  return { wsConnected };
}
