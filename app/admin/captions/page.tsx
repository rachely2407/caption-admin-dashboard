import AdminNavbar from "@/components/AdminNavbar";
import { requireSuperadmin } from "@/lib/requireSuperadmin";

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ flavorId?: string }>;
}) {
  const params = await searchParams;
  const selectedFlavorId = Number(params.flavorId || 0) || null;
  const { supabase } = await requireSuperadmin();

  const [{ data: flavors }, { data: captions }] = await Promise.all([
    supabase.from("humor_flavors").select("id, slug").order("id", { ascending: true }),
    selectedFlavorId
      ? supabase
          .from("captions")
          .select("id, content, created_datetime_utc, humor_flavor_id, image_id")
          .eq("humor_flavor_id", selectedFlavorId)
          .not("content", "is", null)
          .order("created_datetime_utc", { ascending: false })
          .limit(100)
      : supabase
          .from("captions")
          .select("id, content, created_datetime_utc, humor_flavor_id, image_id")
          .not("content", "is", null)
          .not("humor_flavor_id", "is", null)
          .order("created_datetime_utc", { ascending: false })
          .limit(100),
  ]);

  const flavorLabelMap = new Map(
    (flavors ?? []).map((flavor) => [flavor.id, flavor.slug ?? `Flavor ${flavor.id}`])
  );

  return (
    <main className="min-h-screen p-6 md:p-10">
      <AdminNavbar />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
            Prompt Chain Outputs
          </p>
          <h1 className="text-4xl font-bold text-pink-600">Captions</h1>
        </div>
        <div className="bauhaus-chip bg-[var(--accent-blue)] text-[var(--button-foreground)]">
          Read by humor flavor
        </div>
      </div>

      <section className="bauhaus-card mb-8 p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mb-2 text-2xl text-pink-600">Filter Captions</h2>
            <p className="text-sm leading-7 text-[var(--muted)]">
              Inspect generated captions for one humor flavor or browse all
              persisted flavor-linked captions.
            </p>
          </div>

          <form method="GET" className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                Humor flavor
              </label>
              <select name="flavorId" defaultValue={selectedFlavorId ?? ""}>
                <option value="">All flavors</option>
                {flavors?.map((flavor) => (
                  <option key={flavor.id} value={flavor.id}>
                    {flavor.id} - {flavor.slug}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="bauhaus-button-secondary">
              Apply Filter
            </button>
            {selectedFlavorId && (
              <a href="/admin/captions" className="bauhaus-button-dark">
                Clear
              </a>
            )}
          </form>
        </div>
      </section>

      <section className="bauhaus-card p-6">
        <div className="mb-5">
          <h2 className="mb-2 text-2xl text-pink-600">Generated Caption Rows</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Showing {captions?.length ?? 0} caption rows
            {selectedFlavorId
              ? ` for ${flavorLabelMap.get(selectedFlavorId) ?? `Flavor ${selectedFlavorId}`}.`
              : " across all humor flavors."}
          </p>
        </div>

        <div className="grid gap-4">
          {captions?.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--surface)] p-5 shadow-[8px_8px_0_var(--shadow-strong)]"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="bauhaus-chip bg-[var(--accent-yellow)] text-[var(--ink)]">
                  {flavorLabelMap.get(item.humor_flavor_id ?? 0) ??
                    `Flavor ${item.humor_flavor_id}`}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {item.created_datetime_utc
                    ? new Date(item.created_datetime_utc).toLocaleString()
                    : "No timestamp"}
                </div>
              </div>

              <div className="mb-4 whitespace-pre-wrap text-base leading-8 text-[var(--foreground)]">
                {item.content}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[1rem] border-2 border-[var(--border)] bg-[var(--panel)] p-3 text-sm">
                  Caption ID: {item.id}
                </div>
                <div className="rounded-[1rem] border-2 border-[var(--border)] bg-[var(--panel)] p-3 text-sm">
                  Flavor ID: {item.humor_flavor_id ?? "—"}
                </div>
                <div className="rounded-[1rem] border-2 border-[var(--border)] bg-[var(--panel)] p-3 text-sm">
                  Image ID: {item.image_id ?? "—"}
                </div>
              </div>
            </article>
          ))}

          {!captions?.length && (
            <div className="rounded-[1.5rem] border-2 border-dashed border-[var(--border)] bg-[var(--panel)] p-8 text-sm text-[var(--muted)]">
              No persisted captions found for the selected filter.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
