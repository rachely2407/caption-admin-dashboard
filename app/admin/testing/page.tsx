import AdminNavbar from "@/components/AdminNavbar";
import CaptionTestingPanel from "@/components/CaptionTestingPanel";
import { requireSuperadmin } from "@/lib/requireSuperadmin";

export default async function TestingPage() {
  const { supabase } = await requireSuperadmin();

  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("id, slug, description")
    .order("id", { ascending: true });

  return (
    <main className="min-h-screen p-6 md:p-10">
      <AdminNavbar />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
            Pipeline Testing
          </p>
          <h1 className="text-4xl font-bold text-pink-600">Testing Lab</h1>
        </div>
        <div className="bauhaus-chip bg-[var(--accent-red)] text-[var(--button-foreground)]">
          api.almostcrackd.ai
        </div>
      </div>

      <CaptionTestingPanel flavors={flavors ?? []} />
    </main>
  );
}
