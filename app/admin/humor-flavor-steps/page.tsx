import AdminNavbar from "@/components/AdminNavbar";
import { requireSuperadmin } from "@/lib/requireSuperadmin";
import { redirect } from "next/navigation";

type PageParams = Promise<{
  success?: string;
  error?: string;
  flavorId?: string;
}>;

type StepRow = {
  id: number;
  humor_flavor_id: number;
  order_by: number;
  llm_temperature: number | null;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  description: string | null;
};

function buildRedirectPath(flavorId?: number | string | null) {
  if (!flavorId) {
    return "/admin/humor-flavor-steps";
  }

  return `/admin/humor-flavor-steps?flavorId=${flavorId}`;
}

function withStatus(
  basePath: string,
  params: Record<string, string | number | undefined | null>
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  const queryString = query.toString();
  return queryString ? `${basePath}${basePath.includes("?") ? "&" : "?"}${queryString}` : basePath;
}

async function shiftOrdersForInsert(
  supabase: Awaited<ReturnType<typeof requireSuperadmin>>["supabase"],
  flavorId: number,
  orderBy: number,
  userId: string
) {
  const { data: siblings } = await supabase
    .from("humor_flavor_steps")
    .select("id, order_by")
    .eq("humor_flavor_id", flavorId)
    .gte("order_by", orderBy)
    .order("order_by", { ascending: true });

  const now = new Date().toISOString();

  for (const sibling of siblings ?? []) {
    await supabase
      .from("humor_flavor_steps")
      .update({
        order_by: Number(sibling.order_by) + 1,
        modified_by_user_id: userId,
        modified_datetime_utc: now,
      })
      .eq("id", sibling.id);
  }
}

