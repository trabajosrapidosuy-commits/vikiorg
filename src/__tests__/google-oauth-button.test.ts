import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Google OAuth browser PKCE boundary", () => {
  it("starts OAuth in the browser and uses the current origin", () => {
    const button = fs.readFileSync(
      path.join(root, "src/components/GoogleOAuthButton.tsx"),
      "utf8",
    );
    const loginPage = fs.readFileSync(
      path.join(root, "src/app/auth/login/page.tsx"),
      "utf8",
    );
    const registerPage = fs.readFileSync(
      path.join(root, "src/app/auth/register/page.tsx"),
      "utf8",
    );

    expect(button).toContain('new URL("/auth/callback", window.location.origin)');
    expect(button).toContain("signInWithOAuth");
    expect(loginPage).toContain("GoogleOAuthButton");
    expect(registerPage).toContain("GoogleOAuthButton");
    expect(loginPage).not.toContain('href="/auth/oauth/google"');
    expect(registerPage).not.toContain('href="/auth/oauth/google"');
  });

  it("keeps the callback outside middleware session refresh", () => {
    const middleware = fs.readFileSync(path.join(root, "src/middleware.ts"), "utf8");
    expect(middleware).toContain('pathname === "/auth/callback"');
  });
});
