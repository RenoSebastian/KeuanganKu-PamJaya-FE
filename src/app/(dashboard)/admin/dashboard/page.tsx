"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion"; // [FIX]: Import Variants type
import { Card } from "@/components/ui/card";
import {
    Users, Building, Activity, Settings,
    Plus, FileText, ShieldAlert, ArrowUpRight,
    Server, CheckCircle2, AlertTriangle, LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboardStats } from "@/lib/types";

// --- Framer Motion Variants ---
// [FIX]: Menambahkan tipe eksplisit ": Variants" agar TS tidak bingung
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulasi Fetch Data (Mock)
        const fetchStats = async () => {
            await new Promise(resolve => setTimeout(resolve, 1200));
            setStats({
                totalUsers: 145,
                activeUsers: 140,
                inactiveUsers: 5,
                totalUnits: 12,
                systemHealth: "Normal"
            });
            setLoading(false);
        };

        fetchStats();
    }, []);

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    return (
        <div className="min-h-full w-full pb-24 md:pb-12 bg-[#F8FAFC]">

            {/* --- HEADER BACKGROUND (Immersive Deep Blue) --- */}
            {/* [FIX Tailwind]: h-[340px] -> h-85, h-[380px] -> h-95 */}
            <div className="absolute top-0 left-0 w-full h-85 md:h-95 bg-slate-900 overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3rem] shadow-2xl shadow-blue-900/20 z-0">
                {/* Animated Ambient Blobs */}
                {/* [FIX Tailwind]: w-[500px] -> w-125 */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -right-[10%] w-125 h-125 bg-blue-600/30 rounded-full blur-[120px]"
                />
                {/* [FIX Tailwind]: w-[400px] -> w-100 */}
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[40%] -left-[10%] w-100 h-100 bg-cyan-500/20 rounded-full blur-[100px]"
                />
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">

                {/* --- HEADER TITLE --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 text-white gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-3"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
                            <ShieldAlert className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-cyan-50">Enterprise Admin Console</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
                            System Overview
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed font-medium">
                            Pusat kendali ekosistem KeuanganKu. Pantau metrik operasional, kelola otorisasi pengguna, dan pastikan stabilitas sistem.
                        </p>
                    </motion.div>

                    {/* Server Status Widget */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-[1.5rem] flex items-center gap-4 shadow-lg w-full md:w-auto"
                    >
                        <div className="relative flex items-center justify-center w-10 h-10 bg-black/20 rounded-xl">
                            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse absolute" />
                            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute opacity-50" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest mb-0.5">Server Status</p>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                {loading ? (
                                    <div className="h-4 w-16 bg-white/20 rounded animate-pulse" />
                                ) : (
                                    stats?.systemHealth || "Unknown"
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- STATS GRID --- */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-12"
                >
                    {/* CARD 1: USER STATS */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/95 backdrop-blur-xl p-6 md:p-7 relative overflow-hidden group rounded-[2rem]">
                            <div className="absolute -top-6 -right-6 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all transform group-hover:scale-110 duration-700 pointer-events-none">
                                <Users className="w-40 h-40" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    {/* [FIX Tailwind]: rounded-[1.25rem] -> rounded-3xl / rounded-2xl */}
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-sm border border-blue-100">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Pengguna</h3>
                                </div>

                                <div className="flex items-baseline gap-2 mb-4">
                                    {loading ? (
                                        <div className="h-12 w-24 bg-slate-100 rounded-xl animate-pulse" />
                                    ) : (
                                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                                            {stats?.totalUsers}
                                        </h2>
                                    )}
                                    <span className="text-sm text-slate-500 font-medium">Akun</span>
                                </div>

                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }}
                                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                        className="bg-blue-500 h-full rounded-full"
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mt-2">
                                    <span className="text-blue-600 flex items-center gap-1">
                                        {loading ? <div className="h-3 w-8 bg-blue-100 rounded animate-pulse" /> : `${stats?.activeUsers} Aktif`}
                                    </span>
                                    <span className="text-slate-400 flex items-center gap-1">
                                        {loading ? <div className="h-3 w-8 bg-slate-100 rounded animate-pulse" /> : `${stats?.inactiveUsers} Inactive`}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* CARD 2: ORGANIZATION */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/95 backdrop-blur-xl p-6 md:p-7 relative overflow-hidden group rounded-[2rem]">
                            <div className="absolute -top-6 -right-6 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all transform group-hover:scale-110 duration-700 pointer-events-none">
                                <Building className="w-40 h-40" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 shadow-sm border border-indigo-100">
                                        <Building className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Unit Kerja</h3>
                                </div>

                                <div className="flex items-baseline gap-2 mb-3">
                                    {loading ? (
                                        <div className="h-12 w-16 bg-slate-100 rounded-xl animate-pulse" />
                                    ) : (
                                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                                            {stats?.totalUnits}
                                        </h2>
                                    )}
                                    <span className="text-sm text-slate-500 font-medium">Divisi</span>
                                </div>

                                <p className="text-xs text-slate-500 leading-relaxed mt-4 font-medium">
                                    Mencakup Sekretariat, Bidang Operasional, Keuangan, dan unit teknis terkait.
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* CARD 3: HEALTH */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/95 backdrop-blur-xl p-6 md:p-7 relative overflow-hidden group rounded-[2rem]">
                            <div className="absolute -top-6 -right-6 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all transform group-hover:scale-110 duration-700 pointer-events-none">
                                <Activity className="w-40 h-40" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500 shadow-sm border border-emerald-100">
                                        <Server className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">System Health</h3>
                                </div>

                                <div className="flex items-center gap-4 mb-5 mt-2">
                                    {loading ? (
                                        <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse" />
                                    ) : stats?.systemHealth === "Normal" ? (
                                        <div className="p-2 bg-emerald-50 rounded-full border-4 border-emerald-100">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-amber-50 rounded-full border-4 border-amber-100">
                                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                                        </div>
                                    )}
                                    <div>
                                        {loading ? (
                                            <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse mb-1" />
                                        ) : (
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                                {stats?.systemHealth}
                                            </h2>
                                        )}
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Operational Status</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex justify-between items-center group-hover:bg-white transition-colors">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ping Latency</span>
                                    <span className="text-xs text-emerald-700 font-black bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">45ms</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* --- QUICK ACTIONS --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-10"
                >
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-slate-200/50 rounded-xl text-slate-600">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            Akses Cepat System
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                        <QuickActionCard
                            icon={Plus}
                            title="Registrasi User"
                            subtitle="Buat akun karyawan baru"
                            onClick={() => handleNavigate('/admin/users/create')}
                            color="blue"
                        />
                        <QuickActionCard
                            icon={FileText}
                            title="System Logs & Audit"
                            subtitle="Pantau log aktivitas & error"
                            onClick={() => handleNavigate('/admin/logs')}
                            color="amber"
                        />
                        <QuickActionCard
                            icon={Settings}
                            title="Global Parameters"
                            subtitle="Konfigurasi inti aplikasi"
                            onClick={() => handleNavigate('/admin/settings')}
                            color="slate"
                        />
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

function QuickActionCard({ icon: Icon, title, subtitle, onClick, color }: any) {
    const colorStyles: any = {
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white border-blue-100",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white border-amber-100",
        slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white border-slate-200"
    };

    return (
        <button
            onClick={onClick}
            // [FIX Tailwind]: min-h-[90px] -> min-h-24
            className="group flex items-center gap-5 p-5 min-h-24 bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 active:scale-[0.98] active:shadow-sm transition-all duration-300 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
            <div className={cn("w-14 h-14 rounded-2xl flex shrink-0 items-center justify-center transition-colors duration-500", colorStyles[color])}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h4 className="font-black text-sm md:text-base text-slate-800 group-hover:text-slate-900 tracking-tight transition-colors">{title}</h4>
                <p className="text-[13px] text-slate-500 font-medium group-hover:text-slate-600 transition-colors mt-0.5">{subtitle}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
        </button>
    )
}