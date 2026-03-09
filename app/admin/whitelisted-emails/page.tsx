import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";
import { redirect } from "next/navigation";

export default async function WhitelistedEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSuperadmin();

  const { data: emails } = await supabase
    .from("whitelist_email_addresses")
    .select("*")
    .order("id", { ascending: true });

  async function createEmail(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const email_address = formData.get("email_address") as string;

    await supabase.from("whitelist_email_addresses").insert({
      email_address,
    });

    redirect("/admin/whitelisted-emails?success=created");
  }

  async function updateEmail(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));
    const email_address = formData.get("email_address") as string;

    await supabase
      .from("whitelist_email_addresses")
      .update({ email_address })
      .eq("id", id);

    redirect("/admin/whitelisted-emails?success=updated");
  }

  async function deleteEmail(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();

    const id = Number(formData.get("id"));

    await supabase
      .from("whitelist_email_addresses")
      .delete()
      .eq("id", id);

    redirect("/admin/whitelisted-emails?success=deleted");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        Whitelisted Emails 📧
      </h1>

      {params?.success === "created" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Email created successfully
        </div>
      )}

      {params?.success === "updated" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Email updated successfully
        </div>
      )}

      {params?.success === "deleted" && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6">
          ✅ Email deleted successfully
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="text-lg font-semibold text-pink-600 mb-4">
          Create Email
        </h2>

        <form action={createEmail} className="space-y-3">
          <input
            name="email_address"
            placeholder="test@example.com"
            className="w-full border p-2 rounded"
            required
          />

          <button className="bg-pink-500 text-white px-4 py-2 rounded">
            Create Email
          </button>
        </form>
      </div>

      {emails?.map((row) => (
        <div key={row.id} className="bg-white p-6 rounded-2xl shadow mb-6">
          <form action={updateEmail} className="space-y-3">
            <input type="hidden" name="id" value={row.id} />

            <div className="font-semibold">ID: {row.id}</div>

            <input
              name="email_address"
              defaultValue={row.email_address || ""}
              className="w-full border p-2 rounded"
            />

            <button className="bg-pink-500 text-white px-4 py-2 rounded">
              Update
            </button>
          </form>

          <form action={deleteEmail} className="mt-3">
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