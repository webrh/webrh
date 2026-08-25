"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setNome(user.email ?? "");
    }
    verificar();
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-slate-500">Funcionários</p>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-slate-500">Marcações de hoje</p>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-slate-500">Banco de horas</p>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
        </div>
      </main>
    </div>
  );
}
