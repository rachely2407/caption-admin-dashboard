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
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .single();

  const isAllowed = Boolean(
    profile?.is_superadmin || profile?.is_matrix_admin
  );

  if (error || !isAllowed) {
    await supabase.auth.signOut();
    redirect("/login?error=not_admin");
  }

  return { supabase, user };
}
