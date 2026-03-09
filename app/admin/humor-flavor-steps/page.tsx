import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";

export default async function HumorFlavorStepsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .limit(100);

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        Humor Flavor Steps 🪜
      </h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-pink-100">
            <tr>
              {steps && steps.length > 0 ? (
                Object.keys(steps[0]).map((key) => (
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
            {steps?.map((step, index) => (
              <tr key={index} className="border-t align-top">
                {Object.values(step).map((value, i) => (
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