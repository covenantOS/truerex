"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, ClipboardList, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/capture", icon: Camera, label: "Capture" },
  { href: "/jobs", icon: ClipboardList, label: "Jobs" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Top bar */}
      <header className="px-4 py-3 flex items-center justify-between bg-[#0A0A0A] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#FFD700] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white">TrueRex Local</span>
        </div>
        <Link
          href="/"
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Dashboard
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20">{children}</main>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {tabs.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-colors",
                  active
                    ? "text-[#FFD700]"
                    : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", active && "stroke-[2.5px]")} />
                <span className={cn("text-[11px]", active ? "font-bold" : "font-medium")}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
