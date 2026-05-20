import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth } from "../../../store/auth/authSlice";
import { useAppDispatch } from "../../../store/hooks";
import { ROUTES } from "../../../router/routes";

const links = [
  { to: ROUTES.adminRoot, label: "Dashboard", icon: "⌂", end: true },
  { to: ROUTES.adminDrivers, label: "Haydovchilar", icon: "▣" },
  { to: ROUTES.adminUsers, label: "Foydalanuvchilar", icon: "◉" },
  { to: ROUTES.adminOrders, label: "Buyurtmalar", icon: "≡" },
];

function linkClass(active: boolean) {
  return `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
    active ? "bg-[#0F3460] text-white" : "text-slate-600 hover:bg-white"
  }`;
}

export function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#F8F9FA] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-xs font-bold uppercase tracking-wide text-[#1A6BAC]">
              TezYet Taxi
            </div>
            <h1 className="truncate text-lg font-extrabold text-[#0F3460]">
              Admin panel
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch(clearAuth());
              navigate(ROUTES.login, { replace: true });
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
          >
            Chiqish
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-[76px] lg:h-fit">
          <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:grid-cols-4 lg:grid-cols-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => linkClass(isActive)}
              >
                <span aria-hidden>{link.icon}</span>
                <span className="truncate">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
