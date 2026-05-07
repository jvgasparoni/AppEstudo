import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/questions", label: "Banco de questoes" },
  { href: "/questions/new", label: "Nova questao" },
  { href: "/questions/import", label: "Importar" },
  { href: "/train", label: "Praticar" },
  { href: "/exams", label: "Simulados" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/flashcards/review", label: "Revisao" },
  { href: "/stats", label: "Estatisticas" },
];

export default function Nav() {
  return (
    <nav className="mb-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link key={link.href} className="rounded border bg-white px-3 py-1 text-sm hover:bg-slate-100" href={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
