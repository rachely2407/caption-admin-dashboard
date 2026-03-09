import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";
import { redirect } from "next/navigation";

export default async function AllowedSignupDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSuperadmin();

  const { data: domains } = await supabase
    .from("allowed_signup_domains")
    .select("*")
    .order("id", { ascending: true });

  async function createDomain(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const apex_domain = formData.get("apex_domain") as string;

    await supabase.from("allowed_signup_domains").insert({
      apex_domain,
    });

    redirect("/admin/allowed-signup-domains?success=created");
  }

  async function updateDomain(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));
    const apex_domain = formData.get("apex_domain") as string;

    await supabase
      .from("allowed_signup_domains")
      .update({ apex_domain })
      .eq("id", id);

    redirect("/admin/allowed-signup-domains?success=updated");
  }

  async function deleteDomain(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));

    await supabase
      .from("allowed_signup_domains")
      .delete()
      .eq("id", id);

    redirect("/admin/allowed-signup-domains?success=deleted");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        Allowed Signup Domains 🌐
      </h1>

      {params?.success === "created" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Domain created successfully
        </div>
      )}

      {params?.success === "updated" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Domain updated successfully
        </div>
      )}

      {params?.success === "deleted" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Domain deleted successfully
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="text-lg font-semibold text-pink-600 mb-4">
          Create Domain
        </h2>

        <form action={createDomain} className="space-y-3">
          <input
            name="apex_domain"
            placeholder="example.com"
            className="w-full border p-2 rounded"
            required
          />

          <button className="bg-pink-500 text-white px-4 py-2 rounded">
            Create Domain
          </button>
        </form>
      </div>

      {domains?.map((row) => (
        <div key={row.id} className="bg-white p-6 rounded-2xl shadow mb-6">
          <form action={updateDomain} className="space-y-3">
            <input type="hidden" name="id" value={row.id} />

            <div className="font-semibold">ID: {row.id}</div>

            <input
              name="apex_domain"
              defaultValue={row.apex_domain || ""}
              className="w-full border p-2 rounded"
            />

            <button className="bg-pink-500 text-white px-4 py-2 rounded">
              Update
            </button>
          </form>

          <form action={deleteDomain} className="mt-3">
            <input type="hidden" name="id" value={row.id} />
            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Delete
            </button>
          </form>
        </div>
      ))}
    </main>
  );
}