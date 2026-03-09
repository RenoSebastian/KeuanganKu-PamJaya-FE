'use client';

import { useEffect, useState, use } from 'react';
import { ModuleForm } from '@/components/features/admin/education/form/module-form';
import { educationService } from '@/services/education.service';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditModulePageProps {
    params: Promise<{ id: string }>;
}

export default function EditModulePage({ params }: EditModulePageProps) {
    const resolvedParams = use(params);
    const moduleId = resolvedParams.id;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await educationService.getModuleDetailAdmin(moduleId);
                setData(res);
            } catch (err: any) {
                console.error("Fetch Error:", err);
                toast.error("Gagal memuat data modul: " + (err.message || "Unknown error"));
            } finally {
                setLoading(false);
            }
        };

        if (moduleId) {
            fetchData();
        }
    }, [moduleId]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data && !loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <p className="text-muted-foreground">Modul tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Edit Materi</h2>
            <ModuleForm initialData={data} />
        </div>
    );
}