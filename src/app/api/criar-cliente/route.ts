import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  // 1) Confirma que quem chama é um admin da Solutec
  const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "");

  const anon = createClient(supabaseUrl, anonKey);
  const { data: { user } } = await anon.auth.getUser(token);

  if (!user?.email) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: adm } = await anon
    .from("administradores")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (!adm) {
    return NextResponse.json({ erro: "Acesso restrito ao suporte Solutec." }, { status: 403 });
  }

  // 2) Cria o usuário de login do cliente
  const body = await req.json();
  const { email, senha, ...empresa } = body;

  const admin = createClient(supabaseUrl, serviceRole);
  const { data: criado, error: erroUser } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });

  if (erroUser) {
    return NextResponse.json({ erro: erroUser.message }, { status: 400 });
  }

  // 3) Cadastra a empresa já vinculada ao login
  const { error: erroEmpresa } = await admin.from("empresas").insert({
    ...empresa,
    email_login: email,
  });

  if (erroEmpresa) {
    return NextResponse.json({ erro: erroEmpresa.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, userId: criado.user.id });
}
