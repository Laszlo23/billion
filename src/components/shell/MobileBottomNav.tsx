"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Sparkles, UserCircle2, Store } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/r/sunset-bistro", label: "Tasks", icon: Compass },
  { href: "/restaurant/onboarding", label: "Setup", icon: Sparkles },
  { href: "/player", label: "Profile", icon: UserCircle2 },
  { href: "/restaurant/dashboard", label: "Dashboard", icon: Store },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="glass-surface-strong mx-auto mb-2 flex h-[78px] max-w-xl items-center justify-around rounded-2xl px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs transition ${
                isActive
                  ? "border border-white/25 bg-[linear-gradient(140deg,#ff7a18,#ff3d00)] text-primary-foreground shadow-[0_14px_24px_-14px_rgba(255,122,24,0.55)]"
                  : "font-medium text-slate-300 hover:bg-slate-800/70 hover:text-slate-100"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${isActive ? "" : "opacity-90"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
