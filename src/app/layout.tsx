import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safiya Veil",
  description: "Grace in Style, Pure in Faith",
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