import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const formData = await req.formData();

  const url = formData.get("url") as string;
  const description = formData.get("image_description") as string;

  await supabase.from("images").insert({
    url,
    image_description: description,
    is_public: true
  });

  redirect("/admin/images");
}