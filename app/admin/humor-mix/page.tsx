import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";
import { redirect } from "next/navigation";

export default async function HumorMixPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSuperadmin();

  const { data: mix } = await supabase
    .from("humor_flavor_mix")
    .select("*")
    .limit(100);

  async function updateMix(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const humorFlavorId = formData.get("humor_flavor_id") as string;
    const captionCount = formData.get("caption_count") as string;

    await supabase
      .from("humor_flavor_mix")
      .update({
        caption_count: Number(captionCount),
      })
      .eq("humor_flavor_id", Number(humorFlavorId));

    redirect("/admin/humor-mix?success=1");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        Humor Mix 🎛️
      </h1>

      {params?.success && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Update successful
        </div>
      )}

      {!mix || mix.length === 0 ? (
        <div className="bg-pink-100 p-6 rounded-xl">No data</div>
      ) : (
        <div className="space-y-6">
          {mix.map((row, index) => (
            <form
              key={index}
              action={updateMix}
              className="bg-white p-6 rounded-xl shadow space-y-4"
            >
              <div className="flex flex-col">
                <label className="text-sm font-semibold">
                  created_datetime_utc
                </label>
                <input
                  value={String(row.created_datetime_utc ?? "")}
                  readOnly
                  className="border rounded p-2 bg-gray-50"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold">
                  humor_flavor_id
                </label>
                <input
                  name="humor_flavor_id"
                  defaultValue={String(row.humor_flavor_id ?? "")}
                  readOnly
                  className="border rounded p-2 bg-gray-50"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold">
                  caption_count
                </label>
                <input
                  name="caption_count"
                  defaultValue={String(row.caption_count ?? "")}
                  className="border rounded p-2"
                />
              </div>

              <button className="bg-pink-600 text-white px-4 py-2 rounded">
                Update
              </button>
            </form>
          ))}
        </div>
      )}
    </main>
  );
}