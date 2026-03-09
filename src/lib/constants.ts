// src/lib/constants.ts
export const APP_CONFIG = {
    // Pastikan env NEXT_PUBLIC_API_URL di lokal mengarah ke http://localhost:4000/api
    // atau gunakan fallback default di bawah ini.
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api",
    API_TIMEOUT_MS: 30000,
    APP_VERSION: 'v1.0.0',
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'token',
    QUIZ_DRAFT_PREFIX: 'quiz_state_v1_',
    QUIZ_START_TIME_SUFFIX: '_start',
};

export const UI_MESSAGES = {
    ERRORS: {
        NETWORK_TIMEOUT: 'Koneksi waktu habis (Timeout). Server sedang sibuk atau internet Anda lambat. Silakan coba kirim ulang.',
        NETWORK_OFFLINE: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
        SESSION_EXPIRED: 'Sesi berakhir. Silakan login kembali.',
        GENERIC_SUBMIT: 'Gagal mengirim jawaban.',
    },
    SUCCESS: {
        SUBMIT_RECEIVED: 'Jawaban berhasil diterima!',
    },
    LOADING: {
        SUBMITTING: 'Mengirim jawaban ke server...',
    }
};