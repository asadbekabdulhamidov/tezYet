import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearAuth } from "../../store/auth/authSlice";
import { logoutApi } from "../../services/auth.service";
import { fetchMe, patchMe } from "../../services/user.service";
import { fetchDriverProfile } from "../../services/driver.service";
import { ROUTES } from "../../router/routes";
import type { DriverProfile } from "../../types/driver";
import type { UserProfile } from "../../types/user";
import {
  readDriverProfileCache,
  writeDriverProfileCache,
  clearDriverProfileCache,
} from "../../shared/driverProfileCache";
import { Loader } from "../../shared/ui/Loader";

const MOCK_REFRESH = "dev-refresh-token";
const MOCK_ACCESS = "dev-access-token";
const APP_VERSION =
  (import.meta.env.VITE_APP_VERSION as string | undefined) || "v1.0.0";

function formatSyncLabel(iso: string) {
  try {
    return new Date(iso).toLocaleString("uz-UZ", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function MenuRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-slate-100 px-1 py-3.5 text-left last:border-0"
    >
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {subtitle ? (
          <div className="truncate text-xs text-slate-500">{subtitle}</div>
        ) : null}
      </div>
      <span className="text-slate-300" aria-hidden>
        ›
      </span>
    </button>
  );
}

export default function DriverProfilePage() {
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);

  const settingsRef = useRef<HTMLDivElement>(null);

  const [online, setOnline] = useState(() => navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  const isMock =
    accessToken === MOCK_ACCESS || refreshToken === MOCK_REFRESH;

  const load = useCallback(async () => {
    if (!online) {
      const c = readDriverProfileCache();
      if (c) {
        setMe(c.me);
        setProfile(c.profile);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [meRes, profRes] = await Promise.allSettled([
        fetchMe(),
        fetchDriverProfile(),
      ]);
      if (meRes.status === "rejected" || profRes.status === "rejected") {
        const c = readDriverProfileCache();
        if (c) {
          setMe(c.me);
          setProfile(c.profile);
          setError("Tarmoq xatosi. Oxirgi saqlangan ma’lumot ko‘rsatilmoqda.");
        } else {
          const errReason =
            meRes.status === "rejected"
              ? meRes.reason
              : profRes.status === "rejected"
                ? profRes.reason
                : new Error();
          const err = errReason as {
            response?: { data?: { detail?: string } };
          };
          setError(
            String(err?.response?.data?.detail || "Ma’lumotlarni yuklab bo‘lmadi."),
          );
        }
        setLoading(false);
        return;
      }
      setMe(meRes.value);
      setProfile(profRes.value);
      writeDriverProfileCache(meRes.value, profRes.value);
    } finally {
      setLoading(false);
    }
  }, [online]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const cache = readDriverProfileCache();
  const displayMe = me ?? cache?.me ?? null;
  const displayProfile = profile ?? cache?.profile ?? null;
  const ratingNum = displayProfile ? Number(displayProfile.rating) : NaN;
  const ratingLabel =
    displayProfile && !Number.isNaN(ratingNum)
      ? ratingNum.toFixed(1)
      : "—";
  const showProBadge =
    !Number.isNaN(ratingNum) &&
    ratingNum >= 4.5 &&
    (displayProfile?.total_trips ?? 0) >= 10;

  function openEdit() {
    setEditErr(null);
    setEditName(displayMe?.full_name ?? "");
    setEditOpen(true);
  }

  async function saveEdit() {
    const name = editName.trim();
    if (!name) {
      setEditErr("Ism bo‘sh bo‘lmasligi kerak.");
      return;
    }
    setEditBusy(true);
    setEditErr(null);
    try {
      const updated = await patchMe({ full_name: name });
      setMe(updated);
      if (displayProfile) {
        const nextProf: DriverProfile = {
          ...displayProfile,
          user: { ...displayProfile.user, full_name: updated.full_name },
        };
        setProfile(nextProf);
        writeDriverProfileCache(updated, nextProf);
      }
      setEditOpen(false);
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setEditErr(String(d || "Saqlab bo‘lmadi."));
    } finally {
      setEditBusy(false);
    }
  }

  async function onLogout() {
    setLogoutBusy(true);
    try {
      if (!isMock && refreshToken) {
        try {
          await logoutApi(refreshToken);
        } catch {
          /* baribir chiqamiz */
        }
      }
      clearDriverProfileCache();
      dispatch(clearAuth());
      nav(ROUTES.login, { replace: true });
    } finally {
      setLogoutBusy(false);
    }
  }

  const offlineMode = !online && !!cache;

  return (
    <div className="min-h-dvh bg-[#F8F9FA] pb-4">
      <header className="sticky top-0 z-20 border-b border-slate-100/80 bg-white/95 px-3 py-3 backdrop-blur">
        {!online ? (
          <div className="mb-2 rounded-lg bg-[#FD7E14] py-2 text-center text-xs font-semibold text-white">
            Internet mavjud emas
          </div>
        ) : null}
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => nav(ROUTES.driverHome)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50"
            aria-label="Orqaga"
          >
            ←
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-[#0F3460]">
            Haydovchi profili
          </h1>
          <button
            type="button"
            onClick={() =>
              settingsRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50"
            aria-label="Sozlamalar"
          >
            ⚙
          </button>
        </div>
      </header>

      {loading && online ? (
        <div className="px-4 pb-8 pt-4">
          <Loader
            variant="section"
            className="min-h-[55vh] border-0 bg-transparent shadow-none"
            label="Profil yuklanmoqda…"
          />
        </div>
      ) : error && !displayMe ? (
        <div className="mx-auto max-w-lg px-4 pt-6">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
            {error}
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 w-full rounded-xl bg-[#0F3460] py-2.5 text-sm font-semibold text-white"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      ) : offlineMode ? (
        <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-[#0F3460]">
                {(displayMe?.full_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  {displayMe?.full_name}
                </div>
                <div className="text-xs text-slate-500">
                  ID {displayProfile?.id ?? "—"}
                </div>
                <div className="mt-1 text-sm font-bold text-[#FD7E14]">
                  ★ {ratingLabel}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Bugungi balans
              </div>
              <div className="mt-1 text-sm font-bold text-[#0F3460]">—</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Safarlar
              </div>
              <div className="mt-1 text-sm font-bold text-[#0F3460]">
                {displayProfile?.total_trips ?? "—"}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            Oxirgi yangilanish:{" "}
            {cache?.savedAt ? formatSyncLabel(cache.savedAt) : "—"}. Ba’zi
            ma’lumotlar eskirgan bo‘lishi mumkin.
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <MenuRow icon="💰" title="Mening balansim" onClick={() => {}} />
            <MenuRow icon="⚙" title="Sozlamalar" onClick={() => {}} />
            <MenuRow icon="❓" title="Yordam" onClick={() => {}} />
          </div>
          <button
            type="button"
            disabled={logoutBusy}
            onClick={() => void onLogout()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-bold text-[#DC3545] disabled:opacity-60"
          >
            {logoutBusy ? (
              <>
                <Loader variant="button" tone="default" />
                Chiqilmoqda…
              </>
            ) : (
              <>🚪 Chiqish</>
            )}
          </button>
        </div>
      ) : displayMe && displayProfile ? (
        <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
          {error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              {error}
            </div>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="p-4">
              <div className="flex gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-2xl font-bold text-[#0F3460]">
                  {displayMe.full_name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-bold text-slate-900">
                    {displayMe.full_name}
                  </div>
                  <div className="text-sm text-slate-500">{displayMe.phone}</div>
                  {showProBadge ? (
                    <span className="mt-2 inline-block rounded-full bg-[#0F3460]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0F3460]">
                      Professional haydovchi
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#F8F9FA] px-3 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${displayProfile.is_available ? "bg-[#28A745]" : "bg-slate-300"}`}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {displayProfile.is_available ? "Onlayn" : "Oflayn"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">
                      Reyting
                    </div>
                    <div className="text-lg font-bold text-[#FD7E14]">
                      ★ {ratingLabel}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openEdit}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A6BAC]"
                  >
                    ✎ Tahrirlash
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              Ko&apos;rsatkichlar
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-100 bg-white px-2 py-3 text-center shadow-sm">
                <div className="text-[9px] font-bold uppercase text-slate-400">
                  Safarlar soni
                </div>
                <div className="mt-1 text-sm font-bold text-[#0F3460]">
                  {displayProfile.total_trips.toLocaleString("uz-UZ")}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white px-2 py-3 text-center shadow-sm">
                <div className="text-[9px] font-bold uppercase text-slate-400">
                  Bugun
                </div>
                <div className="mt-1 text-sm font-bold text-[#0F3460]">—</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white px-2 py-3 text-center shadow-sm">
                <div className="text-[9px] font-bold uppercase text-slate-400">
                  Umumiy
                </div>
                <div className="mt-1 text-sm font-bold text-[#0F3460]">—</div>
              </div>
            </div>
            <p className="mt-1 px-1 text-[10px] text-slate-400">
              Daromad — backendda alohida endpoint bo‘lgach avtomatik to‘ldiriladi.
            </p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-bold text-[#0F3460]">
                Mashina ma&apos;lumotlari
              </h2>
            </div>
            <div className="p-4">
              <div className="text-base font-bold text-slate-900">
                {displayProfile.car_model}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {displayProfile.car_color} • {displayProfile.car_number}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#28A745]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#28A745]">
                  Faol
                </span>
                <span className="text-xs text-slate-500">
                  Haydovchi ID: {displayProfile.id}
                </span>
              </div>
            </div>
          </section>

          <section
            ref={settingsRef}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <MenuRow
              icon="👤"
              title="Shaxsiy ma'lumotlar"
              subtitle="Ism, aloqa"
              onClick={openEdit}
            />
            <MenuRow
              icon="🌐"
              title="Tilni o'zgartirish"
              subtitle="O'zbekcha"
              onClick={() => {}}
            />
            <MenuRow icon="📞" title="Yordam markazi" onClick={() => {}} />
            <MenuRow icon="🔒" title="Maxfiylik" onClick={() => {}} />
            <MenuRow
              icon="ℹ"
              title="Ilova haqida"
              subtitle={APP_VERSION}
              onClick={() => {}}
            />
          </section>

          <button
            type="button"
            disabled={logoutBusy}
            onClick={() => void onLogout()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-bold text-[#DC3545] disabled:opacity-60"
          >
            {logoutBusy ? (
              <>
                <Loader variant="button" tone="default" />
                Chiqilmoqda…
              </>
            ) : (
              <>🚪 Chiqish</>
            )}
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-lg px-4 pt-6 text-center text-sm text-slate-600">
          Profil ma’lumotlari topilmadi. Asosiy sahifaga o‘ting va qayta
          urinib ko‘ring.
          <button
            type="button"
            onClick={() => nav(ROUTES.driverHome)}
            className="mt-4 w-full rounded-xl bg-[#0F3460] py-2.5 text-sm font-semibold text-white"
          >
            Asosiy
          </button>
        </div>
      )}

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-[#0F3460]">Ismni tahrirlash</h3>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-[#1A6BAC] focus:ring-2 focus:ring-[#1A6BAC]/20"
              placeholder="To‘liq ism"
            />
            {editErr ? (
              <p className="mt-2 text-xs text-[#DC3545]">{editErr}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={editBusy}
                onClick={() => void saveEdit()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F3460] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {editBusy ? (
                  <>
                    <Loader variant="button" tone="onDark" />
                    Saqlanmoqda…
                  </>
                ) : (
                  "Saqlash"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
