"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: number;
}

export function HealthGauge({ score }: HealthGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const end = Math.round(score);
    if (end === 0) {
      setDisplayScore(0);
      return;
    }

    const duration = 1500;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.round(end * easeProgress);

      setDisplayScore(currentVal);

      if (currentFrame >= totalFrames) {
        clearInterval(timer);
        setDisplayScore(end);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [score]);

  // --- KONFIGURASI VISUAL KANVAS (DIPERKECIL) ---
  const size = 160;   // Diperkecil dari 200
  const stroke = 12;  // Diperkecil dari 18 agar garis lebih ramping dan clean
  const radius = (130 - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // --- LOGIKA STATUS & WARNA TEMA ---
  let statusLabel = "Kritis";
  let colorTheme = {
    text: "text-rose-500",
    gradientStart: "#f43f5e",
    gradientEnd: "#9f1239",
  };

  if (score >= 80) {
    statusLabel = "Optimal";
    colorTheme = {
      text: "text-emerald-500",
      gradientStart: "#34d399",
      gradientEnd: "#047857",
    };
  } else if (score >= 50) {
    statusLabel = "Waspada";
    colorTheme = {
      text: "text-amber-500",
      gradientStart: "#fbbf24",
      gradientEnd: "#b45309",
    };
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none group drop-shadow-xl">

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full transform -rotate-90 drop-shadow-lg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`gauge-gradient-${score}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={colorTheme.gradientStart} />
            <stop offset="100%" stopColor={colorTheme.gradientEnd} />
          </linearGradient>

          {/* Glow filter diperkecil sedikit penyebarannya */}
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={stroke}
          fill="none"
          className="opacity-60 transition-colors duration-500"
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gauge-gradient-${score})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          filter="url(#gauge-glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center mt-1"
        >
          <div className="flex items-start">
            {/* Ukuran font diperkecil dari text-6xl menjadi text-4xl/5xl */}
            <span className={cn(
              "text-4xl md:text-5xl font-black tracking-tighter leading-none drop-shadow-sm transition-colors duration-500",
              colorTheme.text
            )}>
              {displayScore}
            </span>
          </div>

          {/* Tracking dan ukuran font label disesuaikan */}
          <span className={cn(
            "text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 md:mt-1.5 opacity-90 transition-colors duration-500",
            colorTheme.text
          )}>
            {statusLabel}
          </span>
        </motion.div>
      </div>
    </div>
  );
}