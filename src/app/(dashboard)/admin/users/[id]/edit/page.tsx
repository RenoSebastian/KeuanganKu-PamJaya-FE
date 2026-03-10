"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Building2, User, Calendar,
  Loader2, Mail, Briefcase, Shield, UserCheck,
  AlertCircle, CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adminService } from "@/services/admin.service";
import { masterDataService, UnitKerja } from "@/services/master-data.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: PageProps) {
  const { id: userId } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [units, setUnits] = useState<UnitKerja[]>([]);

  const [formData, setFormData] = useState({
    fullName: "",
    nip: "",
    email: "",
    unitKerjaId: "",
    role: "USER" as "USER" | "ADMIN" | "DIRECTOR",
    position: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [userData, unitsData] = await Promise.all([
          adminService.getUserById(userId),
          masterDataService.getAllUnits()
        ]);

        setUnits(unitsData);

        let formattedDob = "";
        if (userData.dateOfBirth) {
          formattedDob = new Date(userData.dateOfBirth).toISOString().split('T')[0];
        }

        setFormData({
          fullName: userData.fullName,
          nip: userData.nip || "",
          email: userData.email,
          unitKerjaId: userData.unitKerja?.id || "",
          role: userData.role,
          position: userData.position || "",
          dateOfBirth: formattedDob,
        });

      } catch (error) {
        toast.error("Waduh, data pegawainya gagal dimuat nih. Kita kembali dulu ya.");
        router.push("/admin/users");
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [userId, router]);

  // Copywriting validasi yang humanis
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Hmm, nama lengkapnya jangan sampai kosong ya.";
    if (!formData.nip) newErrors.nip = "NPP wajib diisi dong.";
    if (!formData.email) newErrors.email = "Email perusahaannya kelupaan nih.";
    if (!formData.unitKerjaId) newErrors.unitKerjaId = "Pilih dulu penempatan unit kerjanya.";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Tanggal lahirnya belum diatur nih.";
    if (!formData.position) newErrors.position = "Posisi atau jabatannya apa nih?";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Ada beberapa data yang belum lengkap. Cek lagi ya!");
      return;
    }

    setIsSaving(true);

    try {
      await adminService.updateUser(userId, formData);
      toast.success("Yeay! Data pegawai berhasil diperbarui 🎉");
      router.push("/admin/users");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal memperbarui data pegawai. Coba lagi yuk.";
      const displayMsg = Array.isArray(msg) ? msg[0] : msg;
      toast.error(displayMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper untuk styling role card (Visual Selection)
  const roleDetails = {
    USER: { title: "Pegawai Biasa", desc: "Akses standar untuk pekerjaan harian", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-500" },
    DIRECTOR: { title: "Direktur", desc: "Akses pantau laporan eksekutif", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-500" },
    ADMIN: { title: "Administrator", desc: "Akses penuh kelola sistem & user", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-500" },
  };

  // Loading State yang selaras dengan tema UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
        <div className="relative w-16 h-16 mb-4 animate-pulse">
          <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium text-sm animate-pulse">Menarik data pegawai...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12 font-sans selection:bg-cyan-200">

      {/* --- HEADER --- */}
      <div className="bg-linear-to-br from-brand-900 via-brand-800 to-cyan-900 pt-8 pb-36 px-5 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-100 h-100 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-3000" />
        <div className="absolute bottom-0 left-0 w-75 h-75 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.08] mix-blend-overlay"></div>

        <div className="relative z-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
          <Button
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 mb-8 rounded-full px-4 h-10 gap-2 transition-all active:scale-95"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Kembali</span>
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20 text-cyan-300">
              <UserCheck className="w-8 h-8" />
            </div>
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Perbarui Data Pegawai</h1>
              <p className="text-cyan-100/80 text-sm md:text-base mt-1.5 max-w-lg leading-relaxed">
                Sesuaikan informasi posisi, penempatan, atau hak akses teman kita di sini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT (FORM) --- */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-5 -mt-20">
        <Card className="p-6 md:p-10 rounded-[2rem] shadow-xl shadow-slate-200/40 border-slate-100 bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* SECTION 1: IDENTITAS */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600"><User className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Data Diri Pegawai</h3>
                  <p className="text-xs text-slate-500">Informasi personal sesuai identitas.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-slate-700 font-semibold ml-1">Nama Lengkap <span className="text-rose-500">*</span></Label>
                  <Input
                    placeholder="Contoh: Maghfira Dwi Puspita"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className={cn("h-14 rounded-xl px-4 bg-slate-50/50 focus:bg-white transition-all text-base", errors.fullName && "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20")}
                  />
                  {errors.fullName && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 ml-1"><AlertCircle className="w-3 h-3" /> {errors.fullName}</p>}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-700 font-semibold ml-1">NPP (Nomor Induk) <span className="text-rose-500">*</span></Label>
                  <Input
                    placeholder="Contoh: 502633"
                    value={formData.nip}
                    onChange={e => setFormData({ ...formData, nip: e.target.value })}
                    className={cn("h-14 rounded-xl px-4 bg-slate-50/50 focus:bg-white transition-all text-base font-mono", errors.nip && "border-rose-400 bg-rose-50/30")}
                  />
                  {errors.nip && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 ml-1"><AlertCircle className="w-3 h-3" /> {errors.nip}</p>}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-700 font-semibold ml-1">Email Perusahaan <span className="text-rose-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="nama@pamjaya.co.id"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className={cn("pl-11 h-14 rounded-xl bg-slate-50/50 focus:bg-white transition-all text-base", errors.email && "border-rose-400 bg-rose-50/30")}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 ml-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-700 font-semibold ml-1">Tanggal Lahir <span className="text-rose-500">*</span></Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className={cn("pl-11 block h-14 rounded-xl bg-slate-50/50 focus:bg-white transition-all text-base", errors.dateOfBirth && "border-rose-400 bg-rose-50/30")}
                    />
                  </div>
                  {errors.dateOfBirth && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 ml-1"><AlertCircle className="w-3 h-3" /> {errors.dateOfBirth}</p>}
                </div>
              </div>
            </div>

            {/* SECTION 2: ORGANISASI & ROLE */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><Shield className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Organisasi & Hak Akses</h3>
                  <p className="text-xs text-slate-500">Penempatan posisi dan peran di dalam sistem.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-slate-700 font-semibold ml-1">Penempatan Unit Kerja <span className="text-rose-500">*</span></Label>
                  <select
                    className={cn(
                      "flex h-14 w-full rounded-xl border border-input bg-slate-50/50 focus:bg-white px-4 py-2 text-base transition-all",
                      errors.unitKerjaId && "border-rose-400 bg-rose-50/30 focus:border-rose-500",
                      !formData.unitKerjaId && "text-slate-400"
                    )}
                    value={formData.unitKerjaId}
                    onChange={e => setFormData({ ...formData, unitKerjaId: e.target.value })}
                  >
                    <option value="" disabled>-- Pilih Penempatan --</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id} className="text-slate-800">
                        {unit.namaUnit} ({unit.kodeUnit})
                      </option>
                    ))}
                  </select>
                  {errors.unitKerjaId && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 ml-1"><AlertCircle className="w-3 h-3" /> {errors.unitKerjaId}</p>}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-700 font-semibold ml-1">Posisi / Jabatan <span className="text-rose-500">*</span></Label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <Input
                      placeholder="Contoh: Tax Leader (Plt.)"
                      value={formData.position}
                      onChange={e => setFormData({ ...formData, position: e.target.value })}
                      className={cn("pl-11 h-14 rounded-xl bg-slate-50/50 focus:bg-white transition-all text-base", errors.position && "border-rose-400 bg-rose-50/30")}
                    />
                  </div>
                  {errors.position && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 ml-1"><AlertCircle className="w-3 h-3" /> {errors.position}</p>}
                </div>

                {/* ROLE SELECTOR (Visual & Touch Friendly) */}
                <div className="space-y-3 md:col-span-2 mt-2">
                  <Label className="text-slate-700 font-semibold ml-1">Peran di Sistem (Hak Akses) <span className="text-rose-500">*</span></Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(["USER", "DIRECTOR", "ADMIN"] as const).map((role) => {
                      const isSelected = formData.role === role;
                      const meta = roleDetails[role];
                      return (
                        <div
                          key={role}
                          onClick={() => setFormData({ ...formData, role })}
                          className={cn(
                            "relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 active:scale-95",
                            isSelected ? `${meta.bg} ${meta.border} shadow-sm` : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {isSelected && (
                            <div className={`absolute top-3 right-3 ${meta.color}`}>
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          )}
                          <span className={cn("font-bold text-sm", isSelected ? meta.color : "text-slate-700")}>
                            {meta.title}
                          </span>
                          <span className="text-xs text-slate-500 mt-1 pr-6 leading-relaxed">
                            {meta.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="pt-6 flex flex-col-reverse sm:flex-row gap-4 border-t border-slate-100 mt-8">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-1/3 h-14 rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 text-base"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-2/3 h-14 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all active:scale-95 text-base"
              >
                {isSaving ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Menyimpan Perubahan...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Simpan Perubahan</>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}