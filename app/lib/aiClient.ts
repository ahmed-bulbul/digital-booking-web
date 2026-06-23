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

export type Conversation = {
  id: number;
  title: string | null;
  createdAt: string;
};

export type ConversationMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "1"
};

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return token ? { ...BASE_HEADERS, Authorization: `Bearer ${token}` } : { ...BASE_HEADERS };
}

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
  history: ChatMessage[],
  conversationId?: number | null,
  sessionId?: string
): Promise<{ reply: string; conversationId: number }> {
  const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message, history: history.slice(-10), conversationId, sessionId })
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error?.message ?? "AI service unavailable");
  }
  const payload = await res.json();
  return { reply: payload.data.reply as string, conversationId: payload.data.conversationId as number };
}

export async function streamChatMessage(opts: {
  message: string;
  conversationId: number | null;
  sessionId: string;
  onToken: (token: string) => void;
  onConversationId: (id: number) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}): Promise<void> {
  const { message, conversationId, sessionId, onToken, onConversationId, onDone, onError } = opts;

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/chat/stream`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message, conversationId, sessionId })
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      onError(payload?.error?.message ?? "AI service unavailable");
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) { onError("Streaming not supported"); return; }

    const decoder = new TextDecoder();
    let buffer = "";
    let currentEvent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        // Spring sends "event:<name>" with no space — handle both forms
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          // SSE spec strips one optional leading space after "data:" — so we do too
          const raw = line.slice(5);
          const data = raw.startsWith(" ") ? raw.slice(1) : raw;

          if (currentEvent === "conversation") {
            try {
              const parsed = JSON.parse(data);
              if (parsed.conversationId) onConversationId(parsed.conversationId);
            } catch { /* ignore */ }
            currentEvent = "";
          } else if (currentEvent === "done") {
            onDone();
            currentEvent = "";
          } else if (data) {
            // Tokens are JSON-encoded as {"t":"..."} to preserve spaces
            try {
              const parsed = JSON.parse(data);
              if (typeof parsed.t === "string") onToken(parsed.t);
            } catch {
              onToken(data); // fallback for plain-text data
            }
          }
        } else if (line === "") {
          currentEvent = "";
        }
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Stream error");
  }
}

export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE_URL}/api/ai/conversations`, {
    headers: authHeaders()
  });
  if (!res.ok) return [];
  const payload = await res.json();
  return (payload.data ?? []) as Conversation[];
}

export async function getConversationMessages(id: number): Promise<ConversationMessage[]> {
  const res = await fetch(`${API_BASE_URL}/api/ai/conversations/${id}/messages`, {
    headers: authHeaders()
  });
  if (!res.ok) return [];
  const payload = await res.json();
  return (payload.data ?? []) as ConversationMessage[];
}
