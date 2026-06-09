"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GoogleOAuthButton({ label }: { label: string }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function startGoogleOAuth() {
    setError(undefined);
    setPending(true);

    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", "/account");

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectTo.toString() },
      });

      if (oauthError) {
        setPending(false);
        setError("No pudimos iniciar el acceso con Google. Intenta nuevamente.");
      }
    } catch {
      setPending(false);
      setError("No pudimos iniciar el acceso con Google. Intenta nuevamente.");
    }
  }

  return (
    <>
      <button
        className="editorial-button editorial-button-soft"
        disabled={pending}
        onClick={startGoogleOAuth}
        type="button"
      >
        {pending ? "Conectando..." : label}
      </button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </>
  );
}
