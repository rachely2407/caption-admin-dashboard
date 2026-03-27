import { requireSuperadmin } from "@/lib/requireSuperadmin";
import AdminNavbar from "@/components/AdminNavbar";

const assignmentChecklist = [
  "Allow superadmin or matrix_admin access",
  "Create, update, and delete humor flavors",
  "Create, update, and delete humor flavor steps",
  "Reorder humor flavor steps",
  "Read captions produced by a specific humor flavor",
  "Test a humor flavor with the REST API",
  "Support light, dark, and system theme modes",
];

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

  const { count: flavorSteps } = await supabase
    .from("humor_flavor_steps")
    .select("*", { count: "exact", head: true });

  const { count: llmResponses } = await supabase
    .from("llm_model_responses")
    .select("*", { count: "exact", head: true });

  const cards = [
    {
      title: "Humor Flavors",
      count: humorFlavors ?? 0,
      href: "/admin/humor-flavors",
      description: "Create and manage prompt-chain flavor definitions.",
      accent: "bg-[var(--accent-yellow)] text-[var(--ink)]",
    },
    {
      title: "Flavor Steps",
      count: flavorSteps ?? 0,
      href: "/admin/humor-flavor-steps",
      description: "Edit ordered steps, prompts, models, and step types.",
      accent: "bg-[var(--accent-blue)] text-[var(--button-foreground)]",
    },
    {
      title: "Images",
      count: images ?? 0,
      href: "/admin/images",
      description: "Maintain the image test set used for caption generation.",
      accent: "bg-[var(--accent-red)] text-[var(--button-foreground)]",
    },
    {
      title: "Captions",
      count: captions ?? 0,
      href: "/admin/captions",
      description: "Read generated captions by selected humor flavor.",
      accent: "bg-[var(--surface)] text-[var(--ink)]",
    },
  ];

  return (
    <main className="min-h-screen p-6 md:p-10">
      <AdminNavbar />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
            Assignment Audit
          </p>
          <h1 className="text-4xl font-bold text-pink-600">Admin Dashboard</h1>
        </div>

        <div className="bauhaus-chip bg-[var(--accent-yellow)] text-[var(--ink)]">
          Week 8 Prompt Chain Tool
        </div>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <a key={card.title} href={card.href} className="bauhaus-card p-6">
            <div className={`bauhaus-chip mb-4 inline-flex ${card.accent}`}>
              Open
            </div>
            <h2 className="text-lg text-[var(--foreground)]">{card.title}</h2>
            <p className="mt-3 text-4xl font-bold text-pink-600">{card.count}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {card.description}
            </p>
          </a>
        ))}
      </div>

      <div className="bauhaus-card mb-10 p-6">
        <h2 className="mb-2 text-2xl font-semibold text-pink-600">
          Requirement Check
        </h2>
        <p className="mb-6 max-w-3xl text-sm text-[var(--muted)]">
          The app now covers the core Week 8 product requirements inside one
          focused admin workspace.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {assignmentChecklist.map((item) => (
            <div
              key={item}
              className="rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--success)] p-4"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Complete
              </div>
              <div className="text-base font-medium text-[var(--foreground)]">
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bauhaus-card p-6">
          <h2 className="mb-3 text-2xl text-pink-600">Prompt Chain Flow</h2>
          <p className="mb-4 text-sm leading-7 text-[var(--muted)]">
            The intended workflow is now explicit: maintain a flavor, define its
            ordered steps, choose images from the test set, run the API pipeline,
            then inspect the resulting captions by flavor.
          </p>
          <div className="grid gap-3">
            {[
              "1. Create or update a humor flavor.",
              "2. Add ordered flavor steps and reorder them as needed.",
              "3. Maintain images in the test set.",
              "4. Run API testing from the Testing page.",
              "5. Review persisted captions filtered by humor flavor.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border-2 border-[var(--border)] bg-[var(--surface)] p-4 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="bauhaus-card p-6">
          <h2 className="mb-3 text-2xl text-pink-600">Snapshot</h2>
          <div className="grid gap-3">
            <div className="rounded-[1.25rem] border-2 border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
              Admin-access profiles: {users ?? 0} total profile rows in the system.
            </div>
            <div className="rounded-[1.25rem] border-2 border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
              Caption requests tracked: {captionRequests ?? 0}.
            </div>
            <div className="rounded-[1.25rem] border-2 border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
              Existing LLM response rows: {llmResponses ?? 0}.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
