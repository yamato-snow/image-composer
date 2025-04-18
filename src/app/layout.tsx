import type { Metadata } from "next";
import '@/styles/globals.css'
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Image Composer",
  description: "テンプレートを使って画像を一括生成するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
