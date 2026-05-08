import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = { title: "Study App" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="mx-auto max-w-6xl p-4">
        <h1 className="mb-2 text-2xl font-bold">App de Estudos</h1>
        <Nav />
        {children}
      </body>
    </html>
  );
}
