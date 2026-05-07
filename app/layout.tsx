import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = { title: "Study App" };
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="pt-BR"><body className="p-4 max-w-6xl mx-auto"><h1 className="text-2xl font-bold mb-2">Study MVP</h1><Nav />{children}</body></html>
}
