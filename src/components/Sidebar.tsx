"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/ponto", label: "Registrar Ponto" },
  ];

  return (
    <aside className="w-60 bg-slate-900 text-white h-screen flex flex-col p-4">
      <h1 className="text-xl font-bold mb-8 text-center">WebRH</h1>
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const ativo = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg transition ${
                ativo ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
