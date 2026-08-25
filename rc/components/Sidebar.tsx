"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const itens = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/ponto", label: "Registrar Ponto" },
  ];

  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col p-4">
      <h1 className="text-xl font-bold mb-8 px-2">WebRH</h1>
      <nav className="flex flex-col gap-2">
        {itens.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-lg transition ${
              pathname === item.href
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
