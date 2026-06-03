import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Badranaya Partnership — Intranet",
  description: "Employee Intranet Portal — Badranaya Partnership",
  icons: {
    icon: [
      { url: "/badranaya-logo.png", sizes: "32x32" },
      { url: "/badranaya-logo.png", sizes: "16x16" },
    ],
    apple: "/badranaya-logo.png",
    shortcut: "/badranaya-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
