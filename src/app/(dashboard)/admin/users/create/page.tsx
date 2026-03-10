"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
   ArrowLeft, Save, UserPlus,
   Building2, Calendar,
   User, Loader2, Briefcase, Mail, CheckCircle2, AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adminService } from "@/services/admin.service";
import { masterDataService, UnitKerja } from "@/services/master-data.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateUserPage() {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [units, setUnits] = useState<UnitKerja[]>([]);

   const [formData, setFormData] = useState({
      fullName: "",
      nip: "",
      email: "",
      password: "PamJaya123!",
      unitKerjaId: "",
      role: "USER" as "USER" | "ADMIN" | "DIRECTOR",
      dateOfBirth: "",
      position: "",
   });

   const [errors, setErrors] = useState<Record<string, string>>({});

   useEffect(() => {
      const fetchUnits = async () => {
         try {
            const data = await masterDataService.getAllUnits();
            setUnits(data);
         } catch (error) {
            toast.error("Waduh, gagal memuat daftar unit kerja nih.");
         }
      };
      fetchUnits();
   }, []);

   // Validasi dengan copywriting yang humanis
   const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!formData.fullName) newErrors.fullName = "Hmm, nama lengkapnya belum diisi nih.";
      if (!formData.nip) newErrors.nip = "NPP wajib diisi ya.";
      if (!formData.email) newErrors.email = "Jangan lupa isi email perusahaan.";
      if (!formData.unitKerjaId) newErrors.unitKerjaId = "Pilih dulu penempatan unit kerjanya.";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Tanggal lahirnya kelupaan.";
      if (!formData.position) newErrors.position = "Posisi pekerjaannya apa nih?";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) {
         toast.error("Ada beberapa data yang belum lengkap. Cek lagi ya!");
         return;
      }

      setLoading(true);

      try {
         await adminService.createUser(formData);
         toast.success(`Yey! Pegawai ${formData.fullName} berhasil didaftarkan 🎉`);
         router.push("/admin/users");
      } catch (error: any) {
         console.error(error);
         const msg = error.response?.data?.message || "Gagal menyimpan data pegawai. Coba lagi yuk.";
         const displayMsg = Array.isArray(msg) ? msg[0] : msg;
         toast.error(displayMsg);
      } finally {
         setLoading(false);
      }
   };

   // Helper untuk styling role card
   const roleDetails = {
      USER: { title: "Pegawai Biasa", desc: "Akses standar untuk pekerjaan harian", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-500" },
      DIRECTOR: { title: "Direktur", desc: "Akses pantau laporan eksekutif", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-500" },
      ADMIN: { title: "Administrator", desc: "Akses penuh kelola sistem & user", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-500" },
   };

   return (
      <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12 font-sans selection:bg-cyan-200">

         {/* --- HEADER --- */}
         <div className="bg-linear-to-br from-brand-900 via-brand-800 to-cyan-900 pt-8 pb-36 px-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-100 h-100 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-3000" />
            <div className="absolute bottom-0 left-0 w-75 h-75 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.08] mix-blend-overlay"></div>

            <div className="relative z-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
               {/* Tombol Back yang elegan di mobile & desktop */}
               <Button
                  variant="ghost"
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 mb-8 rounded-full px-4 h-10 gap-2 transition-all active:scale-95"
                  onClick={() => router.back()}
               >
                  <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Kembali</span>
               </Button>

               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20 text-cyan-300">
                     <UserPlus className="w-8 h-8" />
                  </div>
                  <div className="text-white">
                     <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Registrasi Pegawai</h1>
                     <p className="text-cyan-100/80 text-sm md:text-base mt-1.5 max-w-lg leading-relaxed">
                        Tambahkan akun teman baru agar bisa mengakses sistem perusahaan kita.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* --- MAIN CONTENT (FORM) --- */}
         <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-5 -mt-20">
            <Card className="p-6 md:p-10 rounded-[2rem] shadow-xl shadow-slate-200/40 border-slate-100 bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
               <form onSubmit={handleSubmit} className="space-y-10">

                  {/* SECTION 1: IDENTITAS PEGAWAI */}
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

                  {/* SECTION 2: STRUKTUR ORGANISASI & ROLE */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><Building2 className="w-5 h-5" /></div>
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

                        {/* ROLE SELECTOR (PWA Friendly & Visual) */}
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
                     >
                        Batal
                     </Button>
                     <Button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-2/3 h-14 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all active:scale-95 text-base"
                     >
                        {loading ? (
                           <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Menyimpan Data...</>
                        ) : (
                           <><Save className="w-5 h-5 mr-2" /> Simpan Pegawai Baru</>
                        )}
                     </Button>
                  </div>
               </form>
            </Card>
         </div>
      </div>
   );
}