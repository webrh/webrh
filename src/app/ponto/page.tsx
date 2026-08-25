"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function PontoPage() {
  const router = useRouter();
  const [marcado, setMarcado] = useState(false);

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
    }
    verificar();
  }, [router]);

  async function registrar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("marcacoes").insert([
      {
        funcionario_id: user.id,
        tipo: "entrada",
        metodo: "web",
      },
    ]);

    if (!error) {
      setMarcado(true);
      setTimeout(() => setMarcado(false), 3000);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-6">Registrar Ponto</h1>
        <button
          onClick={registrar}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-10 rounded-xl text-lg transition"
        >
          Bater o Ponto
        </button>
        {marcado && (
          <p className="mt-4 text-green-600 font-medium">Ponto registrado com sucesso!</p>
        )}
      </main>
    </div>
  );
}
