import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { fetchMe } from "../../services/user.service";
import {
  fetchDriverProfile,
  patchDriverLocation,
} from "../../services/driver.service";
import {
  acceptOrder,
  fetchDriverAvailable,
} from "../../services/orders.service";
import { useDriverDashboardSocket } from "../../hooks/useDriverDashboardSocket";
import type { DriverProfile } from "../../types/driver";
import type { UserProfile } from "../../types/user";
import type { DriverAvailableOrder } from "../../types/order";
import { ROUTES } from "../../router/routes";
import {
  DriverOrderCard,
} from "./components/DriverOrderCard";
import { writeDriverProfileCache } from "../../shared/driverProfileCache";
import { Loader } from "../../shared/ui/Loader";

const MOCK_ACCESS = "dev-access-token";

function firstName(full: string) {
  const t = full.trim().split(/\s+/)[0];
  return t || "Haydovchi";
}

function getPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Brauzer joylashuvni qo‘llab-quvvatlamaydi."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => reject(new Error("Joylashuvga ruxsat berilmadi.")),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 15_000 },
    );
  });
}

function ToggleReady({
  on,
  busy,
  onChange,
}: {
  on: boolean;
  busy: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
        on ? "bg-[#1A6BAC]" : "bg-slate-200"
      }`}
      aria-label={on ? "Band qilish" : "Men tayyor"}
    >
      {busy ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader variant="button" tone="onDark" className="!h-4 !w-4 !border-2" />
        </span>
      ) : (
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            on ? "left-7" : "left-1"
          }`}
        />
      )}
    </button>
  );
}

