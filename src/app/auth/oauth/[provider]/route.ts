import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedOAuthProvider, sanitizeSameSiteNextPath } from "@/lib/auth/oauth";

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const url = new URL(request.url);
  const params = await context.params;
  const provider = params.provider;
  if (!isAllowedOAuthProvider(provider)) {
    const fallback = new URL("/auth", url.origin);
    fallback.searchParams.set("error", "unsupported_provider");
    return NextResponse.redirect(fallback);
  }

  const safeNext = sanitizeSameSiteNextPath(url.searchParams.get("next"));
  const redirectTo = new URL("/auth/callback", url.origin);
  if (safeNext) redirectTo.searchParams.set("next", safeNext);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectTo.toString() },
  });

  if (error || !data?.url) {
    const fallback = new URL("/auth", url.origin);
    fallback.searchParams.set("error", "oauth_start_failed");
    return NextResponse.redirect(fallback);
  }

  return NextResponse.redirect(data.url);
}
