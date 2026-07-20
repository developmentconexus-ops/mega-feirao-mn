import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mega Feirão Metal Nobre",
  description: "Fila de vendedores do Mega Feirão Metal Nobre"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
