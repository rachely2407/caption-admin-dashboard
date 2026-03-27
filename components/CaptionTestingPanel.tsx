"use client";

import { useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { uploadImageFile } from "@/lib/imageUpload";

type Flavor = {
  id: number;
  slug: string | null;
  description: string | null;
};

type CaptionResult = {
  id?: string;
  content?: string | null;
  humor_flavor_id?: number | null;
  caption_request_id?: number | null;
  llm_prompt_chain_id?: number | null;
  created_datetime_utc?: string | null;
  image_id?: string | null;
};

const API_BASE = "https://api.almostcrackd.ai";

export default function CaptionTestingPanel({
  flavors,
}: {
  flavors: Flavor[];
}) {
  const supabase = createSupabaseBrowserClient();
  const [selectedFlavorId, setSelectedFlavorId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedFlavor = useMemo(
    () => flavors.find((flavor) => String(flavor.id) === selectedFlavorId),
    [flavors, selectedFlavorId]
  );

  function handleFileChange(file: File | null) {
    setImage(file);
    setResult(null);
    setErrorMessage("");

    if (!file) {
      setPreviewUrl("");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImage(null);
    setPreviewUrl("");
    setUploadedImageUrl("");
    setResult(null);
    setErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleGenerate() {
    if (!selectedFlavorId || !image) {
      alert("Choose a humor flavor and upload an image first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) {
        throw new Error("No active Supabase session found. Please log in again.");
      }

      const cdnUrl = await uploadImageFile(image, token);

      const registerRes = await fetch(
        `${API_BASE}/pipeline/upload-image-from-url`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: cdnUrl,
            isCommonUse: false,
          }),
        }
      );

      if (!registerRes.ok) {
        throw new Error(await registerRes.text());
      }

      const registerData = await registerRes.json();
      setUploadedImageUrl(cdnUrl);

      const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: registerData.imageId,
          humorFlavorId: Number(selectedFlavorId),
        }),
      });

      if (!captionRes.ok) {
        throw new Error(await captionRes.text());
      }

      const captionData = await captionRes.json();
      setResult(Array.isArray(captionData) ? captionData : [captionData]);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Caption generation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
      <section className="bauhaus-card p-6">
        <div className="bauhaus-chip mb-4 inline-flex bg-[var(--accent-yellow)] text-[var(--ink)]">
          API Test Runner
        </div>

        <h2 className="mb-2 text-3xl text-[var(--accent-red)]">
          Test a Humor Flavor
        </h2>
        <p className="mb-5 text-sm leading-7 text-[var(--muted)]">
          Upload one image, choose a flavor, and run the Crackd caption pipeline
          for that specific prompt chain.
        </p>

        <div className="mb-5">
          <label className="mb-2 block text-sm text-[var(--muted)]">
            Humor flavor
          </label>
          <select
            value={selectedFlavorId}
            onChange={(event) => setSelectedFlavorId(event.target.value)}
          >
            <option value="">Choose a flavor</option>
            {flavors.map((flavor) => (
              <option key={flavor.id} value={flavor.id}>
                {flavor.id} - {flavor.slug ?? "(no slug)"}
              </option>
            ))}
          </select>
        </div>

        {selectedFlavor && (
          <div className="mb-5 rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-1 text-lg font-semibold text-[var(--foreground)]">
              {selectedFlavor.slug ?? `Flavor ${selectedFlavor.id}`}
            </div>
            <div className="text-sm leading-7 text-[var(--muted)]">
              {selectedFlavor.description || "No description provided."}
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="mb-2 block text-sm text-[var(--muted)]">
            Upload image
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] || null)
            }
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="bauhaus-button-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </button>

            {image && (
              <button
                type="button"
                className="bauhaus-button-dark"
                onClick={handleRemoveImage}
              >
                Remove Image
              </button>
            )}

            <div className="rounded-[1rem] border-2 border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)]">
              {image ? image.name : "No file chosen"}
            </div>
          </div>
        </div>

        {previewUrl && (
          <div className="mb-5">
            <div className="mb-2 text-sm text-[var(--muted)]">Preview</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Upload preview"
              className="max-h-80 w-full rounded-[1.25rem] border-2 border-[var(--border)] object-cover shadow-[8px_8px_0_var(--shadow-strong)]"
            />
          </div>
        )}

        <button
          type="button"
          className="bauhaus-button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Captions"}
        </button>
      </section>

      <section className="bauhaus-card p-6">
        <div className="bauhaus-chip mb-4 inline-flex bg-[var(--accent-blue)] text-[var(--button-foreground)]">
          Results
        </div>

        <h2 className="mb-2 text-3xl text-[var(--accent-red)]">
          Generated Captions
        </h2>
        <p className="mb-5 text-sm leading-7 text-[var(--muted)]">
          Generated caption text and prompt-chain metadata appear here after the
          API returns.
        </p>

        {errorMessage ? (
          <div className="rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--accent-red)] p-5 text-[var(--button-foreground)]">
            <div className="mb-2 text-lg font-semibold">Generation failed</div>
            <pre className="whitespace-pre-wrap break-words text-sm leading-7">
              {errorMessage}
            </pre>
          </div>
        ) : !result ? (
          <div className="grid min-h-96 place-items-center rounded-[1.5rem] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <div>
              <div className="mb-3 text-5xl text-[var(--accent-blue)]">[]</div>
              <div className="mb-2 text-xl font-semibold uppercase tracking-[0.14em]">
                No Output Yet
              </div>
              <div className="text-sm text-[var(--muted)]">
                Run a test and the generated caption cards will appear here.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {result.map((item, index) => (
              <article
                key={item.id ?? index}
                className="rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--surface)] p-5 shadow-[8px_8px_0_var(--shadow-strong)]"
              >
                {uploadedImageUrl && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImageUrl}
                      alt="Generated caption source"
                      className="mb-4 max-h-64 w-full rounded-[1rem] border-2 border-[var(--border)] object-cover"
                    />
                  </>
                )}

                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="bauhaus-chip bg-[var(--accent-yellow)] text-[var(--ink)]">
                    Caption {index + 1}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {item.created_datetime_utc
                      ? new Date(item.created_datetime_utc).toLocaleString()
                      : "No timestamp"}
                  </div>
                </div>

                <div className="mb-4 whitespace-pre-wrap text-base leading-8 text-[var(--foreground)]">
                  {item.content || "No caption text returned."}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1rem] border-2 border-[var(--border)] bg-[var(--panel)] p-3">
                    <div className="mb-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      Flavor ID
                    </div>
                    <div className="font-medium">{item.humor_flavor_id ?? "—"}</div>
                  </div>
                  <div className="rounded-[1rem] border-2 border-[var(--border)] bg-[var(--panel)] p-3">
                    <div className="mb-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      Caption Request ID
                    </div>
                    <div className="font-medium">
                      {item.caption_request_id ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-[1rem] border-2 border-[var(--border)] bg-[var(--panel)] p-3">
                    <div className="mb-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      Prompt Chain ID
                    </div>
                    <div className="font-medium">
                      {item.llm_prompt_chain_id ?? "—"}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
