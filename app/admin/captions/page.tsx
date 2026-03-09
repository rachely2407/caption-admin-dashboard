import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";

export default async function CaptionsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: captions } = await supabase
    .from("captions")
    .select("id, content, created_datetime_utc")
    .not("content", "is", null)
    .order("created_datetime_utc", { ascending: false })
    .limit(30);

  return (
    <main className="min-h-screen bg-pink-50 p-10">
    <AdminNavbar />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pink-600">Captions 💬</h1>

        <a
          href="/admin"
          className="bg-white px-5 py-3 rounded-xl shadow hover:shadow-md"
        >
          ← Back to Dashboard
        </a>
      </div>

      <div className="space-y-4">
        {captions?.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow">
            <p className="text-base text-gray-800 mb-2">{item.content}</p>
            <p className="text-xs text-gray-500">{item.id}</p>
          </div>
        ))}
      </div>
    </main>
  );
}