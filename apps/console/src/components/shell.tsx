import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useNavigate, useRouteContext } from "@tanstack/react-router";
import { BRAND } from "@wayfound/core";
import clsx from "clsx";
import {
  BarChart3,
  Building2,
  Gauge,
  Inbox,
  LogOut,
  Menu,
  MessageSquareText,
  X,
} from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api.ts";
import { useBusinesses } from "../lib/session.ts";

function NavLink({
  to,
  params,
  icon,
  children,
  onClick,
}: {
  to: string;
  params?: Record<string, string>;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      params={params as never}
      onClick={onClick}
      activeOptions={{ exact: to === "/agency" }}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper-deep hover:text-ink"
      activeProps={{ className: "!bg-cobalt-50 !text-cobalt-800" }}
    >
      {icon}
      <span className="truncate">{children}</span>
    </Link>
  );
}

export function Shell() {
  const { user } = useRouteContext({ from: "/app" });
  const { data: businesses = [] } = useBusinesses();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    qc.clear();
    navigate({ to: "/login", search: { error: undefined } });
  }

  const nav = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="mb-4 flex items-center gap-2 px-2 pt-1">
        <span className="flex size-8 items-center justify-center rounded-lg bg-cobalt-700 font-serif text-lg font-bold text-white">
          W
        </span>
        <span className="font-serif text-lg font-semibold text-cobalt-900">{BRAND.name}</span>
        <span className="ms-auto rounded bg-terracotta-100 px-1.5 py-0.5 text-[10px] font-bold text-terracotta-700">
          DEMO
        </span>
      </div>
      {user.role === "agency" ? (
        <>
          <p className="label px-3 pt-2">Agency</p>
          <NavLink to="/agency" icon={<Gauge className="size-4" />} onClick={close}>
            Overview
          </NavLink>
          <NavLink to="/leads" icon={<Inbox className="size-4" />} onClick={close}>
            Leads
          </NavLink>
          <NavLink to="/agency/audits" icon={<BarChart3 className="size-4" />} onClick={close}>
            Audits
          </NavLink>
          <NavLink to="/templates" icon={<MessageSquareText className="size-4" />} onClick={close}>
            WhatsApp templates
          </NavLink>
        </>
      ) : (
        <>
          <NavLink to="/leads" icon={<Inbox className="size-4" />} onClick={close}>
            Inquiries
          </NavLink>
          <NavLink to="/templates" icon={<MessageSquareText className="size-4" />} onClick={close}>
            WhatsApp templates
          </NavLink>
        </>
      )}
      <p className="label px-3 pt-4">{user.role === "agency" ? "Clients" : "Your business"}</p>
      {businesses.map((b) => (
        <NavLink
          key={b.id}
          to="/b/$bid"
          params={{ bid: b.id }}
          icon={<Building2 className="size-4" />}
          onClick={close}
        >
          {b.name}
        </NavLink>
      ))}
      <div className="mt-auto border-t border-line pt-3">
        <p className="truncate px-3 text-sm font-medium text-ink">{user.name}</p>
        <p className="truncate px-3 text-xs text-ink-soft">{user.email}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-paper-deep"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-e border-line bg-white lg:block">
        {nav}
      </aside>
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <span className="font-serif font-semibold text-cobalt-900">{BRAND.name}</span>
      </div>
      {open ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30"
            aria-label="Close menu"
            onClick={close}
          />
          <aside className="absolute inset-y-0 start-0 w-72 bg-white shadow-xl">
            <button
              type="button"
              className="absolute end-3 top-3"
              onClick={close}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            {nav}
          </aside>
        </div>
      ) : null}
      <main className={clsx("min-w-0 px-4 py-6 sm:px-8")}>
        <Outlet />
      </main>
    </div>
  );
}
