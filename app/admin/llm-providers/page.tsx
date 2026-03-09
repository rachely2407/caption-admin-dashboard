import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";
import { redirect } from "next/navigation";

export default async function LLMProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSuperadmin();

  const { data: providers } = await supabase
    .from("llm_providers")
    .select("*")
    .order("id", { ascending: true });

  async function createProvider(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    await supabase.from("llm_providers").insert({
      name: formData.get("name"),
    });

    redirect("/admin/llm-providers?success=created");
  }

  async function updateProvider(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));

    await supabase
      .from("llm_providers")
      .update({
        name: formData.get("name"),
      })
      .eq("id", id);

    redirect("/admin/llm-providers?success=updated");
  }

  async function deleteProvider(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));

    await supabase
      .from("llm_providers")
      .delete()
      .eq("id", id);

    redirect("/admin/llm-providers?success=deleted");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        LLM Providers 🏢
      </h1>

      {params?.success === "created" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Provider created successfully
        </div>
      )}

      {params?.success === "updated" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Provider updated successfully
        </div>
      )}

      {params?.success === "deleted" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Provider deleted successfully
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="text-lg font-semibold text-pink-600 mb-4">
          Create Provider
        </h2>

        <form action={createProvider} className="space-y-3">
          <input
            name="name"
            placeholder="Provider Name"
            className="w-full border p-2 rounded"
            required
          />

          <button className="bg-pink-500 text-white px-4 py-2 rounded">
            Create Provider
          </button>
        </form>
      </div>

      {providers?.map((provider) => (
        <div key={provider.id} className="bg-white p-6 rounded-2xl shadow mb-6">
          <form action={updateProvider} className="space-y-3">
            <input type="hidden" name="id" value={provider.id} />

            <div className="font-semibold">ID: {provider.id}</div>

            <input
              name="name"
              defaultValue={provider.name || ""}
              className="w-full border p-2 rounded"
            />

            <button className="bg-pink-500 text-white px-4 py-2 rounded">
              Update
            </button>
          </form>

          <form action={deleteProvider} className="mt-3">
            <input type="hidden" name="id" value={provider.id} />

            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Delete
            </button>
          </form>
        </div>
      ))}
    </main>
  );
}