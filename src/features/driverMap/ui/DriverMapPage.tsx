import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDriverProfile } from "../../../services/driver.service";
import { OfflineBanner } from "../../../shared/ui/OfflineBanner";
import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import {
  useDriverLocationSync,
  useGeolocation,
  useOffline,
  useOptionalActiveOrder,
} from "../hooks";
import { ActiveOrderShortcut } from "./ActiveOrderShortcut";
import { AvailabilityCard } from "./AvailabilityCard";
import { FloatingControls } from "./FloatingControls";
import { OsmMapView } from "./OsmMapView";
import { MapSkeleton } from "./MapSkeleton";

const DEFAULT_MAP_LAT = 41.2995;
const DEFAULT_MAP_LON = 69.2401;

function formatClock(d: Date) {
  return d.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DriverMapPage() {
  const nav = useNavigate();
  const offline = useOffline();
  const geo = useGeolocation();
  const activeOrder = useOptionalActiveOrder();
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [mapZoom, setMapZoom] = useState(15);

  useEffect(() => {
    if (offline) {
      setProfileLoaded(true);
      return;
    }
    let cancelled = false;
    setProfileLoaded(false);
    void (async () => {
      try {
        const p = await fetchDriverProfile();
        if (!cancelled) setIsAvailable(!!p.is_available);
      } catch {
        /* profil bo‘lmasa ham xarita ochiq qolsin */
      } finally {
        if (!cancelled) setProfileLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [offline]);

  const deniedOrUnsupported =
    geo.permission === "denied" || geo.permission === "unsupported";

  const syncCoords = deniedOrUnsupported ? null : geo.coords;
  const { lastSentAt, isSending, sendError, sendNow } = useDriverLocationSync(
    syncCoords,
    isAvailable,
    offline,
  );

  const showSkeleton = geo.loading || (!offline && !profileLoaded);

  const lastSentLabel = useMemo(() => {
    if (!lastSentAt) return null;
    return `Oxirgi yangilanish: ${formatClock(lastSentAt)}`;
  }, [lastSentAt]);

  const statusLine = useMemo(() => {
    if (offline) return "Tarmoq yo‘q — joylashuv serverga yuborilmaydi.";
    if (deniedOrUnsupported) return "";
    if (isSending) return "Yuklanmoqda…";
    return "Joylashuv yuborilmoqda…";
  }, [offline, deniedOrUnsupported, isSending]);

  const mapLat = geo.coords?.lat ?? DEFAULT_MAP_LAT;
  const mapLon = geo.coords?.lon ?? DEFAULT_MAP_LON;
  const showUserMarker = !!geo.coords && !deniedOrUnsupported;

  const onZoomIn = useCallback(() => {
    setMapZoom((z) => Math.min(18, z + 1));
  }, []);
  const onZoomOut = useCallback(() => {
    setMapZoom((z) => Math.max(10, z - 1));
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FA]">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-100/90 bg-white/95 px-3 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50"
          aria-label="Orqaga"
        >
          ←
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-[#0F3460]">
          Xarita
        </h1>
        <div className="flex w-10 shrink-0 justify-end">
          {offline ? (
            <Badge variant="secondary" className="!text-[9px]">
              Oflayn
            </Badge>
          ) : (
            <Badge variant="success" className="!text-[9px]">
              Online
            </Badge>
          )}
        </div>
      </header>

      {offline ? <OfflineBanner /> : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {showSkeleton ? (
          <MapSkeleton />
        ) : (
          <>
            <div
              className={`relative min-h-[calc(100dvh-11rem)] w-full flex-1 overflow-hidden ${
                activeOrder ? "ring-2 ring-[#1A6BAC]/25" : ""
              } ${deniedOrUnsupported ? "opacity-60" : ""}`}
            >
              <div className="absolute inset-0 z-0">
                <OsmMapView
                  lat={mapLat}
                  lon={mapLon}
                  zoom={mapZoom}
                  showMarker={showUserMarker}
                />
              </div>
              {geo.coords && !deniedOrUnsupported ? (
                <p className="pointer-events-none absolute bottom-14 left-2 z-20 max-w-[85%] truncate rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] text-white/90">
                  {geo.coords.lat.toFixed(5)}, {geo.coords.lon.toFixed(5)}
                </p>
              ) : null}
            </div>
            {deniedOrUnsupported ? (
              <div className="pointer-events-none absolute inset-0 z-10 bg-slate-900/15" />
            ) : null}

            <FloatingControls
              zoom={mapZoom}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              onLocate={() => geo.refresh()}
              disabled={offline}
            />

            {!deniedOrUnsupported ? (
              <AvailabilityCard
                isAvailable={isAvailable}
                onAvailableChange={setIsAvailable}
                statusLine={statusLine}
                lastSentLabel={lastSentLabel}
                sendError={sendError}
                onRefresh={sendNow}
                disabled={offline || !geo.coords}
                busy={isSending}
              />
            ) : (
              <div className="pointer-events-auto absolute inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom)+12px)] z-30 max-w-lg rounded-2xl border border-amber-100 bg-white p-4 shadow-xl">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FD7E14]/15 text-xl">
                    📍
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-[#0F3460]">
                      Lokatsiyaga ruxsat bering
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      Haydovchi sifatida ishlash uchun telefoningiz sozlamalarida
                      geolokatsiyani yoqing.
                    </p>
                    {geo.error ? (
                      <p className="mt-2 text-xs text-[#DC3545]">{geo.error}</p>
                    ) : null}
                    <Button
                      variant="primary"
                      className="mt-3 w-full gap-2"
                      type="button"
                      onClick={() => geo.refresh()}
                    >
                      <span aria-hidden>⊙</span> Ruxsat berish
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <ActiveOrderShortcut order={activeOrder} />
          </>
        )}
      </div>
    </div>
  );
}
