import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";
import { redirect } from "next/navigation";

export default async function CaptionExamplesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSuperadmin();

  const { data: examples } = await supabase
    .from("caption_examples")
    .select("*")
    .order("id", { ascending: true });

  async function createExample(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    await supabase.from("caption_examples").insert({
      image_description: formData.get("image_description"),
      caption: formData.get("caption"),
      explanation: formData.get("explanation"),
      priority: Number(formData.get("priority")),
      image_id: formData.get("image_id") || null,
    });

    redirect("/admin/caption-examples?success=created");
  }

  async function updateExample(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));

    await supabase
      .from("caption_examples")
      .update({
        image_description: formData.get("image_description"),
        caption: formData.get("caption"),
        explanation: formData.get("explanation"),
        priority: Number(formData.get("priority")),
        image_id: formData.get("image_id") || null,
      })
      .eq("id", id);

    redirect("/admin/caption-examples?success=updated");
  }

  async function deleteExample(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));

    await supabase.from("caption_examples").delete().eq("id", id);

    redirect("/admin/caption-examples?success=deleted");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        Caption Examples 💬
      </h1>

      {params?.success === "created" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Caption example created successfully
        </div>
      )}

      {params?.success === "updated" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Caption example updated successfully
        </div>
      )}

      {params?.success === "deleted" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Caption example deleted successfully
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="text-lg font-semibold mb-4 text-pink-600">
          Create Caption Example
        </h2>

        <form action={createExample} className="space-y-3">
          <input
            name="image_description"
            placeholder="Image Description"
            className="w-full border p-2 rounded"
          />

          <input
            name="caption"
            placeholder="Caption"
            className="w-full border p-2 rounded"
          />

          <textarea
            name="explanation"
            placeholder="Explanation"
            className="w-full border p-2 rounded"
          />

          <input
            name="priority"
            placeholder="Priority"
            type="number"
            className="w-full border p-2 rounded"
          />

          <input
            name="image_id"
            placeholder="Image ID (optional)"
            className="w-full border p-2 rounded"
          />

          <button className="bg-pink-500 text-white px-4 py-2 rounded">
            Create Example
          </button>
        </form>
      </div>

      {examples?.map((example) => (
        <div key={example.id} className="bg-white p-6 rounded-2xl shadow mb-6">
          <form action={updateExample} className="space-y-3">
            <input type="hidden" name="id" value={example.id} />

            <div className="font-semibold">ID: {example.id}</div>

            <input
              name="image_description"
              defaultValue={example.image_description || ""}
              className="w-full border p-2 rounded"
            />

            <input
              name="caption"
              defaultValue={example.caption || ""}
              className="w-full border p-2 rounded"
            />

            <textarea
              name="explanation"
              defaultValue={example.explanation || ""}
              className="w-full border p-2 rounded"
            />

            <input
              name="priority"
              type="number"
              defaultValue={example.priority || 0}
              className="w-full border p-2 rounded"
            />

            <input
              name="image_id"
              defaultValue={example.image_id || ""}
              className="w-full border p-2 rounded"
            />

            <button className="bg-pink-500 text-white px-4 py-2 rounded">
              Update
            </button>
          </form>

          <form action={deleteExample} className="mt-3">
            <input type="hidden" name="id" value={example.id} />

            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Delete
            </button>
          </form>
        </div>
      ))}
    </main>
  );
}