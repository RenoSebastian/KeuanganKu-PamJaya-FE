import api from '@/lib/axios';
import { BulkImportResponse } from '@/lib/types'; // [NEW FASE 1] Import kontrak tipe data Import

// Tipe Data User sesuai response Backend terbaru
export interface User {
    position: string;
    dateOfBirth: any;
    id: string;
    nip: string; // [NEW] Field Baru
    fullName: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'DIRECTOR';
    // Unit Kerja sekarang berupa object relasi
    unitKerja?: {
        id: string;
        namaUnit: string;
    };
    jobTitle?: string; // Optional display only
    createdAt: string;
}

// Payload untuk Create User (Wajib NIP & UnitKerjaId)
export interface CreateUserPayload {
    fullName: string;
    email: string;
    nip: string; // [REQUIRED]
    password: string;
    role: 'USER' | 'ADMIN' | 'DIRECTOR';
    unitKerjaId: string; // [REQUIRED] ID dari dropdown Master Data

    // Opsional
    position?: string; // Sesuai arsitektur PAM Jaya
    jobTitle?: string; // Dipertahankan untuk backward compatibility
    dateOfBirth?: string; // Format: YYYY-MM-DD
    dependentCount?: number;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> { }

// [UPDATE] Kontrak Data untuk Pagination
export interface PaginatedUsersResponse {
    data: User[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export const adminService = {
    // [UPDATE] Get List Users (Support Search, Filter Role, & Pagination)
    getUsers: async (params?: { search?: string; role?: string; page?: number; limit?: number }) => {
        // Mengubah balikan dari Array biasa <User[]> menjadi Object Pagination <PaginatedUsersResponse>
        const response = await api.get<PaginatedUsersResponse>('/users', { params });
        return response.data;
    },

    // Get Detail User
    getUserById: async (id: string) => {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    // Create User Baru (Admin Only)
    createUser: async (data: CreateUserPayload) => {
        const response = await api.post<User>('/users', data);
        return response.data;
    },

    // Update User (Admin Only)
    updateUser: async (id: string, data: UpdateUserPayload) => {
        const response = await api.patch<User>(`/users/${id}`, data);
        return response.data;
    },

    // Delete User (Admin Only)
    deleteUser: async (id: string) => {
        const response = await api.delete<{ message: string; id: string }>(`/users/${id}`);
        return response.data;
    },

    // ============================================================================
    // [NEW FASE 1] BULK IMPORT USERS
    // Endpoint khusus untuk memproses file Excel secara massal menggunakan FormData
    // ============================================================================
    bulkImportUsers: async (file: File): Promise<BulkImportResponse> => {
        // 1. Bungkus file fisik ke dalam FormData
        const formData = new FormData();
        formData.append('file', file);

        // 2. Eksekusi POST request dengan header Multipart
        const response = await api.post<BulkImportResponse>('/users/bulk-import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },
};