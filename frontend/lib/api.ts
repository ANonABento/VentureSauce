// Client for the VentureSauce backend (backend/README.md). The panel's only data source.
import type { DeltaReport } from "@/lib/types";

const DEFAULT_API = (process.env.NEXT_PUBLIC_API ?? "http://localhost:8000").replace(/\/$/, "");
// Backends a link may point the panel at (?api=…): the laptop, quick tunnels, and hosted backends we run.
const ALLOWED_API = /^(http:\/\/(localhost|127\.0\.0\.1)(:\d+)?|https:\/\/[a-z0-9-]+\.(trycloudflare\.com|hf\.space))$/;

/** The backend URL. `?api=https://….trycloudflare.com` switches it without a redeploy (remembered per browser;
 * `?api=default` forgets it), so a restarted tunnel only needs a new link, not a new build. */
function resolveApi(): string {
  if (typeof window === "undefined") return DEFAULT_API;
  try {
    const asked = new URLSearchParams(window.location.search).get("api")?.replace(/\/$/, "");
    if (asked === "default") localStorage.removeItem("vs.api");
    else if (asked && ALLOWED_API.test(asked)) localStorage.setItem("vs.api", asked);
    return localStorage.getItem("vs.api") || DEFAULT_API;
  } catch {
    return DEFAULT_API;
  }
}

export const API = resolveApi();

/** This browser's inbox. `?ws=demo` pins a named one (remembered); otherwise a random id is made on first visit,
 * so each tester has a private inbox. "default" is the old shared inbox. */
function resolveWorkspace(): string {
  if (typeof window === "undefined") return "default";
  const valid = (v: string | null | undefined) => !!v && /^[a-z0-9][a-z0-9-]{0,39}$/.test(v);
  try {
    const asked = new URLSearchParams(window.location.search).get("ws")?.toLowerCase();
    if (valid(asked)) localStorage.setItem("vs.ws", asked!);
    const saved = localStorage.getItem("vs.ws");
    if (valid(saved)) return saved!;
    const fresh = `t-${crypto.randomUUID().slice(0, 12)}`;
    localStorage.setItem("vs.ws", fresh);
    return fresh;
  } catch {
    return `t-${Math.random().toString(16).slice(2, 14)}`; // storage blocked: private for this page load
  }
}

export const WORKSPACE = resolveWorkspace();

/** fetch() against the backend, in this browser's workspace. */
function call(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API}${path}`, { ...init, headers: { ...(init.headers as Record<string, string>), "X-Workspace": WORKSPACE } });
}

export type ItemKind = "pdf" | "pdf_scanned" | "slides" | "image" | "email" | "notes" | "text";

export const KIND_NAME: Record<string, string> = {
  pdf: "Deck",
  pdf_scanned: "Deck",
  slides: "Slides",
  image: "Screenshot",
  email: "Email",
  notes: "Call notes",
  text: "Note",
};

export type CompanySummary = {
  id: string;
  name: string;
  domain: string | null;
  updated_at: string;
  item_count: number;
  item_kinds: ItemKind[];
  discrepancies: number;
  contradictions: number;
  last_item_at: string | null;
};

export type Item = {
  id: string;
  kind: ItemKind;
  kind_name: string;
  label: string;
  item_date: string | null;
  received_at: string;
  claim_count: number;
};

export type Question = { question: string; why: string };

export type Check = {
  claim_type: string;
  claim_text: string;
  claimed_value: number | string | null;
  observed_value: number | string | null;
  unit: string | null;
  source: "form_d" | "linkedin" | "press" | "your_sources";
  source_url: string | null;
  source_date: string | null;
  verdict: "match" | "gap" | "unverifiable";
  label: string;
  confidence: string;
  note: string;
  metric?: string | null;
  item_label?: string | null;
  values?: { value: number; item_label: string; item_day: string; claim_text: string }[];
};

export type CompanyView = {
  company: { id: string; name: string; domain: string | null; cik?: string | null; fictional?: boolean; form_d_entity?: string };
  items: Item[];
  checks: Check[];
  questions: Question[];
};

export type Job = CompanyView & {
  job_id: string;
  status: "parsing" | "checking_sec" | "checking_linkedin" | "checking_press" | "comparing_sources" | "ready" | "error";
  company_id: string | null;
  item_id: string | null;
  error: string | null;
};

export type Digest = {
  period: "day" | "week";
  totals: { companies: number; items: number; discrepancies: number; contradictions: number };
  companies: {
    id: string;
    name: string;
    fictional: boolean;
    new_items: Item[];
    headline: string;
    discrepancies: { signal: string; short: string | null; summary: string }[];
    contradictions: number;
    questions: Question[];
  }[];
  summary: string;
  script: string;
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const getHealth = () => call(`/health`).then((r) => json<{ ok: boolean; fake: boolean; sources: "stub" | "live" }>(r));
export const listCompanies = () => call(`/companies`).then((r) => json<CompanySummary[]>(r));
export const getCompany = (id: string) => call(`/companies/${id}`).then((r) => json<CompanyView>(r));
export const getReport = (q: { companyId?: string; url?: string; company?: string }) => {
  const p = new URLSearchParams(
    q.companyId ? { company_id: q.companyId } : q.url ? { url: q.url } : { company: q.company ?? "" },
  );
  return call(`/api/delta?${p}`).then((r) => json<DeltaReport & { questions: Question[]; items: Item[] }>(r));
};
export const getDigest = (period: "day" | "week") => call(`/digest?period=${period}`).then((r) => json<Digest>(r));
export const recordBrief = (script: string) =>
  call(`/digest/audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ script }),
  }).then((r) => json<{ audio_url: string }>(r));
