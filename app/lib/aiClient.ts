import { API_BASE_URL } from "./config";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ParseSearchResult = {
  from: string | null;
  to: string | null;
  date: string | null;
  confident: boolean;
  error?: string;
};

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "1"
};

export async function parseSearch(query: string): Promise<ParseSearchResult> {
  const res = await fetch(`${API_BASE_URL}/api/ai/parse-search`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ query })
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error?.message ?? "Failed to parse search query");
  }
  const payload = await res.json();
  return payload.data as ParseSearchResult;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: Record<string, string> = { ...BASE_HEADERS };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, history: history.slice(-10) })
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error?.message ?? "AI service unavailable");
  }
  const payload = await res.json();
  return payload.data.reply as string;
}
