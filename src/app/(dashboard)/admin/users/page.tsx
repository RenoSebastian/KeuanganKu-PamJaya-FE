"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, Plus, Pencil, Trash2,
  User as UserIcon, Building2,
  Loader2, IdCard, Mail,
  UploadCloud, X, FolderSearch,
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService, User } from "@/services/admin.service";
import { toast } from "sonner";
import { BulkImportModal } from "@/components/features/admin/users/bulk-import-modal";

export default function AdminUsersPage() {
  // --- STATE UTAMA ---
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // 1. Orkestrasi Debounce & Search Reset
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      // Reset selalu ke halaman pertama setiap ada query pencarian baru
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. Fetch Data (Kebal terhadap perubahan arsitektur Backend)
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response: any = await adminService.getUsers({
        search: debouncedSearch,
        page: currentPage,
        limit: itemsPerPage
      });

      // [FIX] Cek apakah response berupa Array mentah atau Object Pagination
      if (Array.isArray(response)) {
        // Fallback jika backend masih mengembalikan Array mentah
        setUsers(response);
        setTotalPages(1); // Set ke 1 karena tidak ada metadata
        setTotalItems(response.length);
      } else if (response && response.data) {
        // Jika backend sudah mengembalikan Object Pagination
        setUsers(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || response.data.length);
      } else {
        setUsers([]);
      }

    } catch (error) {
      console.error(error);
      toast.error("Waduh, gagal memuat data pegawai nih. Coba lagi ya!");
      setUsers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, currentPage]);

  // 3. Logika Penghapusan dengan Edge Case Handler
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus pegawai "${name}"?\nData yang dihapus tidak bisa dikembalikan lagi.`)) return;

    try {
      await adminService.deleteUser(id);
      toast.success("Yay! Pegawai berhasil dihapus.");

      // Mencegah blank state: Jika ini item terakhir di halaman saat ini (dan bukan halaman 1), mundur 1 halaman.
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchUsers();
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal menghapus pegawai. Pastikan koneksi aman.");
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ["bg-rose-100 text-rose-600", "bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600", "bg-amber-100 text-amber-600", "bg-purple-100 text-purple-600"];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12 font-sans selection:bg-cyan-200">

      {/* --- HEADER --- */}
      <div className="bg-linear-to-br from-brand-900 via-brand-800 to-cyan-900 pt-12 pb-36 px-5 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-100 h-100 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-3000" />
        <div className="absolute bottom-0 left-0 w-75 h-75 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.08] mix-blend-overlay"></div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
              <UserIcon className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-bold text-cyan-50 tracking-wider uppercase">Tim Kita</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Daftar Pegawai
            </h1>
            <p className="text-cyan-100/80 text-sm md:text-base max-w-lg leading-relaxed">
              Kelola data, peran, dan penempatan teman-teman di perusahaan dengan mudah.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-semibold h-12 rounded-xl transition-all active:scale-95"
            >
              <UploadCloud className="w-5 h-5 mr-2" /> Import Excel
            </Button>

            <Link href="/admin/users/create" className="w-full sm:w-auto">
              <Button className="bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/30 font-semibold h-12 rounded-xl w-full transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-2" /> Tambah Pegawai
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-5 -mt-24 space-y-6">

        {/* --- SEARCH BAR --- */}
        <Card className="p-2 shadow-xl shadow-slate-200/40 border-slate-100 bg-white/95 backdrop-blur-xl rounded-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Cari nama teman atau NPP..."
              className="pl-12 pr-12 h-14 bg-transparent border-none shadow-none focus-visible:ring-0 text-base md:text-lg text-slate-700 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </Card>

        {/* --- DATA DISPLAY --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium text-sm">Sedang menyiapkan data untukmu...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-6">

            {/* VIEW UNTUK HP & TABLET KECIL (CARD LIST) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {users.map((user, index) => (
                <Card
                  key={user.id}
                  className="p-5 border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationFillMode: "both", animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(user.fullName)}`}>
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 line-clamp-1">{user.fullName}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> <span className="line-clamp-1">{user.email}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl flex flex-col gap-2 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">NPP</span>
                      <span className="font-mono text-xs font-semibold text-slate-700">{user.nip || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Posisi</span>
                      <span className="text-xs font-semibold text-slate-700 text-right">{user.position || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Unit Kerja</span>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {user.unitKerja?.namaUnit || "Belum di-assign"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">
                      {user.role}
                    </Badge>
                    <div className="flex gap-2">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-600 hover:text-brand-600">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(user.id, user.fullName)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* VIEW UNTUK DESKTOP & TABLET BESAR (TABLE) */}
            <Card className="hidden md:block overflow-hidden shadow-lg shadow-slate-200/40 border-slate-200 bg-white rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-5 font-semibold tracking-wide">Info Pegawai</th>
                      <th className="px-6 py-5 font-semibold tracking-wide">NPP</th>
                      <th className="px-6 py-5 font-semibold tracking-wide">Unit Kerja & Posisi</th>
                      <th className="px-6 py-5 font-semibold tracking-wide">Akses</th>
                      <th className="px-6 py-5 font-semibold tracking-wide text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="bg-white hover:bg-slate-50/80 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(user.fullName)}`}>
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{user.fullName}</div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                <Mail className="w-3 h-3" /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                            {user.nip || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-700 text-xs">
                                {user.unitKerja?.namaUnit || <span className="text-slate-400 italic font-normal">Belum di-assign</span>}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500 ml-6">
                              {user.position || "Belum ada posisi"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className={`border-none ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'DIRECTOR' ? 'bg-amber-100 text-amber-700' :
                                'bg-cyan-100 text-cyan-700'
                              }`}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/users/${user.id}/edit`}>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors" title="Edit Data">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" onClick={() => handleDelete(user.id, user.fullName)} title="Hapus Pegawai">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* --- PAGINATION CONTROLS (UI BARU) --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 mt-2">
              <div className="text-xs text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Menampilkan <span className="text-slate-800 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-800 font-bold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari <span className="text-slate-800 font-bold">{totalItems}</span> pegawai
              </div>

              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-cyan-600 transition-colors shadow-xs"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-cyan-600 transition-colors shadow-xs"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center justify-center min-w-25 h-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs px-4">
                  Hal <span className="text-cyan-600 mx-1.5">{currentPage}</span> / {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-cyan-600 transition-colors shadow-xs"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-cyan-600 transition-colors shadow-xs"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </div>
        ) : (
          <Card className="p-12 border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-3xl text-center animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center">
                <FolderSearch className="w-10 h-10 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Tidak ada pegawai yang ditemukan</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
                  Sepertinya kata kunci "{search}" tidak cocok dengan data siapapun. Coba cari dengan nama atau NPP yang lain, ya!
                </p>
              </div>
              <Button onClick={() => setSearch("")} variant="outline" className="mt-2 rounded-xl border-slate-300 font-medium">
                Bersihkan Pencarian
              </Button>
            </div>
          </Card>
        )}
      </div>

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          setCurrentPage(1); // Paksa lompat ke halaman 1 jika ada impor data baru
        }}
      />
    </div>
  );
}