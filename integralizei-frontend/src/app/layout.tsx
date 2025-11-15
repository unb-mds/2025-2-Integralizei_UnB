import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Integralizei UnB",
  description: "Planeje sua integralização com dados reais da UnB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} bg-white text-gray-900 min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
