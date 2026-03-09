import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const formData = await req.formData();

  const id = formData.get("id") as string;
  const description = formData.get("image_description") as string;

  await supabase
    .from("images")
    .update({
      image_description: description,
    })
    .eq("id", id);

  redirect("/admin/images");
}