export const moveItem = (itemId: string, target: { companyId?: string; newCompany?: string }) =>
  call(`/items/${itemId}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company_id: target.companyId, new_company: target.newCompany }),
  }).then((r) => json<{ company_id: string }>(r));

/** Drop one item (file or pasted text) and follow the job until it's ready. */
export async function dropItem(
  input: { file?: File; text?: string; kind?: "email" | "notes"; companyId?: string },
  onProgress: (job: Job) => void,
): Promise<Job> {
  const form = new FormData();
  if (input.file) form.append("file", input.file);
  if (input.text) form.append("text", input.text);
  if (input.kind) form.append("kind", input.kind);
  if (input.companyId) form.append("company_id", input.companyId);
  const { job_id } = await call(`/analyze`, { method: "POST", body: form }).then((r) =>
    json<{ job_id: string }>(r),
  );
  for (;;) {
    const job = await call(`/jobs/${job_id}`).then((r) => json<Job>(r));
    onProgress(job);
    if (job.status === "ready") return job;
    if (job.status === "error") throw new Error(job.error ?? "That item couldn't be read.");
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
}

/** Streams the analyst's answer sentence by sentence (already fact-checked server-side). */
export async function chatStream(
  messages: { role: "user" | "assistant"; content: string }[],
  onText: (text: string) => void,
  signal: AbortSignal,
) {
  const res = await call(`/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error("The analyst is unavailable.");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    let cut;
    while ((cut = buffer.indexOf("\n\n")) >= 0) {
      const event = JSON.parse(buffer.slice(0, cut).replace(/^data: /, ""));
      buffer = buffer.slice(cut + 2);
      if (event.text) onText(event.text);
    }
  }
}

/** "Try it with an example": copies the prebuilt example inbox into this workspace (instant). */
export const loadExample = () => call(`/workspace/example`, { method: "POST" }).then((r) => json<{ companies: number }>(r));

export const ttsUrl = (text: string, speed?: number) =>
  `${API}/tts?text=${encodeURIComponent(text)}${speed ? `&speed=${speed}` : ""}`;

/** Speech → text on the server (Fish Audio), for browsers without built-in speech recognition. */
export async function transcribe(wav: Blob): Promise<string> {
  const form = new FormData();
  form.append("audio", wav, "question.wav");
  const { text } = await call(`/asr`, { method: "POST", body: form }).then((r) => json<{ text: string }>(r));
  return text;
}
