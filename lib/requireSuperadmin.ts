import { createSupabaseServerClient } from "./supabaseServer";
import { redirect } from "next/navigation";

export async function requireSuperadmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_superadmin) {
    await supabase.auth.signOut();
    redirect("/login?error=not_superadmin");
  }

  return { supabase, user };
}