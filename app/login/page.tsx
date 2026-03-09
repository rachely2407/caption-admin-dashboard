"use client";

import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
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
    <main className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-lg border border-pink-100">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-pink-600">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Sign in with Google to continue
          </p>
        </div>

        {error === "not_superadmin" && (
          <div className="mb-4 rounded-2xl border border-pink-200 bg-pink-100 px-4 py-3 text-sm text-pink-700">
            This Google account is not a superadmin. Please sign in with the correct account.
          </div>
        )}

        <button
          onClick={signInWithGoogle}
          className="w-full rounded-2xl bg-pink-500 px-4 py-3 font-medium text-white transition hover:bg-pink-600"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}