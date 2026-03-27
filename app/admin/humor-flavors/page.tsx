import AdminNavbar from "@/components/AdminNavbar";
import { requireSuperadmin } from "@/lib/requireSuperadmin";
import { redirect } from "next/navigation";

type PageParams = Promise<{
  success?: string;
  error?: string;
}>;

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export default async function HumorFlavorsPage({
  searchParams,
}: {
  searchParams: PageParams;
}) {
  const params = await searchParams;
  const { supabase, user } = await requireSuperadmin();

  const [{ data: flavors }, { data: allSteps }] = await Promise.all([
    supabase.from("humor_flavors").select("*").order("id", { ascending: false }),
    supabase
      .from("humor_flavor_steps")
      .select("id, humor_flavor_id")
      .limit(5000),
  ]);

  const stepCountByFlavor = new Map<number, number>();
  for (const step of allSteps ?? []) {
    const flavorId = Number(step.humor_flavor_id);
    stepCountByFlavor.set(flavorId, (stepCountByFlavor.get(flavorId) ?? 0) + 1);
  }

  async function createFlavor(formData: FormData) {
    "use server";

    const { supabase, user } = await requireSuperadmin();
    const now = new Date().toISOString();
    const slug = String(formData.get("slug") ?? "").trim();
    const description =
      String(formData.get("description") ?? "").trim() || null;

    if (!slug) {
      redirect("/admin/humor-flavors?error=Slug%20is%20required.");
    }

    const { error } = await supabase.from("humor_flavors").insert({
      slug,
      description,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
      created_datetime_utc: now,
      modified_datetime_utc: now,
    });

    if (error) {
      redirect(`/admin/humor-flavors?error=${encodeMessage(error.message)}`);
    }

    redirect("/admin/humor-flavors?success=created");
  }

  async function updateFlavor(formData: FormData) {
    "use server";

    const { supabase, user } = await requireSuperadmin();
    const id = Number(formData.get("id"));
    const slug = String(formData.get("slug") ?? "").trim();
    const description =
      String(formData.get("description") ?? "").trim() || null;

    if (!slug) {
      redirect("/admin/humor-flavors?error=Slug%20is%20required.");
    }

    const { error } = await supabase
      .from("humor_flavors")
      .update({
        slug,
        description,
        modified_by_user_id: user.id,
        modified_datetime_utc: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      redirect(`/admin/humor-flavors?error=${encodeMessage(error.message)}`);
    }

    redirect("/admin/humor-flavors?success=updated");
  }

  async function deleteFlavor(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();
    const id = Number(formData.get("id"));

    const { error } = await supabase.from("humor_flavors").delete().eq("id", id);

    if (error) {
      redirect(`/admin/humor-flavors?error=${encodeMessage(error.message)}`);
    }

    redirect("/admin/humor-flavors?success=deleted");
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <AdminNavbar />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
            Prompt Chain Manager
          </p>
          <h1 className="text-4xl font-bold text-pink-600">Humor Flavors</h1>
        </div>

        <div className="bauhaus-chip bg-[var(--accent-yellow)] text-[var(--ink)]">
          Logged in as {user.email ?? user.id}
        </div>
      </div>

      {params.success && (
        <div className="mb-6 rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--success)] p-4">
          Flavor {params.success} successfully.
        </div>
      )}

      {params.error && (
        <div className="mb-6 rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--accent-red)] p-4 text-[var(--button-foreground)]">
          {params.error}
        </div>
      )}

      <section className="bauhaus-card mb-8 p-6">
        <div className="mb-5">
          <h2 className="mb-2 text-2xl text-pink-600">Create New Flavor</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Add a humor flavor definition. Each flavor is the parent container
            for an ordered set of prompt-chain steps.
          </p>
        </div>

        <form action={createFlavor} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-[var(--muted)]">Slug</label>
            <input name="slug" placeholder="e.g. dry-campus-chaos" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--muted)]">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe the style, tone, and intended caption behavior."
              rows={4}
            />
          </div>
          <div className="md:col-span-2">
            <button className="bauhaus-button" type="submit">
              Create Flavor
            </button>
          </div>
        </form>
      </section>

      <section className="bauhaus-card p-6">
        <div className="mb-5">
          <h2 className="mb-2 text-2xl text-pink-600">Existing Flavors</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Update descriptions, remove unused flavors, and jump directly into
            step editing for any flavor.
          </p>
        </div>

        <div className="grid gap-5">
          {flavors?.map((flavor) => (
            <div
              key={flavor.id}
              className="rounded-[1.75rem] border-2 border-[var(--border)] bg-[var(--surface)] p-5 shadow-[8px_8px_0_var(--shadow-strong)]"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="bauhaus-chip mb-2 inline-flex bg-[var(--accent-yellow)] text-[var(--ink)]">
                    Flavor {flavor.id}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    {stepCountByFlavor.get(flavor.id) ?? 0} linked steps
                  </div>
                </div>

                <a
                  href={`/admin/humor-flavor-steps?flavorId=${flavor.id}`}
                  className="bauhaus-button-secondary"
                >
                  Open Steps
                </a>
              </div>

              <form action={updateFlavor} className="grid gap-4">
                <input type="hidden" name="id" value={flavor.id} />

                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">
                    Slug
                  </label>
                  <input name="slug" defaultValue={flavor.slug ?? ""} required />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={flavor.description ?? ""}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="bauhaus-button">
                    Save Flavor
                  </button>
                </div>
              </form>

              <form action={deleteFlavor} className="mt-3">
                <input type="hidden" name="id" value={flavor.id} />
                <button type="submit" className="bauhaus-button-dark">
                  Delete Flavor
                </button>
              </form>
            </div>
          ))}

          {!flavors?.length && (
            <div className="rounded-[1.5rem] border-2 border-dashed border-[var(--border)] bg-[var(--panel)] p-8 text-sm text-[var(--muted)]">
              No flavor rows found yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
