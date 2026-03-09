import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";

export default async function CaptionRequestsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: requests } = await supabase
    .from("caption_requests")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        Caption Requests 📸
      </h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-pink-100">
            <tr>
              {requests && requests.length > 0 ? (
                Object.keys(requests[0]).map((key) => (
                  <th key={key} className="p-4 text-sm font-semibold">
                    {key}
                  </th>
                ))
              ) : (
                <th className="p-4">No data</th>
              )}
            </tr>
          </thead>

          <tbody>
            {requests?.map((row, index) => (
              <tr key={index} className="border-t align-top">
                {Object.values(row).map((value, i) => (
                  <td key={i} className="p-4 text-sm max-w-xs break-words">
                    {String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}