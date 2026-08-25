import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebRH - Gestão de Ponto",
  description: "Plataforma de registro e apuração de ponto eletrônico",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
