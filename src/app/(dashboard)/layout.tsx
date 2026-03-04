"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Star,
  Share2,
  Users,
  Megaphone,
  ImageIcon,
  Settings,
  Smartphone,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/jobs", icon: ClipboardList, label: "Jobs" },
  { href: "/reviews", icon: Star, label: "Reviews" },
  { href: "/content", icon: Share2, label: "Content" },
  { href: "/campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/referrals", icon: Users, label: "Referrals" },
  { href: "/gallery", icon: ImageIcon, label: "Gallery" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — black */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0A0A0A] text-white shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
            TRUE<span className="text-[#FFD700]">REX</span> <span className="text-xs font-medium text-white/50">LOCAL</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(({ href, icon: Icon, label, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[#FFD700] text-black shadow-sm"
                    : "text-white/55 hover:bg-white/8 hover:text-white/90"
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Field Mode button */}
        <div className="px-3 pb-4">
          <Link
            href="/capture"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-white/8 text-white/70 hover:bg-white/12 hover:text-white transition-colors"
          >
            <Smartphone className="w-[18px] h-[18px]" />
            Field Mode
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#FAFAFA]">
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
