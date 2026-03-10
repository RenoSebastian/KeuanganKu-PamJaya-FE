"use client";

import { useState, useRef } from "react";
import {
    UploadCloud, FileSpreadsheet, X, CheckCircle2,
    AlertTriangle, Loader2, Info, ArrowRight, RefreshCcw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminService } from "@/services/admin.service";
import { BulkImportResponse } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Trigger untuk me-refresh tabel data user di halaman utama
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<BulkImportResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 1. HANDLER DRAG & DROP ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile: File) => {
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "text/csv", // .csv
            "application/vnd.ms-excel" // .xls
        ];

        if (!validTypes.includes(selectedFile.type)) {
            toast.error("Format file tidak didukung. Mohon unggah file .xlsx atau .csv");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
            return;
        }

        setFile(selectedFile);
        setResult(null); // Reset hasil jika ada
    };

    // --- 2. HANDLER UPLOAD ---
    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await adminService.bulkImportUsers(file);
            setResult(response);

            // Jika ada yang berhasil masuk/update, trigger sukses untuk refresh tabel background
            if (response.insertedCount > 0 || response.updatedCount > 0) {
                onSuccess();
            }

            if (response.failedCount === 0) {
                toast.success("Semua data berhasil diimpor!");
            } else {
                toast.warning(`Selesai diproses, namun ada ${response.failedCount} data yang gagal.`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal memproses file import");
        } finally {
            setIsUploading(false);
        }
    };

    // --- 3. HANDLER RESET & CLOSE ---
    const resetAndClose = () => {
        setFile(null);
        setResult(null);
        setIsDragging(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="sm:max-w-175 p-0 overflow-hidden bg-white rounded-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        Import Data Pegawai Massal
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Unggah file Excel (Template List Peserta) untuk mendaftarkan atau memperbarui posisi dan unit kerja pegawai secara otomatis.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6">
                    {/* ================================================================= */}
                    {/* STATE 1: DRAG AND DROP ZONE (Belum ada hasil) */}
                    {/* ================================================================= */}
                    {!result && (
                        <div className="space-y-6">
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center gap-4 text-center cursor-pointer",
                                    isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100",
                                    file && "border-green-500 bg-green-50/30 hover:bg-green-50"
                                )}
                                onClick={() => !file && fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileSelect}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center gap-2 animate-in zoom-in-95">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <FileSpreadsheet className="w-8 h-8" />
                                        </div>
                                        <div className="mt-2">
                                            <p className="font-bold text-slate-800">{file.name}</p>
                                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-2"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        >
                                            Batal Pilih
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shadow-inner">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-base">Klik atau Drag & Drop file di sini</p>
                                            <p className="text-sm text-slate-500 mt-1">Hanya mendukung format .xlsx dan .csv (Max 5MB)</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Aturan Ketat Information */}
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
                                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                                <div className="leading-relaxed">
                                    <p className="font-bold text-amber-900 mb-1">Catatan Penting:</p>
                                    <ul className="list-disc list-inside ml-2 space-y-1 opacity-90">
                                        <li>Pastikan nama <strong>Direktorat / Divisi / Sub Divisi</strong> di file Excel persis sama dengan Master Data.</li>
                                        <li>Sistem akan melakukan <strong>Update (Timpa Posisi)</strong> jika NPP pegawai sudah terdaftar.</li>
                                        <li>Password awal akan di-generate otomatis: <code>Pam + [NamaDepan] + [TglBlnLahir]</code> (Contoh: PamBudi1208).</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={resetAndClose} disabled={isUploading}>Tutup</Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={!file || isUploading}
                                    className="bg-blue-600 hover:bg-blue-700 min-w-35"
                                >
                                    {isUploading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                                    ) : (
                                        <><UploadCloud className="w-4 h-4 mr-2" /> Mulai Import</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ================================================================= */}
                    {/* STATE 2: RESULT SUMMARY & ERROR LOG */}
                    {/* ================================================================= */}
                    {result && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Total Dibaca</p>
                                    <p className="text-2xl font-black text-slate-800 mt-1">{result.totalProcessed}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Baris data</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex flex-col items-center justify-center text-center">
                                    <p className="text-xs font-bold text-green-600 uppercase">Sukses Masuk</p>
                                    <p className="text-2xl font-black text-green-700 mt-1">{result.insertedCount + result.updatedCount}</p>
                                    <p className="text-[10px] text-green-500 mt-1">Baru: {result.insertedCount} | Diperbarui: {result.updatedCount}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-center">
                                    <p className="text-xs font-bold text-red-600 uppercase">Gagal/Ditolak</p>
                                    <p className="text-2xl font-black text-red-700 mt-1">{result.failedCount}</p>
                                    <p className="text-[10px] text-red-500 mt-1">Butuh perbaikan</p>
                                </div>
                            </div>

                            {/* Error Logs Table */}
                            {result.failedCount > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        Detail Penolakan Sistem (Strict Validation)
                                    </div>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <ScrollArea className="h-62.5 w-full">
                                            <Table>
                                                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                                    <TableRow>
                                                        <TableHead className="w-15 text-center">Baris</TableHead>
                                                        <TableHead className="w-25">NPP</TableHead>
                                                        <TableHead>Nama Pegawai</TableHead>
                                                        <TableHead>Alasan Gagal</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {result.errors.map((err, idx) => (
                                                        <TableRow key={idx} className="hover:bg-red-50/50 transition-colors">
                                                            <TableCell className="text-center font-mono text-xs font-medium">{err.row}</TableCell>
                                                            <TableCell className="font-mono text-xs">{err.npp}</TableCell>
                                                            <TableCell className="font-medium text-xs truncate max-w-37.5">{err.name}</TableCell>
                                                            <TableCell className="text-xs text-red-600 leading-tight">{err.reason}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-green-50/50 rounded-2xl border border-green-100">
                                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Integritas Data 100% Sempurna</h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-75">Tidak ada typo atau kesalahan format. Semua data pegawai telah tersinkronisasi ke dalam sistem.</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2">
                                <Button variant="ghost" onClick={() => setFile(null)} className="text-slate-500 hover:text-slate-800">
                                    <RefreshCcw className="w-4 h-4 mr-2" /> Upload File Lain
                                </Button>
                                <Button onClick={resetAndClose} className="bg-slate-800 hover:bg-slate-900">
                                    Selesai & Tutup <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
}