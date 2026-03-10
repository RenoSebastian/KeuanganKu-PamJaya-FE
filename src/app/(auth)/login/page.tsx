"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // [NEW FASE 2] State Machine untuk mengontrol Step UI
  const [step, setStep] = useState<'LOGIN' | 'CHANGE_PASSWORD'>('LOGIN');

  // State Data Login
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // State Data Change Password
  const [changePwData, setChangePwData] = useState({
    userId: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- 1. LOGIC: REGULAR LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      // [NEW FASE 2] Tangkap flag First Login Guard
      if (response.requirePasswordChange) {
        setChangePwData({
          userId: response.userId || "",
          oldPassword: formData.password, // Pre-fill password lama agar user tidak perlu ngetik ulang
          newPassword: "",
          confirmPassword: "",
        });
        setStep('CHANGE_PASSWORD');
        setIsLoading(false);
        return;
      }

      // Jika normal (Ada token)
      if (response.access_token && response.user) {
        const role = response.user.role;
        redirectUser(role);
      }

    } catch (err: any) {
      console.error("Login Failed:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("Email atau password salah. Silakan coba lagi.");
      } else {
        setError("Terjadi kesalahan sistem. Hubungi administrator.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. LOGIC: FORCE CHANGE PASSWORD ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (changePwData.newPassword !== changePwData.confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (changePwData.newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.changeInitialPassword({
        userId: changePwData.userId,
        oldPassword: changePwData.oldPassword,
        newPassword: changePwData.newPassword,
      });

      // Sukses ganti dan langsung dapat token
      if (response.access_token && response.user) {
        setSuccessMsg("Kata sandi berhasil diperbarui! Mengalihkan ke dashboard...");
        setTimeout(() => {
          redirectUser(response.user!.role);
        }, 1500);
      }

    } catch (err: any) {
      console.error("Change PW Failed:", err);
      setError(err.response?.data?.message || "Gagal mengubah kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUser = (role: string) => {
    if (callbackUrl) {
      router.push(callbackUrl);
    } else {
      if (role === 'DIRECTOR') router.push('/director/dashboard');
      else if (role === 'ADMIN') router.push('/admin/dashboard');
      else router.push('/dashboard');
    }
  };

  // ============================================================================
  // RENDER: STEP 1 (FORM LOGIN BIASA)
  // ============================================================================
  if (step === 'LOGIN') {
    return (
      <Card className="p-8 border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email / NPP</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                id="email"
                placeholder="nama@pamjaya.co.id atau 502XXX"
                className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <LogIn className="w-5 h-5" /> Masuk Aplikasi
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Belum memiliki akun?{" "}
            <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
              Daftar Akun
            </Link>
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Jika Anda mengalami kendala atau masalah saat login, silakan hubungi admin di nomor{" "}
            <a href="tel:+6281224000269" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
              +6281224000269
            </a>.
          </p>
        </div>
      </Card>
    );
  }

  // ============================================================================
  // RENDER: STEP 2 (FORM FORCE CHANGE PASSWORD)
  // ============================================================================
  return (
    <Card className="p-8 border-amber-200 shadow-2xl bg-linear-to-b from-amber-50/50 to-white backdrop-blur-sm animate-in slide-in-from-right-8 duration-500">

      <div className="mb-6 flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Keamanan Akun</h2>
        <p className="text-sm text-slate-500 leading-relaxed px-2">
          Anda menggunakan kata sandi default sistem. Demi keamanan privasi finansial Anda, mohon buat kata sandi baru untuk melanjutkan.
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-green-100 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="space-y-1.5 hidden">
          {/* Sengaja di-hidden agar UI bersih, tapi valuenya ikut terkirim */}
          <Label>Password Default Saat Ini</Label>
          <Input type="password" value={changePwData.oldPassword} readOnly className="bg-slate-100 text-slate-400" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">Kata Sandi Baru</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              className="pl-10 pr-10 h-12 bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
              value={changePwData.newPassword}
              onChange={(e) => setChangePwData({ ...changePwData, newPassword: e.target.value })}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Ulangi Kata Sandi Baru</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              id="confirm-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="Ketik ulang password baru"
              className="pl-10 h-12 bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
              value={changePwData.confirmPassword}
              onChange={(e) => setChangePwData({ ...changePwData, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 mt-4 text-base font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all"
          disabled={isLoading || !!successMsg}
        >
          {isLoading ? "Menyimpan..." : "Simpan & Lanjutkan"}
        </Button>
      </form>
    </Card>
  );
}

// Component Utama yang di-export
export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-white/60"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600/10 -skew-y-3 origin-top-left" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-4">
            <Image
              src="/images/logokeuanganku.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang Kembali</h1>
          <p className="text-slate-500 mt-2">Masuk untuk mengakses Financial Checkup Anda</p>
        </div>

        <Suspense fallback={<div className="text-center p-8">Memuat halaman login...</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} KeuanganKu Financial Wellness. All rights reserved.
        </p>
      </div>
    </div>
  );
}