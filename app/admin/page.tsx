import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";

export default async function AdminPage() {
  const { supabase } = await requireSuperadmin();

  const { count: users } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: images } = await supabase
    .from("images")
    .select("*", { count: "exact", head: true });

  const { count: captions } = await supabase
    .from("captions")
    .select("*", { count: "exact", head: true });

  return (
    <main className="min-h-screen bg-pink-50 p-10">
    <AdminNavbar />

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-600 text-lg">Users</h2>
          <p className="text-3xl font-bold text-pink-600 mt-2">
            {users}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-600 text-lg">Images</h2>
          <p className="text-3xl font-bold text-pink-600 mt-2">
            {images}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-600 text-lg">Captions</h2>
          <p className="text-3xl font-bold text-pink-600 mt-2">
            {captions}
          </p>
        </div>

      </div>
    </main>
  );
}