"use function"; // Hapus baris ini, pakai "use client" di bawah
"use client";

import React, { useState } from "react";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // STATE: Untuk mengatur buka/tutup sidebar di desktop
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-50/50 flex bg-fixed">

      {/* 1. SIDEBAR (DESKTOP VIEW) 
          - Dibuat dinamis lebarnya (w-64 vs w-20)
          - Efek backdrop-blur agar sedikit transparan elegan (Glassmorphism)
      */}
      <aside
        className={`
          hidden md:flex flex-col fixed top-0 left-0 h-screen z-50 
          border-r border-slate-200/60 bg-white/80 backdrop-blur-2xl shadow-sm
          transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Pass state ke dalam Sidebar agar tombol/icon di dalamnya bisa menyesuaikan */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </aside>

      {/* 2. MAIN CONTENT WRAPPER
          - Margin left menyesuaikan lebar sidebar secara otomatis dan halus (transition)
          - Tidak ada lagi kotak "penjara" p-8 atau max-w-7xl. Bebas loss!
      */}
      <main
        className={`
          flex-1 flex flex-col min-h-screen w-full
          transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? "md:pl-20" : "md:pl-64"}
        `}
      >
        {/* Children (Halaman) di-render murni tanpa batasan layout tambahan. 
            Sehingga header background gradien di halaman bisa nempel ujung layar. */}
        <div className="flex-1 w-full pb-20 md:pb-0">
          {children}
        </div>
      </main>

      {/* 3. BOTTOM NAVIGATION (MOBILE VIEW) 
          - Tampil hanya di layar kecil
      */}
      <div className="md:hidden block">
        <BottomNav />
      </div>

    </div>
  );
}