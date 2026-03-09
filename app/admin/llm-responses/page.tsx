import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";

export default async function LLMResponsesPage() {
  const { supabase } = await requireSuperadmin();

  const { data: responses } = await supabase
    .from("llm_model_responses")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        LLM Responses 💬
      </h1>

      <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">

        {responses && responses.length > 0 ? (
          <table className="min-w-[1400px] text-left text-sm">
            <thead className="bg-pink-100">
              <tr>
                {Object.keys(responses[0]).map((key) => (
                  <th key={key} className="p-3 font-semibold whitespace-nowrap">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {responses.map((row, index) => (
                <tr key={index} className="border-t align-top">

                  {Object.entries(row).map(([key, value], i) => (

                    <td key={i} className="p-3 max-w-[300px] break-words">

                      {key === "llm_model_response" ||
                      key === "llm_system_prompt" ||
                      key === "llm_user_prompt" ? (

                        <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">
                          {String(value)}
                        </pre>

                      ) : (
                        String(value)
                      )}

                    </td>

                  ))}

                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data</div>
        )}

      </div>
    </main>
  );
}