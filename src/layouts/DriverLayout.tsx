import { NavLink, Outlet } from "react-router-dom";
import { ROUTES } from "../router/routes";

function navLinkClass(isActive: boolean) {
  return `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
    isActive ? "text-[#1A6BAC]" : "text-slate-500"
  }`;
}

export function DriverLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FA]">
      <div className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/90 bg-white shadow-[0_-4px_20px_rgba(15,52,96,0.06)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-lg">
          <NavLink
            to={ROUTES.driverHome}
            end
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span className="text-lg leading-none" aria-hidden>
              ⌂
            </span>
            Asosiy
          </NavLink>
          <NavLink
            to={ROUTES.driverHistory}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span className="text-lg leading-none" aria-hidden>
              ⧦
            </span>
            Safarlar
          </NavLink>
          <NavLink
            to={ROUTES.driverMap}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span className="text-lg leading-none" aria-hidden>
              ◎
            </span>
            Xarita
          </NavLink>
          <NavLink
            to={ROUTES.driverProfile}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span className="text-lg leading-none" aria-hidden>
              ◉
            </span>
            Profil
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
