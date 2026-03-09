// DTO untuk Payload ke Backend
export interface RiskProfilePayload {
    clientName: string;
    clientAge: number;
    answers: string[]; // ['A', 'B', 'C', ...]
}

// Enum Opsi Jawaban (Agar konsisten A/B/C)
export enum RiskAnswerValue {
    A = 'A',
    B = 'B',
    C = 'C',
}

// Struktur Data Pertanyaan UI
export interface RiskQuestion {
    id: number;
    text: string;
    options: {
        value: RiskAnswerValue;
        label: string;
    }[];
}

// DTO Response dari Backend (Sesuai Swagger BE)
export interface RiskProfileResponse {
    calculatedAt: string;
    clientName: string;
    totalScore: number;
    riskProfile: 'Konservatif' | 'Moderat' | 'Agresif';
    riskDescription: string;
    allocation: {
        lowRisk: number;    // Pasar Uang
        mediumRisk: number; // Obligasi
        highRisk: number;   // Saham
    };
}

// ==========================================
// VIEW MODELS (UI SPECIFIC TYPES)
// ==========================================

// Struktur data agregat untuk mengikat pertanyaan dan jawaban yang dipilih user
// Digunakan murni di client-side untuk merender list jawaban di halaman hasil
export interface RiskAnswerHistory {
    questionId: number;
    questionText: string;
    selectedOptionValue: string;
    selectedOptionLabel: string;
}

// Kontrak Props untuk komponen AnalysisResult
// Memisahkan response API murni dengan ekstra data yang dibutuhkan UI
export interface AnalysisResultProps {
    result: RiskProfileResponse;
    answerHistory: RiskAnswerHistory[];
    // Fungsi opsional jika nanti ada kebutuhan untuk mereset kuis dari komponen hasil
    onRetakeQuiz?: () => void;
}