export default function DriverHomePage() {
  const nav = useNavigate();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const [online, setOnline] = useState(() => navigator.onLine);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [me, setMe] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [orders, setOrders] = useState<DriverAvailableOrder[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [acceptMsg, setAcceptMsg] = useState<string | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [toggleHint, setToggleHint] = useState<string | null>(null);

  const lastPosRef = useRef<{ lat: string; lon: string }>({ lat: "", lon: "" });
  const isMock = accessToken === MOCK_ACCESS;

  const replaceOrders = useCallback((next: DriverAvailableOrder[]) => {
    setOrders(next);
  }, []);

  const { wsConnected } = useDriverDashboardSocket(
    accessToken,
    online && !isMock,
    replaceOrders,
  );

  const loadAvailable = useCallback(async () => {
    if (!online) return;
    setRefreshing(true);
    setListError(null);
    try {
      const data = await fetchDriverAvailable();
      setOrders(data);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Buyurtmalar ro‘yxatini yuklashda xato.";
      setListError(String(msg));
    } finally {
      setRefreshing(false);
    }
  }, [online]);

  const bootstrap = useCallback(async () => {
    setBootstrapping(true);
    setListError(null);
    try {
      const [meRes, profRes] = await Promise.allSettled([
        fetchMe(),
        fetchDriverProfile(),
      ]);
      if (meRes.status === "fulfilled") setMe(meRes.value);
      if (profRes.status === "fulfilled") {
        setProfile(profRes.value);
        const lat = profRes.value.current_lat;
        const lon = profRes.value.current_lon;
        if (lat && lon) {
          lastPosRef.current = { lat, lon };
        }
      } else {
        const err = profRes.reason as {
          response?: { data?: { detail?: string } };
        };
        setListError(
          String(err?.response?.data?.detail || "Profilni yuklashda xato."),
        );
      }
      if (meRes.status === "fulfilled" && profRes.status === "fulfilled") {
        writeDriverProfileCache(meRes.value, profRes.value);
      }
      await loadAvailable();
    } finally {
      setBootstrapping(false);
    }
  }, [loadAvailable]);

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

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!online) return;
    const t = window.setInterval(() => {
      void loadAvailable();
    }, 10_000);
    return () => window.clearInterval(t);
  }, [online, loadAvailable]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && online) {
        void loadAvailable();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [online, loadAvailable]);

  useEffect(() => {
    if (!profile?.is_available || !online) return;
    if (!navigator.geolocation) return;
    const wid = navigator.geolocation.watchPosition(
      (p) => {
        lastPosRef.current = {
          lat: String(p.coords.latitude),
          lon: String(p.coords.longitude),
        };
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(wid);
  }, [profile?.is_available, online]);

  useEffect(() => {
    if (!profile?.is_available || !online) return;
    const tid = window.setInterval(() => {
      const { lat, lon } = lastPosRef.current;
      if (lat && lon) {
        void patchDriverLocation({
          lat,
          lon,
          is_available: true,
        }).catch(() => {});
      }
    }, 10_000);
    return () => window.clearInterval(tid);
  }, [profile?.is_available, online]);

  async function setAvailable(next: boolean) {
    setToggleHint(null);
    setToggleBusy(true);
    try {
      if (next) {
        const pos = await getPosition();
        const lat = String(pos.lat);
        const lon = String(pos.lon);
        lastPosRef.current = { lat, lon };
        await patchDriverLocation({
          lat,
          lon,
          is_available: true,
        });
        setProfile((p) => (p ? { ...p, is_available: true } : p));
        void loadAvailable();
      } else {
        const { lat, lon } = lastPosRef.current;
        await patchDriverLocation({
          ...(lat && lon ? { lat, lon } : {}),
          is_available: false,
        });
        setProfile((p) => (p ? { ...p, is_available: false } : p));
      }
    } catch (e) {
      setToggleHint(e instanceof Error ? e.message : "Xato");
    } finally {
      setToggleBusy(false);
    }
  }

  async function onAccept(id: number) {
    setAcceptMsg(null);
    setAcceptingId(id);
    try {
      await acceptOrder(id);
      nav(`/driver/order/${id}`, { replace: true });
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response
        ?.status;
      const detail = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      if (status === 409) {
        setAcceptMsg("Buyurtmani boshqa haydovchi qabul qildi.");
      } else {
        setAcceptMsg(String(detail || "Qabul qilishda xato."));
      }
    } finally {
      setAcceptingId(null);
    }
  }

  const fullName = me?.full_name ?? profile?.user?.full_name ?? "Haydovchi";
  const ratingNum = profile ? Number(profile.rating) : null;
  const ratingLabel =
    ratingNum != null && !Number.isNaN(ratingNum)
      ? ratingNum.toFixed(1)
      : "—";

  const showWsHint = !isMock && online && !wsConnected && !!accessToken;

  return (
    <div className="min-h-dvh bg-[#F8F9FA] pb-2">
      <header className="sticky top-0 z-20 border-b border-slate-100/80 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={ROUTES.driverProfile}
              className="flex min-w-0 items-center gap-3 rounded-xl outline-none ring-[#1A6BAC] focus-visible:ring-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-[#0F3460]">
                {firstName(fullName).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-500">
                  TezYet Taxi
                </div>
                <div className="truncate text-sm font-bold text-[#0F3460]">
                  Haydovchi panel
                </div>
              </div>
            </Link>
          </div>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-lg text-slate-600"
            aria-label="Bildirishnomalar"
          >
            🔔
          </button>
        </div>
      </header>

      {!online ? (
        <div className="bg-[#FD7E14] px-4 py-2 text-center text-sm font-semibold text-white">
          Internet mavjud emas
        </div>
      ) : null}

      <main className="mx-auto max-w-lg px-4 pb-6 pt-4">
        {bootstrapping ? (
          <Loader
            variant="section"
            className="min-h-[50vh] border-0 bg-transparent shadow-none"
            label="Ma’lumotlar tayyorlanmoqda…"
          />
        ) : !profile ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
            {listError || "Profil topilmadi."}
            <button
              type="button"
              onClick={() => void bootstrap()}
              className="mt-3 w-full rounded-xl bg-[#0F3460] py-2.5 text-sm font-semibold text-white"
            >
              Qayta urinish
            </button>
          </div>
        ) : !online ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Siz hozir bandsiz
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Yangi buyurtmalarni qabul qilish uchun statusni
                    o&apos;zgartiring
                  </p>
                </div>
                <ToggleReady
                  on={false}
                  busy={toggleBusy}
                  onChange={(next) => {
                    if (next) void setAvailable(true);
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                <div className="text-[10px] font-semibold uppercase text-slate-400">
                  Bugungi daromad
                </div>
                <div className="mt-1 text-sm font-bold text-[#0F3460]">
                  0 so&apos;m
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                <div className="text-[10px] font-semibold uppercase text-slate-400">
                  Safarlar soni
                </div>
                <div className="mt-1 text-sm font-bold text-[#0F3460]">0</div>
              </div>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center shadow-sm">
              <div className="text-4xl">🛤️</div>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Hozircha buyurtmalar mavjud emas
              </p>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                Yangi buyurtmalar shu yerda paydo bo&apos;ladi. Iltimos,
                tarmoqqa ulanishingizni tekshiring.
              </p>
              <button
                type="button"
                onClick={() => void bootstrap()}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F3460] px-5 py-2.5 text-sm font-semibold text-white"
              >
                ↻ Yangilash
              </button>
            </div>
          </div>
        ) : (
          <>
            {!profile.is_available ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Siz hozir bandsiz
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Yangi buyurtmalarni qabul qilish uchun &quot;Men
                        tayyor&quot;ni yoqing
                      </p>
                    </div>
                    <ToggleReady
                      on={false}
                      busy={toggleBusy}
                      onChange={(next) => {
                        if (next) void setAvailable(true);
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">
                      Bugungi daromad
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#0F3460]">
                      —
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">
                      Jami safarlar
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#0F3460]">
                      {profile.total_trips}
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-500">
                  Tarmoqda. Buyurtmalar ro&apos;yxati yangilanadi.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-[#0F3460]">
                    Assalomu alaykum, {firstName(fullName)}.
                  </span>{" "}
                  Bugungi safarlarga tayyormisiz?
                </p>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        Siz hozir tayyorsiz
                      </div>
                      <p className="mt-0.5 text-xs text-[#1A6BAC]">
                        Joylashuv yuborilmoqda…
                      </p>
                      {toggleHint ? (
                        <p className="mt-2 text-xs text-[#DC3545]">
                          {toggleHint}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-medium text-slate-500">
                        Men tayyor
                      </span>
                      <ToggleReady
                        on={profile.is_available}
                        busy={toggleBusy}
                        onChange={(next) => void setAvailable(next)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-slate-100 bg-white px-2 py-3 text-center shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Safarlar
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#0F3460]">
                      {profile.total_trips}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white px-2 py-3 text-center shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Daromad
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#0F3460]">
                      —
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white px-2 py-3 text-center shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Reyting
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#FD7E14]">
                      ★ {ratingLabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#0F3460]">
                    Mavjud buyurtmalar
                  </h2>
                  <div className="flex items-center gap-2 text-xs">
                    {orders.length > 0 ? (
                      <span className="rounded-full bg-[#1A6BAC]/10 px-2 py-0.5 font-semibold text-[#1A6BAC]">
                        {orders.length} ta yangi
                      </span>
                    ) : null}
                    {refreshing || showWsHint ? (
                      <Loader variant="inline" label="Yangilanmoqda…" />
                    ) : null}
                  </div>
                </div>

                {listError ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {listError}
                  </div>
                ) : null}

                {acceptMsg ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    {acceptMsg}
                  </div>
                ) : null}

                {refreshing && orders.length === 0 ? (
                  <Loader
                    variant="section"
                    className="min-h-[200px]"
                    label="Buyurtmalar yuklanmoqda…"
                  />
                ) : orders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
                    Hozircha yangi buyurtmalar yo&apos;q. WebSocket va 10 s
                    polling yangilaydi.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <DriverOrderCard
                        key={o.id}
                        order={o}
                        onAccept={onAccept}
                        accepting={acceptingId === o.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
