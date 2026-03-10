"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home, PieChart, History, User, Building2,
  Wallet, Users, Database, LayoutGrid, X,
  Settings, HelpCircle, LogOut, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("Pegawai");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State untuk Drawer Menu

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setRole(user.role);
        if (user.fullName) setUserName(user.fullName);
      } catch (e) {
        console.error("Gagal parsing user role");
      }
    }
  }, []);

  // --- 1. LOGIKA MENU UTAMA (Tampil di Bottom Nav) ---
  // Maksimal 4 Menu Cepat + 1 Tombol "Lainnya"
  const getPrimaryMenuItems = () => {
    switch (role) {
      case "ADMIN":
        return [
          { label: "Home", icon: Home, href: "/" },
          { label: "Pegawai", icon: Users, href: "/admin/users" },
          { label: "Master", icon: Database, href: "/admin/master" },
          { label: "Profil", icon: User, href: "/profile" },
        ];
      case "DIRECTOR":
        return [
          { label: "Home", icon: Home, href: "/" },
          { label: "Keuangan", icon: Wallet, href: "/finance" },
          { label: "Direksi", icon: Building2, href: "/director" },
          { label: "Profil", icon: User, href: "/profile" },
        ];
      default: // USER
        return [
          { label: "Home", icon: Home, href: "/" },
          { label: "Keuangan", icon: Wallet, href: "/finance" },
          { label: "Hitung", icon: PieChart, href: "/calculator/budget" },
          { label: "Riwayat", icon: History, href: "/history" },
        ];
    }
  };

  // --- 2. LOGIKA MENU LENGKAP (Tampil di dalam Drawer "Lainnya") ---
  const getFullMenuItems = () => {
    const commonMenus = [
      { label: "Pengaturan", icon: Settings, href: "/settings", color: "text-slate-600", bg: "bg-slate-100" },
      { label: "Pusat Bantuan", icon: HelpCircle, href: "/help", color: "text-blue-600", bg: "bg-blue-100" },
    ];

    switch (role) {
      case "ADMIN":
        return [
          { label: "Data Pegawai", icon: Users, href: "/admin/users", color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Master Data", icon: Database, href: "/admin/master", color: "text-emerald-600", bg: "bg-emerald-100" },
          ...commonMenus
        ];
      case "DIRECTOR":
        return [
          { label: "Laporan Keuangan", icon: Wallet, href: "/finance", color: "text-cyan-600", bg: "bg-cyan-100" },
          { label: "Dashboard Direksi", icon: Building2, href: "/director", color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Riwayat Audit", icon: History, href: "/history", color: "text-indigo-600", bg: "bg-indigo-100" },
          ...commonMenus
        ];
      default: // USER
        return [
          { label: "Catatan Keuangan", icon: Wallet, href: "/finance", color: "text-cyan-600", bg: "bg-cyan-100" },
          { label: "Kalkulator Gaji", icon: PieChart, href: "/calculator/budget", color: "text-rose-600", bg: "bg-rose-100" },
          { label: "Riwayat Transaksi", icon: History, href: "/history", color: "text-amber-600", bg: "bg-amber-100" },
          ...commonMenus
        ];
    }
  };

  const primaryItems = getPrimaryMenuItems();
  const fullItems = getFullMenuItems();

  // Handler Navigasi Drawer
  const handleMenuClick = (href: string) => {
    setIsMenuOpen(false); // Tutup drawer
    setTimeout(() => router.push(href), 300); // Tunggu animasi tutup selesai baru pindah
  };

  return (
    <>
      {/* =========================================
          BOTTOM NAVIGATION BAR (MAIN)
      ========================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="w-full bg-white/85 backdrop-blur-2xl border-t border-slate-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] pointer-events-auto pb-[env(safe-area-inset-bottom)]">
          <div className="flex justify-evenly items-center h-17 px-1 max-w-md mx-auto relative">

            {/* Render 4 Menu Utama */}
            {primaryItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="group relative flex flex-col items-center justify-center w-full h-full gap-1 active:scale-90 transition-transform duration-200"
                >
                  {isActive && <div className="absolute top-0 w-8 h-0.75 bg-cyan-600 rounded-b-full shadow-[0_2px_8px_rgba(8,145,178,0.4)]" />}
                  <div className={cn("relative mt-1 transition-all duration-300", isActive && "-translate-y-0.5")}>
                    <Icon className={cn("w-6.5 h-6.5 transition-all duration-300", isActive ? "stroke-cyan-600 fill-cyan-100" : "stroke-slate-400 fill-transparent")} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span className={cn("text-[10px] tracking-wide transition-all duration-300", isActive ? "font-bold text-cyan-700 -translate-y-0.5" : "font-medium text-slate-400")}>
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Tombol ke-5: LAINNYA / MENU (Trigger Drawer) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="group relative flex flex-col items-center justify-center w-full h-full gap-1 active:scale-90 transition-transform duration-200"
            >
              <div className="relative mt-1 transition-all duration-300">
                <LayoutGrid className={cn("w-6.5 h-6.5 transition-all duration-300 stroke-slate-400 fill-transparent group-hover:stroke-slate-500", isMenuOpen && "stroke-cyan-600 fill-cyan-100")} strokeWidth={1.5} />
              </div>
              <span className={cn("text-[10px] font-medium tracking-wide transition-all duration-300 text-slate-400 group-hover:text-slate-500", isMenuOpen && "text-cyan-700 font-bold")}>
                Menu
              </span>
            </button>

          </div>
        </div>
      </nav>

      {/* =========================================
          BOTTOM SHEET DRAWER (MENU LENGKAP)
      ========================================= */}

      {/* 1. Backdrop Gelap Transparan (Bisa diklik untuk tutup) */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ease-in-out",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* 2. Sheet Panel yang meluncur dari bawah */}
      <div
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 bg-slate-50 rounded-t-[2rem] z-60 shadow-2xl transition-transform duration-400 ease-out will-change-transform pb-[env(safe-area-inset-bottom)]",
          isMenuOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex flex-col max-h-[85vh]">

          {/* Header & Drag Handle */}
          <div className="flex flex-col items-center pt-3 pb-2 px-6 bg-white rounded-t-[2rem]">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-4" /> {/* Drag indicator */}
            <div className="flex justify-between items-center w-full">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Eksplorasi Fitur</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 active:scale-90 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto px-6 py-6 space-y-6">

            {/* Profil Singkat (Mini Card) di dalam Menu */}
            <div
              onClick={() => handleMenuClick("/profile")}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-tr from-cyan-600 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">{userName}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wider">{role || "User"}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>

            {/* Grid Semua Menu */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Semua Layanan</p>
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                {fullItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleMenuClick(item.href)}
                    className="flex flex-col items-center gap-2 group active:scale-90 transition-all"
                  >
                    <div className={cn("w-14 h-14 rounded-4xl flex items-center justify-center shadow-sm transition-transform duration-300 group-active:shadow-none", item.bg)}>
                      <item.icon className={cn("w-6 h-6", item.color)} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight w-full wrap-break-word px-1">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}