import { useEffect, useRef, useState } from "react";
import { buildDriverWsUrl } from "../lib/wsUrl";
import { normalizeWsOrdersPayload } from "../lib/wsOrders";
import type { DriverAvailableOrder } from "../types/order";

type OnOrders = (orders: DriverAvailableOrder[]) => void;

const MOCK_TOKEN = "dev-access-token";

export function useDriverDashboardSocket(
  accessToken: string | null,
  enabled: boolean,
  onOrdersReplace: OnOrders,
) {
  const [wsConnected, setWsConnected] = useState(false);
  const onOrdersRef = useRef<OnOrders>(onOrdersReplace);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    onOrdersRef.current = onOrdersReplace;
  }, [onOrdersReplace]);

  useEffect(() => {
    if (!enabled || !accessToken || accessToken === MOCK_TOKEN) {
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
        url = buildDriverWsUrl(accessToken);
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
          const next = normalizeWsOrdersPayload(parsed);
          if (next !== null) {
            onOrdersRef.current(next);
          }
        } catch {
          /* matn yoki noto‘g‘ri JSON */
        }
      };

      ws.onerror = () => {
        ws.close();
      };

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
  }, [enabled, accessToken]);

  return { wsConnected };
}
