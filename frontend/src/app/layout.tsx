import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// تنظیم زبان پیش‌فرض فارسی
const defaultLocale = 'fa';

export const metadata: Metadata = {
  title: "شرکت صرافی کارآفرین - پلتفرم ارزیابی و مشارکت",
  description: "پلتفرم هوشمند ارزیابی عملکرد، نظرسنجی‌های سازمانی و صندوق انتقادات و پیشنهادات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
