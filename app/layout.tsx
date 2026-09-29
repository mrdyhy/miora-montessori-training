import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIORA · Training Trợ tá Montessori",
  description: "10 tình huống mỗi ngày để luyện cách quan sát, hỗ trợ và đồng hành cùng trẻ.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
