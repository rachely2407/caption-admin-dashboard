import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";
import { redirect } from "next/navigation";

export default async function LLMModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSuperadmin();

  const { data: models } = await supabase
    .from("llm_models")
    .select("*")
    .order("id", { ascending: true });

  async function createModel(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    await supabase.from("llm_models").insert({
      name: formData.get("name"),
      llm_provider_id: Number(formData.get("llm_provider_id")),
      provider_model_id: formData.get("provider_model_id"),
      is_temperature_supported:
        formData.get("is_temperature_supported") === "true",
    });

    redirect("/admin/llm-models?success=created");
  }

  async function updateModel(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));

    await supabase
      .from("llm_models")
      .update({
        name: formData.get("name"),
        llm_provider_id: Number(formData.get("llm_provider_id")),
        provider_model_id: formData.get("provider_model_id"),
        is_temperature_supported:
          formData.get("is_temperature_supported") === "true",
      })
      .eq("id", id);

    redirect("/admin/llm-models?success=updated");
  }

  async function deleteModel(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));

    await supabase.from("llm_models").delete().eq("id", id);

    redirect("/admin/llm-models?success=deleted");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">LLM Models 🤖</h1>

      {params?.success === "created" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Model created successfully
        </div>
      )}

      {params?.success === "updated" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Model updated successfully
        </div>
      )}

      {params?.success === "deleted" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Model deleted successfully
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="text-lg font-semibold text-pink-600 mb-4">
          Create Model
        </h2>

        <form action={createModel} className="space-y-3">
          <input
            name="name"
            placeholder="Model Name"
            className="w-full border p-2 rounded"
          />

          <input
            name="llm_provider_id"
            placeholder="Provider ID"
            type="number"
            className="w-full border p-2 rounded"
          />

          <input
            name="provider_model_id"
            placeholder="Provider Model ID"
            className="w-full border p-2 rounded"
          />

          <select
            name="is_temperature_supported"
            className="w-full border p-2 rounded"
          >
            <option value="true">Temperature Supported</option>
            <option value="false">No Temperature</option>
          </select>

          <button className="bg-pink-500 text-white px-4 py-2 rounded">
            Create Model
          </button>
        </form>
      </div>

      {models?.map((model) => (
        <div key={model.id} className="bg-white p-6 rounded-2xl shadow mb-6">
          <form action={updateModel} className="space-y-3">
            <input type="hidden" name="id" value={model.id} />

            <div className="font-semibold">ID: {model.id}</div>

            <input
              name="name"
              defaultValue={model.name || ""}
              className="w-full border p-2 rounded"
            />

            <input
              name="llm_provider_id"
              type="number"
              defaultValue={model.llm_provider_id}
              className="w-full border p-2 rounded"
            />

            <input
              name="provider_model_id"
              defaultValue={model.provider_model_id || ""}
              className="w-full border p-2 rounded"
            />

            <select
              name="is_temperature_supported"
              defaultValue={model.is_temperature_supported ? "true" : "false"}
              className="w-full border p-2 rounded"
            >
              <option value="true">Temperature Supported</option>
              <option value="false">No Temperature</option>
            </select>

            <button className="bg-pink-500 text-white px-4 py-2 rounded">
              Update
            </button>
          </form>

          <form action={deleteModel} className="mt-3">
            <input type="hidden" name="id" value={model.id} />

            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Delete
            </button>
          </form>
        </div>
      ))}
    </main>
  );
}