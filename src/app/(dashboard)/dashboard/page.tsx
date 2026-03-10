"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion"; // [FIX]: Import Variants
import { Button } from "@/components/ui/button";
import { HealthGauge } from "@/components/features/dashboard/health-gauge";
import {
  Sparkles, TrendingUp, Calendar, ArrowRight, Info, AlertCircle,
  Wallet, Loader2, Activity, Lightbulb, BellRing
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { financialService } from "@/services/financial.service";
import { authService } from "@/services/auth.service";
import { HealthAnalysisResult, User } from "@/lib/types";

// --- Formatter & Variants ---
const formatMoney = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

// [FIX]: Tambahkan tipe ": Variants"
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// [FIX]: Tambahkan tipe ": Variants"
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// --- Core Data ---
const FINANCE_MENUS = [
  { label: "Anggaran", emoji: "🧮", href: "/calculator/budget", desc: "Kelola cashflow", style: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600" },
  { label: "Pendidikan", emoji: "🎓", href: "/calculator/education", desc: "Biaya sekolah", style: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600" },
  { label: "Tujuan", emoji: "🎯", href: "/calculator/goals", desc: "Beli rumah/mobil", style: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600" },
  { label: "Pensiun", emoji: "☂️", href: "/calculator/pension", desc: "Siapkan hari tua", style: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600" },
  { label: "Proteksi", emoji: "🛡️", href: "/calculator/insurance", desc: "Asuransi jiwa", style: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600" },
  { label: "Checkup", emoji: "📝", href: "/finance/checkup", desc: "Analisa total", style: "bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-600" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [checkupData, setCheckupData] = useState<HealthAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        if (storedUser) setUserData(storedUser);

        const [user, latestCheckup] = await Promise.all([
          authService.getMe().catch(() => null),
          financialService.getLatestCheckup().catch(() => null)
        ]);

        if (user) setUserData(user);
        if (latestCheckup && (latestCheckup.score !== undefined || (latestCheckup as any).healthScore !== undefined)) {
          setCheckupData(latestCheckup);
        }
      } catch (error) {
        console.error("Gagal memuat dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Data Adapters ---
  const hasData = !!checkupData;
  const rawData: any = checkupData || {};
  const score = rawData.score ?? rawData.healthScore ?? 0;
  const status = rawData.globalStatus ?? rawData.status ?? "BELUM DATA";

  let recommendation = "Halo! Silakan lakukan Financial Checkup pertama Anda untuk melihat analisa kesehatan finansial.";
  let bgTheme = "from-blue-600 to-indigo-800"; // Default Theme

  if (hasData) {
    if (score >= 80) {
      recommendation = "Kondisi keuangan Anda sangat prima! Pertahankan dan mulai fokus pada investasi jangka panjang.";
      bgTheme = "from-emerald-500 to-teal-700";
    } else if (score >= 50) {
      recommendation = "Kondisi cukup baik, namun ada beberapa rasio yang perlu diperbaiki. Cek detail rapor Anda.";
      bgTheme = "from-amber-500 to-orange-600";
    } else {
      recommendation = "Perhatian! Keuangan Anda sedang tidak sehat. Segera lakukan perbaikan arus kas dan manajemen utang.";
      bgTheme = "from-rose-600 to-red-800";
    }
  }

  const incomeFixed = Number(rawData.incomeFixed || 0);
  const incomeVariable = Number(rawData.incomeVariable || 0);
  const totalIncome = incomeFixed + incomeVariable;
  const surplusDeficit = Number(rawData.surplusDeficit || 0);
  const totalExpense = hasData ? (totalIncome - surplusDeficit) : 0;
  const netWorth = Number(rawData.netWorth ?? rawData.totalNetWorth ?? 0);
  const displayName = userData?.fullName || userData?.name || "Karyawan";

  return (
    <main className="relative min-h-dvh w-full pb-32 md:pb-12 bg-[#F8FAFC] selection:bg-blue-100">

      {/* =========================================
          DYNAMIC HERO HEADER (Immersive)
          ========================================= */}
      {/* [FIX Tailwind]: h-[380px] -> h-95, md:h-[420px] -> md:h-105 */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-95 md:h-105 rounded-b-[3rem] md:rounded-b-[4rem] shadow-2xl z-0 overflow-hidden transition-colors duration-1000 bg-linear-to-br",
        bgTheme
      )}>
        {/* [FIX Tailwind]: w-[500px] h-[500px] -> w-125 h-125 */}
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-125 h-125 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        {/* [FIX Tailwind]: w-[400px] h-[400px] -> w-100 h-100 */}
        <motion.div animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[10%] -left-[10%] w-100 h-100 bg-black/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-8 md:pt-12">

        {/* --- Top Nav (Mobile & Desktop) --- */}
        <div className="flex justify-between items-center mb-8 md:mb-12 text-white">
          <div className="md:hidden flex items-center">
            <Image src="/images/logokeuanganku.png" alt="Logo" width={140} height={40} className="object-contain brightness-0 invert w-auto h-8" priority />
          </div>
          <div className="hidden md:flex flex-col">
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-[13px] font-bold uppercase tracking-widest">{currentDate}</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">Portal Finansial</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
              <BellRing className="w-5 h-5 text-white" />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
              <span className="text-sm font-bold">{loading && !userData ? "Memuat..." : displayName}</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">👋</div>
            </div>
          </div>
        </div>

        {/* =========================================
            BENTO GRID LAYOUT
            ========================================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6"
        >

          {/* --- MAIN HERO CARD (Kiri/Atas) --- */}
          <motion.div variants={itemVariants} className="md:col-span-8">
            {/* [FIX Tailwind]: min-h-[300px] -> min-h-75 */}
            <div className="bg-white/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden relative border border-white p-6 md:p-8 min-h-75 flex flex-col justify-center group">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Menganalisa Data...</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
                    <div className="inline-flex items-center justify-center md:justify-start gap-2">
                      <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shadow-inner">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status Kesehatan</span>
                    </div>

                    <div className="space-y-2">
                      {hasData ? (
                        <>
                          <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">{status}</h2>
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border flex items-center gap-2",
                              score >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                score >= 50 ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-rose-50 text-rose-600 border-rose-200"
                            )}>
                              <span className={cn("w-2 h-2 rounded-full animate-pulse", score >= 50 ? "bg-emerald-500" : "bg-rose-500")} />
                              {score >= 50 ? "Optimal" : "Kritis"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                            {recommendation}
                          </p>
                        </>
                      ) : (
                        <>
                          <h2 className="text-3xl font-black text-slate-400 tracking-tight">Belum Ada Data</h2>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Diagnosa kondisi keuanganmu sekarang untuk merencanakan masa depan yang lebih baik.
                          </p>
                        </>
                      )}
                    </div>

                    <Button
                      onClick={() => router.push("/finance/checkup")}
                      className={cn(
                        "h-14 px-8 rounded-2xl text-[15px] font-black tracking-wide shadow-xl transition-all hover:scale-105 active:scale-95",
                        hasData ? "bg-slate-900 hover:bg-black text-white shadow-slate-200" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                      )}
                    >
                      {hasData ? "Update Rapor Keuangan" : "Mulai Checkup Sekarang"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>

                  {/* GAUGE WIDGET */}
                  <div className="shrink-0 relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-[60px] opacity-20 transition-all duration-1000",
                      !hasData ? "bg-slate-300" : score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500"
                    )} />
                    <div className={cn("relative z-10 transform group-hover:scale-105 transition-transform duration-700", !hasData && "opacity-40 grayscale")}>
                      <HealthGauge score={score} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN (Cashflow Bento) --- */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-5">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex-1 flex flex-col justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Ringkasan Kas</h3>

              {loading ? (
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              ) : hasData ? (
                <div className="space-y-5">
                  <StatRow label="Pemasukan" value={totalIncome} type="up" />
                  <StatRow label="Pengeluaran" value={totalExpense} type="down" />

                  <div className={cn(
                    "mt-4 p-4 rounded-[1.5rem] border",
                    surplusDeficit >= 0 ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
                  )}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Net Surplus / Bulan</p>
                    <p className={cn("text-2xl font-black tracking-tight", surplusDeficit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {surplusDeficit > 0 ? "+" : ""}{formatMoney(surplusDeficit).replace("Rp", "Rp ")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <Wallet className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400">Data kas belum tersedia</p>
                </div>
              )}
            </div>

            {/* Total Net Worth Mini Bento */}
            {hasData && (
              <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-blue-900/10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1 relative z-10">Total Kekayaan Bersih</p>
                <p className="text-xl font-black tracking-tight relative z-10">{formatMoney(netWorth)}</p>
              </div>
            )}
          </motion.div>

          {/* --- BENTO GRID: SMART TOOLS --- */}
          <motion.div variants={itemVariants} className="md:col-span-12 mt-4">
            <div className="flex items-center justify-between mb-5 px-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Smart Tools</h3>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5">
              {FINANCE_MENUS.map((item, index) => (
                <button
                  key={index}
                  onClick={() => router.push(item.href)}
                  className="group flex flex-col items-center justify-center text-center p-5 md:p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 active:scale-95 transition-all duration-300"
                >
                  <div className={cn(
                    "w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-[1.2rem] text-3xl md:text-4xl mb-4 transition-all duration-300 shadow-inner group-hover:scale-110",
                    item.style.split(' ')[0]
                  )}>
                    <span className="transform group-hover:rotate-12 transition-transform duration-300">{item.emoji}</span>
                  </div>
                  <span className="text-[11px] md:text-xs font-black text-slate-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* --- TIPS WIDGET --- */}
          <motion.div variants={itemVariants} className="md:col-span-12 mt-4 hidden md:block">
            {/* [FIX Tailwind]: bg-gradient-to-r -> bg-linear-to-r */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden flex items-center justify-between group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:translate-x-10 transition-transform duration-1000" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
                  <Lightbulb className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h4 className="font-black text-lg tracking-tight mb-0.5">Insight Hari Ini</h4>
                  <p className="text-sm text-blue-100 font-medium">"Pastikan dana darurat Anda mencukupi minimal 6x pengeluaran bulanan sebelum memulai investasi agresif."</p>
                </div>
              </div>
              <Button variant="outline" className="relative z-10 bg-white/10 border-white/20 text-white hover:bg-white hover:text-blue-600 rounded-xl font-bold">
                Pelajari Modul
              </Button>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </main>
  );
}

// --- Helper UI Components ---
function StatRow({ label, value, type }: { label: string, value: number, type: 'up' | 'down' }) {
  const isUp = type === 'up';
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
          isUp ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
        )}>
          <TrendingUp className={cn("w-5 h-5", !isUp && "rotate-180")} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-base font-black text-slate-800 tracking-tight">
        {formatMoney(value).replace("Rp", "Rp ")}
      </span>
    </div>
  )
}