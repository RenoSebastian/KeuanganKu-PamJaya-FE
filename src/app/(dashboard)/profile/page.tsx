"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User, Calendar, Briefcase, LogOut, Save, Mail,
  Phone, MapPin, Target, ChevronRight, Camera, Pencil, X,
  ShieldCheck, CheckCircle2, AlertCircle, Building2, MessageCircle, IdCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { authService } from "@/services/auth.service";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- STATE ---
  const [unitKerjaList, setUnitKerjaList] = useState<any[]>([]);

  const [userData, setUserData] = useState<any>({
    fullName: "",
    nip: "",
    email: "",
    role: "",
    unitKerja: "",
    position: "",
    joinDate: "01 Agustus 2015",
    avatar: "",
    goals: "",
    noWa: ""
  });

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "Laki-laki",
    address: "",
    noWa: "",
    avatar: "",
    goals: "",
    nip: "",
    position: "",
    unitKerjaId: ""
  });

  const [backupData, setBackupData] = useState(formData);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- FETCH DATA (PARALLEL PROMISE) ---
  useEffect(() => {
    const fetchProfileAndMasterData = async () => {
      try {
        const [profileRes, unitKerjaRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/master-data/unit-kerja")
        ]);

        const user = profileRes.data;
        const units = Array.isArray(unitKerjaRes.data) ? unitKerjaRes.data : (unitKerjaRes.data.data || []);

        setUnitKerjaList(units);

        setUserData({
          fullName: user.fullName || "",
          nip: user.nip || "-",
          email: user.email || "",
          role: user.role || "USER",
          unitKerja: user.unitKerja ? user.unitKerja.namaUnit : "Belum ada penempatan",
          position: user.position || "-",
          joinDate: "01 Agustus 2015",
          avatar: user.avatar || "",
          goals: user.goals || "",
          noWa: user.noWa || ""
        });

        // Pengamanan tipe date string absolut
        const dob: string = user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().substring(0, 10)
          : "";

        const initialForm = {
          fullName: user.fullName || "",
          dateOfBirth: dob,
          gender: user.gender || "Laki-laki",
          address: user.address || "",
          noWa: user.noWa || "",
          goals: user.goals || "",
          avatar: user.avatar || "",
          nip: user.nip || "",
          position: user.position || "",
          unitKerjaId: user.unitKerjaId ? user.unitKerjaId : (user.unitKerja ? user.unitKerja.id : "")
        };

        setFormData(initialForm);
        setBackupData(initialForm);
        setPreviewImage(user.avatar || null);

      } catch (error) {
        console.error("Gagal load profil atau master data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndMasterData();
  }, []);

  // --- HANDLERS ---
  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2MB ya!");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const handleStartEdit = () => {
    setBackupData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(backupData);
    setPreviewImage(userData.avatar || null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { ...formData };

      const updatedUser: any = await authService.updateProfile(payload);

      setUserData({
        fullName: updatedUser.fullName || "",
        nip: updatedUser.nip || "-",
        email: updatedUser.email || "",
        role: updatedUser.role || "USER",
        unitKerja: updatedUser.unitKerja ? updatedUser.unitKerja.namaUnit : "Belum ada penempatan",
        position: updatedUser.position || "-",
        joinDate: "01 Agustus 2015",
        avatar: updatedUser.avatar || "",
        goals: updatedUser.goals || "",
        noWa: updatedUser.noWa || ""
      });

      setIsEditing(false);
    } catch (error) {
      alert("Gagal menyimpan perubahan. Coba lagi yuk.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  // UX Styling Helpers
  const inputStyle = isEditing
    ? "bg-white border border-cyan-300 ring-4 ring-cyan-500/10 focus:border-cyan-500 text-slate-800 shadow-sm"
    : "bg-slate-50/50 border-transparent text-slate-600 pointer-events-none";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium text-sm animate-pulse">Menyiapkan profil Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-32 font-sans selection:bg-cyan-200">

      {/* --- HERO HEADER BACKGROUND --- */}
      <div className="absolute top-0 left-0 right-0 h-70 bg-linear-to-br from-cyan-900 via-cyan-800 to-brand-800 overflow-hidden z-0 rounded-b-[3rem] shadow-lg">
        <div className="absolute top-0 right-0 w-100 h-100 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-75 h-75 bg-cyan-400/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 flex flex-col md:flex-row gap-6 md:gap-10">

        {/* =========================================================
            KOLOM KIRI: AVATAR & INFO SINGKAT
        ========================================================= */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">

          {/* 1. KARTU AVATAR */}
          <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">

            <div className="relative group mb-5" onClick={handleAvatarClick}>
              <div className={cn(
                "w-32 h-32 rounded-full border-4 shadow-lg overflow-hidden relative transition-all duration-500",
                isEditing ? "border-cyan-400 scale-105 cursor-pointer shadow-cyan-500/30" : "border-white bg-slate-100"
              )}>
                {previewImage ? (
                  <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-5xl text-white font-bold">
                    {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : <User />}
                  </div>
                )}

                <div className={cn(
                  "absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-opacity duration-300",
                  isEditing ? "opacity-100 group-hover:bg-black/60" : "opacity-0 pointer-events-none"
                )}>
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ubah Foto</span>
                </div>
              </div>

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              {!isEditing && (
                <div className="absolute bottom-1 right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-slate-800 leading-tight">
              {formData.fullName || "User Name"}
            </h2>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-1.5 bg-slate-100 px-3 py-1 rounded-full">
              <Mail className="w-3.5 h-3.5" /> {userData.email}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 w-full flex justify-center">
              <span className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-widest border",
                userData.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                  userData.role === 'DIRECTOR' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-cyan-50 text-cyan-600 border-cyan-200'
              )}>
                {userData.role}
              </span>
            </div>
          </div>

          {/* Tombol Logout */}
          {!isEditing && (
            <button
              onClick={handleLogout}
              className="group flex items-center justify-between w-full p-4 bg-white border border-rose-100 rounded-[1.5rem] shadow-sm active:scale-95 transition-all hover:bg-rose-50"
            >
              <span className="font-bold text-rose-600 text-sm">Keluar dari Akun</span>
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                <LogOut className="w-4 h-4 text-rose-600 group-hover:text-white" />
              </div>
            </button>
          )}
        </div>


        {/* =========================================================
            KOLOM KANAN: FORM PERSONAL, ORGANISASI & KONTAK
        ========================================================= */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">

          <div className="hidden md:flex justify-between items-end mb-2">
            <div className="text-white">
              <h1 className="text-3xl font-black">Detail Profil</h1>
              <p className="text-cyan-100 text-sm mt-1">Kelola data personal, pekerjaan, dan informasi kontak Anda.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/30 p-1 md:p-2 relative overflow-hidden transition-all duration-300">
            {isEditing && <div className="absolute inset-0 border-2 border-cyan-400 rounded-[2rem] pointer-events-none animate-pulse" />}

            <div className="p-5 md:p-6 space-y-8">

              {/* --- BAGIAN 1: IDENTITAS DIRI --- */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-600" /> Identitas Diri
                  </h3>
                  {isEditing && (
                    <span className="text-[10px] bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 animate-in fade-in">
                      <Pencil className="w-3 h-3" /> Mengedit
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 ml-1">Nama Lengkap</label>
                    <input
                      disabled={!isEditing} value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={cn("w-full px-4 h-14 rounded-xl text-base font-semibold transition-all focus:outline-none", inputStyle)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">Tanggal Lahir</label>
                    <div className="relative">
                      <input
                        type="date" disabled={!isEditing} value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className={cn("w-full px-4 h-14 rounded-xl text-base font-semibold transition-all focus:outline-none appearance-none", inputStyle)}
                      />
                      {!isEditing && <Calendar className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">Jenis Kelamin</label>
                    <div className="relative">
                      <select
                        disabled={!isEditing} value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={cn("w-full px-4 h-14 rounded-xl text-base font-semibold transition-all focus:outline-none appearance-none", inputStyle)}
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      {isEditing && <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 ml-1">Alamat Domisili</label>
                    <textarea
                      rows={2} disabled={!isEditing} value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder={isEditing ? "Masukkan alamat lengkap..." : "-"}
                      className={cn("w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-all resize-none focus:outline-none leading-relaxed", inputStyle)}
                    />
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* --- BAGIAN 2: DATA KEPEGAWAIAN --- */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-5">
                  <Briefcase className="w-5 h-5 text-cyan-600" /> Data Kepegawaian
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">NPP / NIP</label>
                    <div className="relative">
                      <input
                        disabled={!isEditing} value={formData.nip}
                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        placeholder={isEditing ? "Masukkan NPP..." : "-"}
                        className={cn("w-full pl-12 pr-4 h-14 rounded-xl text-base font-semibold transition-all focus:outline-none", inputStyle)}
                      />
                      <IdCard className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">Posisi Jabatan</label>
                    <div className="relative">
                      <input
                        disabled={!isEditing} value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder={isEditing ? "Contoh: Staff IT..." : "-"}
                        className={cn("w-full pl-12 pr-4 h-14 rounded-xl text-base font-semibold transition-all focus:outline-none", inputStyle)}
                      />
                      <Briefcase className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 ml-1">Unit Kerja / Penempatan</label>
                    <div className="relative">
                      <select
                        disabled={!isEditing} value={formData.unitKerjaId}
                        onChange={(e) => setFormData({ ...formData, unitKerjaId: e.target.value })}
                        className={cn("w-full pl-12 pr-10 h-14 rounded-xl text-base font-semibold transition-all focus:outline-none appearance-none", inputStyle)}
                      >
                        <option value="">-- Belum ada unit kerja yang dipilih --</option>
                        {unitKerjaList.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.namaUnit}
                          </option>
                        ))}
                      </select>
                      <Building2 className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      {isEditing && <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />}
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* --- BAGIAN 3: KONTAK & GOALS --- */}
              <section>
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-5">
                  <Phone className="w-5 h-5 text-cyan-600" /> Kontak & Tujuan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">Nomor WhatsApp</label>
                    <div className="relative">
                      <input
                        type="tel" disabled={!isEditing} value={formData.noWa}
                        onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
                        placeholder={isEditing ? "Contoh: 08123..." : "-"}
                        className={cn("w-full pl-12 pr-4 h-14 rounded-xl text-base font-semibold transition-all focus:outline-none", inputStyle)}
                      />
                      <MessageCircle className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                      Target / Financial Goals
                    </label>
                    <textarea
                      rows={3} disabled={!isEditing} value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      placeholder={isEditing ? "Apa tujuan keuangan Anda tahun ini?" : "Belum ada target yang diatur."}
                      className={cn("w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-all resize-none focus:outline-none leading-relaxed",
                        isEditing ? inputStyle : "bg-cyan-50/50 border-cyan-100 text-cyan-800 italic"
                      )}
                    />
                  </div>
                </div>
              </section>

            </div>

            {/* AREA TOMBOL AKSI */}
            <div className="p-4 md:p-6 bg-slate-50/80 border-t border-slate-100 rounded-b-[2rem]">
              {!isEditing ? (
                <button
                  onClick={handleStartEdit}
                  className="w-full flex items-center justify-center gap-2 h-14 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-all active:scale-95"
                >
                  <Pencil className="w-4 h-4" /> Ubah Data Profil
                </button>
              ) : (
                <div className="flex flex-col-reverse sm:flex-row gap-3 animate-in slide-in-from-bottom-2 duration-300">
                  <button
                    onClick={handleCancel} disabled={isSaving}
                    className="w-full sm:w-1/3 h-14 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" /> Batal
                  </button>
                  <button
                    onClick={handleSave} disabled={isSaving}
                    className="w-full sm:w-2/3 h-14 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 shadow-lg shadow-cyan-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Save className="w-5 h-5" /> Simpan Perubahan</>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-komponen untuk menampilkan Row Data
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors">
        {label}
      </span>
      <span className="text-xs font-extrabold text-slate-700 text-right w-2/3 truncate">
        {value || "-"}
      </span>
    </div>
  );
}