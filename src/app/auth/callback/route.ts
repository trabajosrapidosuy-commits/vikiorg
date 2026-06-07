import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOAuthCallbackError, sanitizeSameSiteNextPath } from "@/lib/auth/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = sanitizeSameSiteNextPath(url.searchParams.get("next"));

  if (!code) {
    const loginUrl = new URL("/auth/login", url.origin);
    loginUrl.searchParams.set("error", "Enlace de acceso invalido.");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const loginUrl = new URL("/auth/login", url.origin);
    loginUrl.searchParams.set("error", getOAuthCallbackError());
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(nextPath ?? "/account", url.origin));
}
