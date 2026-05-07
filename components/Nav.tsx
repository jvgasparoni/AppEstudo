import Link from "next/link";
const links = ["dashboard","questions","questions/new","questions/import","train","exams","flashcards","flashcards/review","stats"];
export default function Nav(){return <nav className="flex flex-wrap gap-2 mb-4">{links.map(l=><Link key={l} className="px-3 py-1 bg-white rounded border" href={`/${l}`}>{l}</Link>)}</nav>}
