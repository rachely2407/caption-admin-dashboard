import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";
import { redirect } from "next/navigation";

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSuperadmin();

  const { data: terms } = await supabase
    .from("terms")
    .select("id, term, definition, example, priority, term_type_id")
    .order("id", { ascending: true })
    .limit(100);

  async function createTerm(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const term = formData.get("term") as string;
    const definition = formData.get("definition") as string;
    const example = formData.get("example") as string;
    const priority = formData.get("priority") as string;
    const termTypeId = formData.get("term_type_id") as string;

    await supabase.from("terms").insert({
      term,
      definition,
      example,
      priority: Number(priority),
      term_type_id: Number(termTypeId),
    });

    redirect("/admin/terms?success=created");
  }

  async function updateTerm(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = formData.get("id") as string;
    const term = formData.get("term") as string;
    const definition = formData.get("definition") as string;
    const example = formData.get("example") as string;
    const priority = formData.get("priority") as string;
    const termTypeId = formData.get("term_type_id") as string;

    await supabase
      .from("terms")
      .update({
        term,
        definition,
        example,
        priority: Number(priority),
        term_type_id: Number(termTypeId),
      })
      .eq("id", Number(id));

    redirect("/admin/terms?success=updated");
  }

  async function deleteTerm(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = formData.get("id") as string;

    await supabase
      .from("terms")
      .delete()
      .eq("id", Number(id));

    redirect("/admin/terms?success=deleted");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        Terms 📝
      </h1>

      {params?.success === "created" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Term created successfully
        </div>
      )}

      {params?.success === "updated" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Term updated successfully
        </div>
      )}

      {params?.success === "deleted" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Term deleted successfully
        </div>
      )}

      {/* CREATE */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold text-pink-600 mb-4">
          Create New Term
        </h2>

        <form action={createTerm} className="grid grid-cols-2 gap-4">
          <input
            name="term"
            placeholder="Term"
            className="border rounded p-2"
            required
          />

          <input
            name="priority"
            placeholder="Priority"
            type="number"
            className="border rounded p-2"
            required
          />

          <input
            name="term_type_id"
            placeholder="Term Type ID"
            type="number"
            className="border rounded p-2"
            required
          />

          <input
            name="example"
            placeholder="Example"
            className="border rounded p-2"
          />

          <textarea
            name="definition"
            placeholder="Definition"
            className="border rounded p-2 col-span-2"
            rows={3}
            required
          />

          <button className="bg-pink-600 text-white px-4 py-2 rounded w-fit">
            Create Term
          </button>
        </form>
      </div>

      {/* READ + UPDATE + DELETE */}
      <div className="space-y-6">
        {terms?.map((row) => (
          <div key={row.id} className="bg-white rounded-2xl shadow p-6">
            <form action={updateTerm} className="grid grid-cols-2 gap-4 mb-4">
              <input type="hidden" name="id" value={row.id} />

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">ID</label>
                <input
                  value={row.id}
                  readOnly
                  className="border rounded p-2 w-full bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Term</label>
                <input
                  name="term"
                  defaultValue={row.term ?? ""}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Priority</label>
                <input
                  name="priority"
                  type="number"
                  defaultValue={row.priority ?? ""}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Term Type ID</label>
                <input
                  name="term_type_id"
                  type="number"
                  defaultValue={row.term_type_id ?? ""}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Example</label>
                <input
                  name="example"
                  defaultValue={row.example ?? ""}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Definition</label>
                <textarea
                  name="definition"
                  defaultValue={row.definition ?? ""}
                  className="border rounded p-2 w-full"
                  rows={3}
                />
              </div>

              <button className="bg-pink-600 text-white px-4 py-2 rounded w-fit">
                Update Term
              </button>
            </form>

            <form action={deleteTerm}>
              <input type="hidden" name="id" value={row.id} />
              <button className="bg-red-500 text-white px-4 py-2 rounded">
                Delete Term
              </button>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}