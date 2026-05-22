import { authHeader } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000";

export type DocKind =
  | "rent_roll"
  | "operating_statement"
  | "appraisal"
  | "title"
  | "insurance"
  | "purchase_sale"
  | "sponsor_bio"
  | "environmental"
  | "other";

export type Document = {
  id: string;
  deal_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  sha256: string;
  kind: DocKind;
  uploaded_by: string | null;
  uploaded_at: string;
  extracted_fields: Record<string, unknown>;
  extraction_status: "pending" | "done" | "failed";
};

export type ReadinessItem = { kind: DocKind; label: string; weight: number };

export type Readiness = {
  deal_id: string;
  score: number;
  present: ReadinessItem[];
  missing: ReadinessItem[];
  doc_count: number;
  blocking_count: number;
};

export async function listDocs(dealId: string): Promise<Document[]> {
  const r = await fetch(`${BASE}/api/docs?deal_id=${encodeURIComponent(dealId)}`, {
    cache: "no-store",
    headers: authHeader(),
  });
  if (!r.ok) return [];
  return r.json();
}

export async function getReadiness(dealId: string): Promise<Readiness> {
  const r = await fetch(`${BASE}/api/docs/readiness?deal_id=${encodeURIComponent(dealId)}`, {
    cache: "no-store",
    headers: authHeader(),
  });
  return r.json();
}

export async function uploadDoc(dealId: string, file: File): Promise<Document> {
  const form = new FormData();
  form.append("deal_id", dealId);
  form.append("file", file);
  const r = await fetch(`${BASE}/api/docs/upload`, {
    method: "POST",
    headers: authHeader(),
    body: form,
  });
  const body = await r.json();
  if (!r.ok) throw new Error(body.error || `upload failed (${r.status})`);
  return body;
}

export async function deleteDoc(docId: string): Promise<void> {
  const r = await fetch(`${BASE}/api/docs/${docId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!r.ok && r.status !== 404) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.error || `delete failed (${r.status})`);
  }
}

export function downloadUrl(docId: string): string {
  return `${BASE}/api/docs/${docId}/download`;
}
