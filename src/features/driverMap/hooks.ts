import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { updateDriverLocation } from "./api";
import type { GeoCoords, GeoPermissionState } from "./types";

export function useOffline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return !online;
}

function parseDetail(err: unknown): string | null {
  const d = (err as { response?: { data?: { detail?: unknown } } })?.response
    ?.data?.detail;
  if (d == null) return null;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d.length && typeof d[0] === "object" && d[0] !== null) {
    const msg = (d[0] as { msg?: string }).msg;
    return typeof msg === "string" ? msg : null;
  }
  return null;
}

export function useGeolocation(): {
  loading: boolean;
  coords: GeoCoords | null;
  permission: GeoPermissionState;
  error: string | null;
  refresh: () => void;
} {
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [permission, setPermission] = useState<GeoPermissionState>("unknown");
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const nonce = useRef(0);

  const clearWatch = useCallback(() => {
    if (watchId.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setPermission("unsupported");
      setError("Brauzer geolokatsiyani qo‘llab-quvvatlamaydi.");
      setLoading(false);
      return;
    }
    const n = ++nonce.current;
    setLoading(true);
    setError(null);

    const onOk = (pos: GeolocationPosition) => {
      if (n !== nonce.current) return;
      setCoords({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
      setPermission("granted");
      setLoading(false);
    };

    const onErr = (e: GeolocationPositionError) => {
      if (n !== nonce.current) return;
      if (e.code === e.PERMISSION_DENIED) {
        setPermission("denied");
        setError("Geolokatsiyaga ruxsat berilmadi.");
      } else {
        setPermission("unknown");
        setError(e.message || "Joylashuvni olishda xato.");
      }
      setCoords(null);
      setLoading(false);
    };

    clearWatch();
    watchId.current = navigator.geolocation.watchPosition(onOk, onErr, {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 15_000,
    });
  }, [clearWatch]);

  useEffect(() => {
    start();
    return () => {
      nonce.current += 1;
      clearWatch();
    };
  }, [start, clearWatch]);

  const refresh = useCallback(() => {
    clearWatch();
    start();
  }, [clearWatch, start]);

  return { loading, coords, permission, error, refresh };
}

export function useDriverLocationSync(
  coords: GeoCoords | null,
  isAvailable: boolean,
  offline: boolean,
): {
  lastSentAt: Date | null;
  isSending: boolean;
  sendError: string | null;
  sendNow: () => Promise<void>;
} {
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const coordsRef = useRef(coords);
  const isAvailableRef = useRef(isAvailable);
  const onlineRef = useRef(!offline);

  coordsRef.current = coords;
  isAvailableRef.current = isAvailable;
  onlineRef.current = !offline;

  const sendNow = useCallback(async () => {
    const c = coordsRef.current;
    const avail = isAvailableRef.current;
    const online = onlineRef.current;
    if (!c || !online || inFlight.current) return;
    inFlight.current = true;
    setIsSending(true);
    setSendError(null);
    try {
      await updateDriverLocation({
        lat: String(c.lat),
        lon: String(c.lon),
        is_available: avail,
      });
      setLastSentAt(new Date());
    } catch (e: unknown) {
      const detail = parseDetail(e);
      setSendError(detail || "Joylashuvni yuborib bo‘lmadi.");
    } finally {
      inFlight.current = false;
      setIsSending(false);
    }
  }, []);

  const hasCoords = coords != null;

  useEffect(() => {
    if (!hasCoords || offline) return;

    void sendNow();
    const id = window.setInterval(() => {
      void sendNow();
    }, 10_000);
    return () => window.clearInterval(id);
  }, [hasCoords, offline, isAvailable, sendNow]);

  return useMemo(
    () => ({ lastSentAt, isSending, sendError, sendNow }),
    [lastSentAt, isSending, sendError, sendNow],
  );
}

/** Keyingi Redux / kontekst bilan almashtirish mumkin. */
export function useOptionalActiveOrder(): import("./types").ActiveOrderSnapshot | null {
  return null;
}
