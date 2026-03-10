"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  LogIn, Eye, EyeOff, Lock, Mail, AlertCircle,
  ArrowLeft, ShieldCheck, KeyRound, Loader2, HelpCircle
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [step, setStep] = useState<'LOGIN' | 'CHANGE_PASSWORD'>('LOGIN');

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [changePwData, setChangePwData] = useState({
    userId: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.requirePasswordChange) {
        setChangePwData(prev => ({
          ...prev,
          userId: response.userId || "",
          oldPassword: formData.password,
        }));
        setStep('CHANGE_PASSWORD');
        return;
      }

      if (response.access_token && response.user) {
        redirectUser(response.user.role);
      }
    } catch (err: any) {
      setError(err.response?.status === 403 || err.response?.status === 401
        ? "Kredensial tidak valid. Periksa kembali Email/NPP Anda."
        : "Terjadi gangguan koneksi. Mohon coba sesaat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (changePwData.newPassword !== changePwData.confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.changeInitialPassword({
        userId: changePwData.userId,
        oldPassword: changePwData.oldPassword,
        newPassword: changePwData.newPassword,
      });

      if (response.access_token && response.user) {
        setSuccessMsg("Kata sandi diperbarui! Mengalihkan...");
        setTimeout(() => redirectUser(response.user!.role), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memperbarui kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUser = (role: string) => {
    const target = callbackUrl || (
      role === 'DIRECTOR' ? '/_director/dashboard' :
        role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
    );
    router.push(target);
  };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'LOGIN' ? (
          <motion.div
            key="login-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-none shadow-2xl shadow-blue-900/10 bg-white/90 backdrop-blur-xl rounded-[2rem]">
              <CardContent className="p-8 sm:p-10">
                <form onSubmit={handleLogin} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[13px] flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2 font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className="text-slate-600 font-bold text-[13px] ml-1 uppercase tracking-wider">Email / NPP</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="email"
                          placeholder="nama@pamjaya.co.id atau NPP"
                          className="pl-12 h-14 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all rounded-2xl text-base"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="password" title="password-label" className="text-slate-600 font-bold text-[13px] ml-1 uppercase tracking-wider">Kata Sandi</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-12 pr-12 h-14 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all rounded-2xl text-base"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-base font-black uppercase tracking-widest rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Masuk Dashboard"}
                  </Button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-5">
                  <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50 flex items-start gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600">
                      <HelpCircle size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] text-slate-700 font-bold">Butuh bantuan akses?</p>
                      <p className="text-[12px] text-slate-500 leading-relaxed">
                        Hubungi IT Support kami di <a href="mailto:hello@keuanganku.id" className="text-blue-600 font-bold hover:underline">hello@keuanganku.id</a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="change-pw-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-none shadow-2xl shadow-amber-900/10 bg-white/95 backdrop-blur-xl rounded-[2rem]">
              <CardContent className="p-8 sm:p-10">
                <div className="mb-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-inner">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Keamanan Akun</h2>
                  <p className="text-sm text-slate-500 mt-2 font-medium">Mohon perbarui kata sandi default Anda untuk melanjutkan.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[13px] flex items-center gap-3 border border-red-100 font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  )}
                  {successMsg && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-[13px] flex items-center gap-3 border border-emerald-100 font-bold animate-pulse">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      {successMsg}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-bold text-[12px] ml-1 uppercase tracking-wider">Kata Sandi Baru</Label>
                      <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Minimal 6 karakter"
                          className="pl-12 pr-12 h-14 bg-slate-50 border-amber-100 focus:bg-white focus:ring-8 focus:ring-amber-500/5 rounded-2xl"
                          value={changePwData.newPassword}
                          onChange={(e) => setChangePwData({ ...changePwData, newPassword: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 p-1"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600 font-bold text-[12px] ml-1 uppercase tracking-wider">Konfirmasi Kata Sandi</Label>
                      <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Ulangi kata sandi baru"
                          className="pl-12 h-14 bg-slate-50 border-amber-100 focus:bg-white focus:ring-8 focus:ring-amber-500/5 rounded-2xl"
                          value={changePwData.confirmPassword}
                          onChange={(e) => setChangePwData({ ...changePwData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 mt-6 text-base font-black uppercase tracking-widest rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-200 transition-all active:scale-[0.98]"
                    disabled={isLoading || !!successMsg}
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Simpan & Lanjutkan"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh w-full flex flex-col items-center justify-center bg-[#F8FAFC] relative overflow-hidden p-6 selection:bg-blue-100">
      {/* Immersive Background Decorations */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[5%] -left-[5%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Floating Header */}
      <Link
        href="/"
        className="fixed top-8 left-8 z-50 flex items-center gap-3 text-sm font-black text-slate-400 hover:text-blue-600 transition-all group"
      >
        <div className="w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
          <ArrowLeft size={18} strokeWidth={3} />
        </div>
        <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Beranda</span>
      </Link>

      <div className="relative z-10 w-full max-w-md flex flex-col gap-10">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* [FIX]: Logo dibuat "bebas" dan besar tanpa kotak background */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center"
          >
            <Image
              src="/images/logokeuanganku.png"
              alt="Logo"
              width={240}
              height={60}
              className="object-contain h-12 sm:h-14 w-auto"
              priority
            />
          </motion.div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">Selamat Datang</h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-70 mx-auto">
              Portal Financial Wellness Karyawan
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="h-96 w-full flex items-center justify-center bg-white rounded-[2.5rem] shadow-sm animate-pulse">
            <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        <footer className="text-center space-y-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} KeuanganKu &bull; Secure Connection Verified
          </p>
        </footer>
      </div>
    </main>
  );
}