async function compactFlavorOrders(
  supabase: Awaited<ReturnType<typeof requireSuperadmin>>["supabase"],
  flavorId: number,
  userId: string
) {
  const { data: siblings } = await supabase
    .from("humor_flavor_steps")
    .select("id, order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: true })
    .order("id", { ascending: true });

  const now = new Date().toISOString();

  for (const [index, sibling] of (siblings ?? []).entries()) {
    const nextOrder = index + 1;
    if (Number(sibling.order_by) === nextOrder) continue;

    await supabase
      .from("humor_flavor_steps")
      .update({
        order_by: nextOrder,
        modified_by_user_id: userId,
        modified_datetime_utc: now,
      })
      .eq("id", sibling.id);
  }
}

export default async function HumorFlavorStepsPage({
  searchParams,
}: {
  searchParams: PageParams;
}) {
  const params = await searchParams;
  const selectedFlavorId = Number(params.flavorId || 0) || null;
  const { supabase } = await requireSuperadmin();

  const [
    { data: flavors },
    { data: rawSteps },
    { data: stepTypes },
    { data: models },
    { data: inputTypes },
    { data: outputTypes },
  ] = await Promise.all([
    supabase.from("humor_flavors").select("*").order("id", { ascending: true }),
    supabase
      .from("humor_flavor_steps")
      .select("*")
      .order("humor_flavor_id", { ascending: true })
      .order("order_by", { ascending: true })
      .order("id", { ascending: true }),
    supabase
      .from("humor_flavor_step_types")
      .select("id, slug, description")
      .order("id", { ascending: true }),
    supabase.from("llm_models").select("id, name").order("id", { ascending: true }),
    supabase
      .from("llm_input_types")
      .select("id, slug, description")
      .order("id", { ascending: true }),
    supabase
      .from("llm_output_types")
      .select("id, slug, description")
      .order("id", { ascending: true }),
  ]);

  const allSteps = (rawSteps ?? []) as StepRow[];
  const steps = selectedFlavorId
    ? allSteps.filter((step) => step.humor_flavor_id === selectedFlavorId)
    : allSteps;

  async function createStep(formData: FormData) {
    "use server";

    const { supabase, user } = await requireSuperadmin();
    const humorFlavorId = Number(formData.get("humor_flavor_id"));
    const orderBy = Math.max(1, Number(formData.get("order_by")) || 1);
    const redirectPath = buildRedirectPath(humorFlavorId);

    await shiftOrdersForInsert(supabase, humorFlavorId, orderBy, user.id);

    const { error } = await supabase.from("humor_flavor_steps").insert({
      humor_flavor_id: humorFlavorId,
      order_by: orderBy,
      llm_temperature:
        String(formData.get("llm_temperature") ?? "").trim() === ""
          ? null
          : Number(formData.get("llm_temperature")),
      llm_input_type_id: Number(formData.get("llm_input_type_id")),
      llm_output_type_id: Number(formData.get("llm_output_type_id")),
      llm_model_id: Number(formData.get("llm_model_id")),
      humor_flavor_step_type_id: Number(
        formData.get("humor_flavor_step_type_id")
      ),
      llm_system_prompt: String(formData.get("llm_system_prompt") ?? "").trim(),
      llm_user_prompt: String(formData.get("llm_user_prompt") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
      created_datetime_utc: new Date().toISOString(),
      modified_datetime_utc: new Date().toISOString(),
    });

    if (error) {
      redirect(withStatus(redirectPath, { error: error.message }));
    }

    redirect(withStatus(redirectPath, { success: "created" }));
  }

  async function updateStep(formData: FormData) {
    "use server";

    const { supabase, user } = await requireSuperadmin();
    const stepId = Number(formData.get("id"));
    const nextFlavorId = Number(formData.get("humor_flavor_id"));
    const nextOrder = Math.max(1, Number(formData.get("order_by")) || 1);
    const redirectPath = buildRedirectPath(nextFlavorId);

    const { data: current } = await supabase
      .from("humor_flavor_steps")
      .select("id, humor_flavor_id, order_by")
      .eq("id", stepId)
      .single();

    if (!current) {
      redirect(withStatus(redirectPath, { error: "Step not found." }));
    }

    if (current.humor_flavor_id !== nextFlavorId) {
      await compactFlavorOrders(supabase, current.humor_flavor_id, user.id);
      await shiftOrdersForInsert(supabase, nextFlavorId, nextOrder, user.id);
    } else if (current.order_by !== nextOrder) {
      const { data: siblings } = await supabase
        .from("humor_flavor_steps")
        .select("id, order_by")
        .eq("humor_flavor_id", nextFlavorId)
        .neq("id", stepId)
        .order("order_by", { ascending: true });

      const now = new Date().toISOString();

      for (const sibling of siblings ?? []) {
        const siblingOrder = Number(sibling.order_by);
        const movingDown =
          nextOrder > current.order_by &&
          siblingOrder > current.order_by &&
          siblingOrder <= nextOrder;
        const movingUp =
          nextOrder < current.order_by &&
          siblingOrder >= nextOrder &&
          siblingOrder < current.order_by;

        if (!movingDown && !movingUp) continue;

        await supabase
          .from("humor_flavor_steps")
          .update({
            order_by: movingDown ? siblingOrder - 1 : siblingOrder + 1,
            modified_by_user_id: user.id,
            modified_datetime_utc: now,
          })
          .eq("id", sibling.id);
      }
    }

    const { error } = await supabase
      .from("humor_flavor_steps")
      .update({
        humor_flavor_id: nextFlavorId,
        order_by: nextOrder,
        llm_temperature:
          String(formData.get("llm_temperature") ?? "").trim() === ""
            ? null
            : Number(formData.get("llm_temperature")),
        llm_input_type_id: Number(formData.get("llm_input_type_id")),
        llm_output_type_id: Number(formData.get("llm_output_type_id")),
        llm_model_id: Number(formData.get("llm_model_id")),
        humor_flavor_step_type_id: Number(
          formData.get("humor_flavor_step_type_id")
        ),
        llm_system_prompt: String(formData.get("llm_system_prompt") ?? "").trim(),
        llm_user_prompt: String(formData.get("llm_user_prompt") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim() || null,
        modified_by_user_id: user.id,
        modified_datetime_utc: new Date().toISOString(),
      })
      .eq("id", stepId);

    if (error) {
      redirect(withStatus(redirectPath, { error: error.message }));
    }

    if (current.humor_flavor_id !== nextFlavorId) {
      await compactFlavorOrders(supabase, current.humor_flavor_id, user.id);
      await compactFlavorOrders(supabase, nextFlavorId, user.id);
    }

    redirect(withStatus(redirectPath, { success: "updated" }));
  }

  async function deleteStep(formData: FormData) {
    "use server";

    const { supabase, user } = await requireSuperadmin();
    const stepId = Number(formData.get("id"));
    const flavorId = Number(formData.get("humor_flavor_id"));
    const redirectPath = buildRedirectPath(flavorId);

    const { error } = await supabase.from("humor_flavor_steps").delete().eq("id", stepId);

    if (error) {
      redirect(withStatus(redirectPath, { error: error.message }));
    }

    await compactFlavorOrders(supabase, flavorId, user.id);
    redirect(withStatus(redirectPath, { success: "deleted" }));
  }

  async function moveStep(formData: FormData) {
    "use server";

    const { supabase, user } = await requireSuperadmin();
    const stepId = Number(formData.get("id"));
    const flavorId = Number(formData.get("humor_flavor_id"));
    const direction = String(formData.get("direction"));
    const redirectPath = buildRedirectPath(flavorId);

    const { data: siblings } = await supabase
      .from("humor_flavor_steps")
      .select("id, order_by")
      .eq("humor_flavor_id", flavorId)
      .order("order_by", { ascending: true })
      .order("id", { ascending: true });

    const index = (siblings ?? []).findIndex((row) => row.id === stepId);
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || swapIndex < 0 || !(siblings ?? [])[swapIndex]) {
      redirect(redirectPath);
    }

    const current = siblings![index];
    const target = siblings![swapIndex];
    const now = new Date().toISOString();

    await supabase
      .from("humor_flavor_steps")
      .update({
        order_by: target.order_by,
        modified_by_user_id: user.id,
        modified_datetime_utc: now,
      })
      .eq("id", current.id);

    await supabase
      .from("humor_flavor_steps")
      .update({
        order_by: current.order_by,
        modified_by_user_id: user.id,
        modified_datetime_utc: now,
      })
      .eq("id", target.id);

    redirect(withStatus(redirectPath, { success: "reordered" }));
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <AdminNavbar />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
            Prompt Chain Manager
          </p>
          <h1 className="text-4xl font-bold text-pink-600">Flavor Steps</h1>
        </div>
        <div className="bauhaus-chip bg-[var(--accent-blue)] text-[var(--button-foreground)]">
          Ordered step chain editor
        </div>
      </div>

      {params.success && (
        <div className="mb-6 rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--success)] p-4">
          Step {params.success} successfully.
        </div>
      )}

      {params.error && (
        <div className="mb-6 rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--accent-red)] p-4 text-[var(--button-foreground)]">
          {params.error}
        </div>
      )}

      <section className="bauhaus-card mb-8 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="mb-2 text-2xl text-pink-600">Filter by Flavor</h2>
            <p className="text-sm leading-7 text-[var(--muted)]">
              Focus the step editor on one humor flavor or inspect every step
              across the system.
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
            <button className="bauhaus-button-secondary" type="submit">
              Apply Filter
            </button>
            {selectedFlavorId && (
              <a href="/admin/humor-flavor-steps" className="bauhaus-button-dark">
                Clear
              </a>
            )}
          </form>
        </div>
      </section>

      <section className="bauhaus-card mb-8 p-6">
        <div className="mb-5">
          <h2 className="mb-2 text-2xl text-pink-600">Create Step</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Add a new prompt-chain step with explicit prompt text, model, input
            type, output type, and list position.
          </p>
        </div>

        <form action={createStep} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                Flavor
              </label>
              <select name="humor_flavor_id" defaultValue={selectedFlavorId ?? ""}>
                {flavors?.map((flavor) => (
                  <option key={flavor.id} value={flavor.id}>
                    {flavor.id} - {flavor.slug}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                Order
              </label>
              <input name="order_by" type="number" min={1} defaultValue={1} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                Temperature
              </label>
              <input
                name="llm_temperature"
                type="number"
                step="0.1"
                defaultValue="0.7"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                Model
              </label>
              <select name="llm_model_id">
                {models?.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.id} - {row.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                Input Type
              </label>
              <select name="llm_input_type_id">
                {inputTypes?.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.id} - {row.slug}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                Output Type
              </label>
              <select name="llm_output_type_id">
                {outputTypes?.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.id} - {row.slug}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                Step Type
              </label>
              <select name="humor_flavor_step_type_id">
                {stepTypes?.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.id} - {row.slug}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--muted)]">
              Step Description
            </label>
            <input
              name="description"
              placeholder="Short human-readable summary of what this step does."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--muted)]">
              System Prompt
            </label>
            <textarea name="llm_system_prompt" rows={8} required />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--muted)]">
              User Prompt
            </label>
            <textarea name="llm_user_prompt" rows={10} required />
          </div>

          <div>
            <button className="bauhaus-button" type="submit">
              Create Step
            </button>
          </div>
        </form>
      </section>

      <section className="bauhaus-card p-6">
        <div className="mb-5">
          <h2 className="mb-2 text-2xl text-pink-600">Existing Steps</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Reorder steps with the move controls, edit any prompt fields, or
            delete rows you no longer need.
          </p>
        </div>

        <div className="grid gap-5">
          {steps.map((step) => {
            const flavor = flavors?.find(
              (candidate) => candidate.id === step.humor_flavor_id
            );

            return (
              <div
                key={step.id}
                className="rounded-[1.75rem] border-2 border-[var(--border)] bg-[var(--surface)] p-5 shadow-[8px_8px_0_var(--shadow-strong)]"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="bauhaus-chip mb-2 inline-flex bg-[var(--accent-yellow)] text-[var(--ink)]">
                      Step {step.id}
                    </div>
                    <div className="text-sm text-[var(--muted)]">
                      Flavor {step.humor_flavor_id} - {flavor?.slug ?? "Unknown"} -
                      {" "}Order {step.order_by}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <form action={moveStep}>
                      <input type="hidden" name="id" value={step.id} />
                      <input
                        type="hidden"
                        name="humor_flavor_id"
                        value={step.humor_flavor_id}
                      />
                      <input type="hidden" name="direction" value="up" />
                      <button className="bauhaus-button-secondary" type="submit">
                        Move Up
                      </button>
                    </form>
                    <form action={moveStep}>
                      <input type="hidden" name="id" value={step.id} />
                      <input
                        type="hidden"
                        name="humor_flavor_id"
                        value={step.humor_flavor_id}
                      />
                      <input type="hidden" name="direction" value="down" />
                      <button className="bauhaus-button-secondary" type="submit">
                        Move Down
                      </button>
                    </form>
                  </div>
                </div>

                <form action={updateStep} className="grid gap-4">
                  <input type="hidden" name="id" value={step.id} />

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm text-[var(--muted)]">
                        Flavor
                      </label>
                      <select
                        name="humor_flavor_id"
                        defaultValue={step.humor_flavor_id}
                      >
                        {flavors?.map((flavorOption) => (
                          <option key={flavorOption.id} value={flavorOption.id}>
                            {flavorOption.id} - {flavorOption.slug}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-[var(--muted)]">
                        Order
                      </label>
                      <input
                        name="order_by"
                        type="number"
                        min={1}
                        defaultValue={step.order_by}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-[var(--muted)]">
                        Temperature
                      </label>
                      <input
                        name="llm_temperature"
                        type="number"
                        step="0.1"
                        defaultValue={step.llm_temperature ?? ""}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <label className="mb-2 block text-sm text-[var(--muted)]">
                        Model
                      </label>
                      <select name="llm_model_id" defaultValue={step.llm_model_id}>
                        {models?.map((row) => (
                          <option key={row.id} value={row.id}>
                            {row.id} - {row.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-[var(--muted)]">
                        Input Type
                      </label>
                      <select
                        name="llm_input_type_id"
                        defaultValue={step.llm_input_type_id}
                      >
                        {inputTypes?.map((row) => (
                          <option key={row.id} value={row.id}>
                            {row.id} - {row.slug}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-[var(--muted)]">
                        Output Type
                      </label>
                      <select
                        name="llm_output_type_id"
                        defaultValue={step.llm_output_type_id}
                      >
                        {outputTypes?.map((row) => (
                          <option key={row.id} value={row.id}>
                            {row.id} - {row.slug}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-[var(--muted)]">
                        Step Type
                      </label>
                      <select
                        name="humor_flavor_step_type_id"
                        defaultValue={step.humor_flavor_step_type_id}
                      >
                        {stepTypes?.map((row) => (
                          <option key={row.id} value={row.id}>
                            {row.id} - {row.slug}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-[var(--muted)]">
                      Step Description
                    </label>
                    <input
                      name="description"
                      defaultValue={step.description ?? ""}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-[var(--muted)]">
                      System Prompt
                    </label>
                    <textarea
                      name="llm_system_prompt"
                      rows={8}
                      defaultValue={step.llm_system_prompt ?? ""}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-[var(--muted)]">
                      User Prompt
                    </label>
                    <textarea
                      name="llm_user_prompt"
                      rows={10}
                      defaultValue={step.llm_user_prompt ?? ""}
                      required
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className="bauhaus-button">
                      Save Step
                    </button>
                  </div>
                </form>

                <form action={deleteStep} className="mt-3">
                  <input type="hidden" name="id" value={step.id} />
                  <input
                    type="hidden"
                    name="humor_flavor_id"
                    value={step.humor_flavor_id}
                  />
                  <button type="submit" className="bauhaus-button-dark">
                    Delete Step
                  </button>
                </form>
              </div>
            );
          })}

          {!steps.length && (
            <div className="rounded-[1.5rem] border-2 border-dashed border-[var(--border)] bg-[var(--panel)] p-8 text-sm text-[var(--muted)]">
              No step rows found for the current filter.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
