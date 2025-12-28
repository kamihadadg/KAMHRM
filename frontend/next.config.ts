import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تنظیم متغیرهای محیطی برای زبان فارسی
  env: {
    NEXT_PUBLIC_DEFAULT_LOCALE: 'fa',
  },

  // تنظیمات برای پشتیبانی بهتر از RTL و زبان فارسی
  serverExternalPackages: [],
};

export default nextConfig;
