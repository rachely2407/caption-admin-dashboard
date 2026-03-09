import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";

export default async function UsersPage() {
  const { supabase } = await requireSuperadmin();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, is_superadmin")
    .limit(50);

  return (
    <main className="min-h-screen bg-pink-50 p-10">
    <AdminNavbar />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pink-600">Users 👩‍💻</h1>

        <a
          href="/admin"
          className="bg-white px-5 py-3 rounded-xl shadow hover:shadow-md"
        >
          ← Back to Dashboard
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-pink-100">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">User ID</th>
              <th className="p-4">Superadmin</th>
            </tr>
          </thead>

          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4">{user.email}</td>
                <td className="p-4 text-xs">{user.id}</td>
                <td className="p-4">{user.is_superadmin ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}