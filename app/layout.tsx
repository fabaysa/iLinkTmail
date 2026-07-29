import type { Metadata } from "next";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "iLink TempMail";

export const metadata: Metadata = {
  title: `${appName} — Email Sementara Cepat & Privat`,
  description: "Buat alamat email sementara dalam hitungan detik, terima OTP, dan hapus inbox kapan saja.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
