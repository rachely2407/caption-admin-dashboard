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

  const { count: captionRequests } = await supabase
    .from("caption_requests")
    .select("*", { count: "exact", head: true });

  const { count: humorFlavors } = await supabase
    .from("humor_flavors")
    .select("*", { count: "exact", head: true });

  const { count: llmResponses } = await supabase
    .from("llm_model_responses")
    .select("*", { count: "exact", head: true });

  return (
    <main className="min-h-screen bg-pink-50 p-10">
      <AdminNavbar />

      <h1 className="text-4xl font-bold text-pink-600 mb-8">
        Admin Dashboard 🎀
      </h1>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-600 text-lg">Users</h2>
          <p className="text-3xl font-bold text-pink-600 mt-2">{users}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-600 text-lg">Images</h2>
          <p className="text-3xl font-bold text-pink-600 mt-2">{images}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-600 text-lg">Captions</h2>
          <p className="text-3xl font-bold text-pink-600 mt-2">{captions}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-600 text-lg">Caption Requests</h2>
          <p className="text-3xl font-bold text-pink-600 mt-2">
            {captionRequests}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-600 text-lg">Humor Flavors</h2>
          <p className="text-3xl font-bold text-pink-600 mt-2">
            {humorFlavors}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-600 text-lg">LLM Responses</h2>
          <p className="text-3xl font-bold text-pink-600 mt-2">
            {llmResponses}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold text-pink-600 mb-4">
          Assignment Progress
        </h2>

        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <div>✅ Read Users</div>
          <div>✅ CRUD Images</div>
          <div>✅ Read Captions</div>
          <div>⬜ Upload New Images</div>
          <div>⬜ Read Humor Flavors</div>
          <div>⬜ Read Humor Flavor Steps</div>
          <div>⬜ Read / Update Humor Mix</div>
          <div>⬜ CRUD Terms</div>
          <div>⬜ Read Caption Requests</div>
          <div>⬜ CRUD Caption Examples</div>
          <div>⬜ CRUD LLM Models</div>
          <div>⬜ CRUD LLM Providers</div>
          <div>⬜ Read Prompt Chains</div>
          <div>⬜ Read LLM Responses</div>
          <div>⬜ CRUD Allowed Signup Domains</div>
          <div>⬜ CRUD Whitelisted Emails</div>
        </div>
      </div>
    </main>
  );
}