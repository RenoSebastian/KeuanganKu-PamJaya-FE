import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KeuanganKu - PamJaya",
  description: "Aplikasi Perencanaan Keuangan Karyawan",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KeuanganKu",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0891b2", // Disesuaikan dengan cyan-600 agar PWA header nyambung
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen overscroll-none selection:bg-cyan-200 selection:text-cyan-900`}
      >
        {children}
      </body>
    </html>
  );
}