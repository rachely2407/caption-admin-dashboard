"use client";

import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  }

  const error =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl justify-end">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border-4 border-[var(--ink)] bg-white p-10 shadow-[12px_12px_0_var(--shadow-strong)]">
          <div className="mb-6 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
              Prompt Chain Tool
            </p>
            <h1 className="text-4xl font-bold text-[var(--accent-red)]">
              Admin Access
            </h1>
            <p className="mt-3 text-[var(--muted)]">
              Sign in with Google to manage humor flavors, steps, and caption
              testing.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="h-4 rounded-full bg-[var(--accent-red)]" />
            <div className="h-4 rounded-full bg-[var(--accent-yellow)]" />
            <div className="h-4 rounded-full bg-[var(--accent-blue)]" />
          </div>

          {error === "not_admin" && (
            <div className="mb-4 rounded-[1.5rem] border-2 border-[var(--ink)] bg-[var(--accent-yellow)] px-4 py-3 text-sm text-[var(--ink)]">
              This Google account is not an approved admin. Access requires
              `profiles.is_superadmin = TRUE` or `profiles.is_matrix_admin =
              TRUE`.
            </div>
          )}

          <button
            onClick={signInWithGoogle}
            className="w-full rounded-[1.5rem] border-2 border-[var(--ink)] bg-[var(--accent-red)] px-4 py-3 font-semibold text-[var(--button-foreground)] transition hover:-translate-y-0.5"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </main>
  );
}
