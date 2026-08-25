"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [supEmail, setSupEmail] = useState("");
  const [supSenha, setSupSenha] = useState("");
  const [supErro, setSupErro] = useState("");
  const [supCarregando, setSupCarregando] = useState(false);

  async function entrarCliente(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
  }

  async function entrarSuporte(e: FormEvent) {
    e.preventDefault();
    setSupCarregando(true);
    setSupErro("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: supEmail,
      password: supSenha,
    });

    if (error || !data.user?.email) {
      setSupErro("E-mail ou senha incorretos.");
      setSupCarregando(false);
      return;
    }

    const { data: adm } = await supabase
      .from("administradores")
      .select("id")
      .eq("email", data.user.email)
      .maybeSingle();

    if (!adm)
