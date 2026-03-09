import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const formData = await req.formData();
  const id = formData.get("id") as string;

  await supabase
    .from("images")
    .delete()
    .eq("id", id);

  redirect("/admin/images");
}