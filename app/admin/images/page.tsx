import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";

export default async function ImagesPage() {
  const { supabase } = await requireSuperadmin();

  const { data: images } = await supabase
    .from("images")
    .select("id, url, image_description, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(20);

  return (
    <main className="min-h-screen bg-pink-50 p-10">
    <AdminNavbar />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pink-600">Images 🖼</h1>

        <a
          href="/admin"
          className="bg-white px-5 py-3 rounded-xl shadow hover:shadow-md"
        >
          ← Back to Dashboard
        </a>
      </div>

      {/* CREATE IMAGE */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10 max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Add New Image</h2>

        <form action="/api/admin/create-image" method="POST" className="space-y-3">
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

      {/* IMAGE GRID */}
      <div className="grid grid-cols-4 gap-6">
        {images?.map((img) => (
          <div key={img.id} className="bg-white rounded-2xl p-4 shadow">
            <img
              src={img.url}
              className="rounded-lg mb-2"
              alt="uploaded"
            />

            <p className="text-xs break-all mb-2">{img.url}</p>

            {/* UPDATE DESCRIPTION */}
            <form
              action="/api/admin/update-image"
              method="POST"
              className="space-y-2"
            >
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

            {/* DELETE */}
            <form action="/api/admin/delete-image" method="POST">
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