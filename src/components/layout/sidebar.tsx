"use client";

import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { NAVIGATION_CONFIG } from "@/config/navigation";

// [NEW] Tambahkan interface Props untuk menerima state buka/tutup dari Layout
interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isDirector, setIsDirector] = useState(false);
  const [userInitials, setUserInitials] = useState("U");
  const [userRoleLabel, setUserRoleLabel] = useState("User");
  const [userName, setUserName] = useState("User"); // Untuk tooltip profil

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsAdmin(user.role === 'ADMIN');
        setIsDirector(user.role === 'DIRECTOR');
        setUserRoleLabel(user.role || "User");

        if (user.fullName) {
          setUserName(user.fullName);
          const names = user.fullName.split(' ');
          const initials = names[0].charAt(0) + (names.length > 1 ? names[names.length - 1].charAt(0) : "");
          setUserInitials(initials.toUpperCase());
        }
      } catch (e) {
        console.error("Gagal parsing user data", e);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    router.push("/login");
  };

  // --- KOMPONEN NAVLINK INTERNAL ---
  const NavLink = ({ item, variant = "default" }: { item: any, variant?: "default" | "admin" | "exec" }) => {
    const isActive = variant !== "default"
      ? pathname.startsWith(item.href)
      : pathname === item.href;

    let activeClass = "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30";
    let iconActiveColor = "text-white";

    if (variant === "exec") {
      activeClass = "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-900/30";
    } else if (variant === "admin") {
      activeClass = "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30";
    }

    return (
      <Link
        href={item.href}
        title={isCollapsed ? item.label : undefined} // Tooltip saat tertutup
        className={cn(
          "flex items-center gap-3 py-2.5 mx-3 text-sm font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden",
          isCollapsed ? "justify-center px-0" : "px-3",
          isActive
            ? activeClass
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <item.icon className={cn(
          "w-5 h-5 shrink-0 transition-all duration-300",
          isActive ? iconActiveColor : "text-slate-400 group-hover:text-cyan-600 group-hover:scale-110",
          isCollapsed && !isActive && "text-slate-500"
        )} />

        {/* Teks dibungkus dan diberi animasi hilang (opacity & width) */}
        <span className={cn(
          "relative z-10 whitespace-nowrap transition-all duration-300",
          isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
        )}>
          {item.label}
        </span>

        {/* Aksen garis pinggir kecil untuk yang aktif */}
        {isActive && !isCollapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/40" />}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent">

      {/* 1. HEADER & LOGO SECTION */}
      <div className={cn(
        "h-20 flex items-center shrink-0 border-b border-slate-200/50 transition-all duration-300 relative",
        isCollapsed ? "justify-center px-0" : "justify-between px-6"
      )}
      >
        <div className={cn("flex items-center justify-center w-full overflow-hidden transition-all duration-300", isCollapsed && "hidden")}>
          {/* Container logo dibuat memanjang (w-40) dan lebih tinggi (h-14) */}
          <div className="relative w-44 h-14 drop-shadow-md shrink-0 transition-transform duration-300 hover:scale-105 hover:drop-shadow-xl cursor-pointer">
            <Image
              src="/images/logokeuanganku.png"
              alt="Logo KeuanganKu"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        {/* Logo mini saat sidebar tertutup */}
        {isCollapsed && (
          <div className="relative w-8 h-8 drop-shadow-sm shrink-0">
            <Image src="/images/logokeuanganku.png" alt="Logo" fill className="object-contain" priority />
          </div>
        )}

        {/* Tombol Toggle Buka/Tutup (Hanya Desktop) */}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              "hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm hover:text-cyan-600 hover:border-cyan-200 transition-all absolute top-1/2 -translate-y-1/2",
              isCollapsed ? "-right-3" : "right-4"
            )}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* 2. NAVIGATION AREA */}
      <nav className="flex-1 py-6 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">

        {/* GROUP: MENU UTAMA */}
        {!isAdmin && (
          <div>
            {!isCollapsed && (
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 whitespace-nowrap">Menu Utama</p>
            )}
            <div className={cn("space-y-1", isCollapsed && "mt-2")}>
              {NAVIGATION_CONFIG.main.map((item) => <NavLink key={item.href} item={item} />)}
            </div>
          </div>
        )}

        {/* GROUP: EXECUTIVE */}
        {isDirector && (
          <div className={cn(isCollapsed && "border-t border-slate-100 pt-4 mt-4")}>
            {!isCollapsed && (
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Executive
              </p>
            )}
            <div className="space-y-1">
              {NAVIGATION_CONFIG.director.map((item) => <NavLink key={item.href} item={item} variant="exec" />)}
            </div>
          </div>
        )}

        {/* GROUP: ADMINISTRATOR */}
        {isAdmin && (
          <div className={cn(isCollapsed && "border-t border-slate-100 pt-4 mt-4")}>
            {!isCollapsed && (
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Administrator
              </p>
            )}
            <div className="space-y-1">
              {NAVIGATION_CONFIG.admin.map((item) => <NavLink key={item.href} item={item} variant="admin" />)}
            </div>
          </div>
        )}

      </nav>

      {/* 3. FOOTER / USER PROFILE */}
      <div className={cn("p-4 border-t border-slate-200/50 bg-slate-50/50 transition-all duration-300", isCollapsed && "p-2")}>
        {isCollapsed ? (
          // View Mode Tertutup: Tombol Logout Bulat
          <button
            onClick={handleLogout}
            title={`Keluar (${userName})`}
            className="w-full aspect-square flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          // View Mode Terbuka: Card Profil Lengkap
          <button
            onClick={handleLogout}
            className="group flex items-center justify-between w-full p-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-100 transition-all duration-300 shadow-sm active:scale-95 overflow-hidden"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={cn(
                "w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                isAdmin ? "bg-purple-100 text-purple-700" :
                  isDirector ? "bg-amber-100 text-amber-700" :
                    "bg-cyan-100 text-cyan-700"
              )}>
                {userInitials}
              </div>
              <div className="flex flex-col items-start whitespace-nowrap">
                <span className="leading-none text-slate-700 group-hover:text-rose-600 transition-colors font-bold truncate max-w-25">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">{userRoleLabel}</span>
              </div>
            </div>
            <div className="p-2 rounded-lg group-hover:bg-rose-100 transition-colors">
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 shrink-0" />
            </div>
          </button>
        )}
      </div>

    </div>
  );
}