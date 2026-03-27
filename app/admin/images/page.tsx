import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";
import { redirect } from "next/navigation";

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSuperadmin();

  const { data: images } = await supabase
    .from("images")
    .select("id, url, image_description, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(20);

  async function createImage(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const url = formData.get("url") as string;
    const description = formData.get("image_description") as string;

    await supabase.from("images").insert({
      url,
      image_description: description,
      is_public: true,
    });

    redirect("/admin/images?success=created");
  }

  async function updateImage(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = formData.get("id") as string;
    const description = formData.get("image_description") as string;

    await supabase
      .from("images")
      .update({
        image_description: description,
      })
      .eq("id", id);

    redirect("/admin/images?success=updated");
  }

  async function deleteImage(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = formData.get("id") as string;

    await supabase
      .from("images")
      .delete()
      .eq("id", id);

    redirect("/admin/images?success=deleted");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">Images 🖼</h1>

      {params?.success === "created" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Image created successfully
        </div>
      )}

      {params?.success === "updated" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Image updated successfully
        </div>
      )}

      {params?.success === "deleted" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Image deleted successfully
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6 mb-10 max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Add New Image</h2>

        <form action={createImage} className="space-y-3">
          <input
            name="url"
            placeholder="Image URL"
            required
            className="border p-2 rounded w-full"
          />

          <textarea
            name="image_description"
            placeholder="Image description"
            className="border p-2 rounded w-full"
          />

          <button
            type="submit"
            className="bg-pink-500 text-white px-4 py-2 rounded"
          >
            Create Image
          </button>
        </form>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {images?.map((img) => (
          <div key={img.id} className="bg-white rounded-2xl p-4 shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} className="rounded-lg mb-2" alt="uploaded" />

            <p className="text-xs break-all mb-2">{img.url}</p>

            <form action={updateImage} className="space-y-2">
              <input type="hidden" name="id" value={img.id} />

              <textarea
                name="image_description"
                defaultValue={img.image_description ?? ""}
                className="border p-2 rounded w-full text-sm"
              />

              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Update
              </button>
            </form>

            <form action={deleteImage}>
              <input type="hidden" name="id" value={img.id} />

              <button
                type="submit"
                className="mt-2 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}
