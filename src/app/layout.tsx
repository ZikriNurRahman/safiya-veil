import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safiya Veil — Grace in Style, Pure in Faith",
  description:
    "Koleksi hijab premium untuk wanita modern yang anggun dan syar'i. Temukan koleksi terbaik Safiya Veil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}