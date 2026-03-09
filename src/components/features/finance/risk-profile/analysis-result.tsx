"use client";

import { useState, useCallback } from "react";
import { Download, RefreshCw, AlertCircle, FileCheck, ClipboardList, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnalysisResultProps } from "@/lib/types/risk-profile";

// Extends properti aslinya untuk menghindari error TypeScript jika types belum lengkap
interface ExtendedAnalysisResultProps extends AnalysisResultProps {
    onDownloadPdf?: () => void;
    onRetake?: () => void;
    isDownloading?: boolean;
}

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 25) * cos;
    const my = cy + (outerRadius + 25) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={2}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs font-bold">{payload.name}</text>
        </g>
    );
};

export function AnalysisResult({
    result,
    answerHistory,
    onDownloadPdf,
    onRetake,
    isDownloading = false
}: ExtendedAnalysisResultProps) {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

    const onPieEnter = useCallback((_: any, index: number) => {
        setActiveIndex(index);
    }, []);

    const chartData = [
        { name: "Pasar Uang", value: result.allocation.lowRisk, color: "#22c55e" },
        { name: "Obligasi", value: result.allocation.mediumRisk, color: "#eab308" },
        { name: "Saham", value: result.allocation.highRisk, color: "#ef4444" },
    ].filter(item => item.value > 0);

    const getThemeColor = (profile: string) => {
        if (profile === 'Konservatif') return "bg-green-50 text-green-800 border-green-200";
        if (profile === 'Agresif') return "bg-red-50 text-red-800 border-red-200";
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
    };

    const themeClass = getThemeColor(result.riskProfile);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hasil Analisis Profil Risiko</h2>
                <p className="text-slate-500">
                    Halo, <span className="font-semibold text-slate-700">{result.clientName}</span>. Berikut adalah profil investasi yang paling sesuai untuk Anda.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className={`lg:col-span-2 border shadow-sm overflow-hidden ${themeClass}`}>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="h-64 w-64 shrink-0 relative overflow-visible">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart style={{ overflow: "visible" }}>
                                        <Pie
                                            {...({ activeIndex } as any)}
                                            activeShape={renderActiveShape}
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            dataKey="value"
                                            onMouseEnter={onPieEnter}
                                            onMouseLeave={() => setActiveIndex(undefined)}
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Tipe Profil</p>
                                    <h1 className="text-4xl font-black">{result.riskProfile}</h1>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold flex items-center text-sm">
                                        <FileCheck className="w-4 h-4 mr-2" /> Karakteristik Investasi
                                    </h4>
                                    <p className="text-sm leading-relaxed opacity-90 text-justify">
                                        {result.riskDescription}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm flex flex-col justify-center bg-white">
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-600 mb-2">
                            <span className="text-2xl font-black">{result.totalScore}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Skor Total</h4>
                            <p className="text-xs text-slate-500">Skala 10 - 30</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-400 italic">Dianalisis pada {new Date(result.calculatedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {answerHistory && answerHistory.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <ClipboardList className="w-5 h-5 text-slate-700" />
                        <h3 className="font-bold text-slate-800 text-lg">Riwayat Jawaban Anda</h3>
                    </div>

                    <Card className="border-slate-200 shadow-sm bg-white">
                        <Accordion type="single" collapsible className="w-full">
                            {answerHistory.map((item, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0 px-6">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-start text-left gap-3">
                                            <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-slate-700 line-clamp-1">
                                                {item.questionText}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4 pt-1 pl-9">
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                            <div>
                                                <p className="text-xs text-blue-600 font-bold uppercase tracking-tight">Jawaban Terpilih:</p>
                                                <p className="text-sm text-slate-700 font-semibold italic">"{item.selectedOptionLabel}"</p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </Card>
                </div>
            )}

            <Card className="bg-slate-900 border-0 shadow-xl overflow-hidden rounded-2xl">
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center text-slate-400 text-sm">
                        <AlertCircle className="w-5 h-5 mr-3 text-yellow-500" />
                        <span className="max-w-md">Hasil simulasi ini bertujuan untuk edukasi. Konsultasikan dengan ahli keuangan sebelum mengambil keputusan investasi.</span>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <Button
                            variant="ghost"
                            onClick={onRetake}
                            className="flex-1 md:flex-none text-white hover:bg-white/10"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Ulangi
                        </Button>

                        <Button
                            onClick={onDownloadPdf}
                            disabled={isDownloading}
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold px-8"
                        >
                            {isDownloading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Mengolah...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" /> Simpan PDF
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}