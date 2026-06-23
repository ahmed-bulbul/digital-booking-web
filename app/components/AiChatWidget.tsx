"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  streamChatMessage,
  getConversations,
  getConversationMessages,
  type ChatMessage,
  type Conversation,
  type ConversationMessage
} from "../lib/aiClient";

type Message = { role: "user" | "assistant"; content: string; streaming?: boolean; error?: boolean };

const GREETING: Message = {
  role: "assistant",
  content: "Hi! I'm the JatraXpress assistant. Ask me about routes, bookings, refund policies, or anything about your journey."
};

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("ai_session_id");
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("ai_session_id", id); }
  return id;
}

function isLoggedIn(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem("auth_token");
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      if (view === "chat") setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages, view]);

  const loadHistory = useCallback(async () => {
    if (!isLoggedIn()) return;
    setHistoryLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const openHistory = () => {
    setView("history");
    loadHistory();
  };

  const loadConversation = async (conv: Conversation) => {
    const msgs = await getConversationMessages(conv.id);
    const mapped: Message[] = msgs.map((m: ConversationMessage) => ({
      role: m.role as "user" | "assistant",
      content: m.content
    }));
    setMessages(mapped.length ? mapped : [GREETING]);
    setConversationId(conv.id);
    setView("chat");
  };

  const newConversation = () => {
    setMessages([GREETING]);
    setConversationId(null);
    setView("chat");
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    abortRef.current = false;
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    await streamChatMessage({
      message: text,
      conversationId,
      sessionId: getSessionId(),
      onConversationId: (id) => setConversationId(id),
      onToken: (token) => {
        if (abortRef.current) return;
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.streaming) {
            next[next.length - 1] = { ...last, content: last.content + token };
          }
          return next;
        });
      },
      onDone: () => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.streaming) next[next.length - 1] = { ...last, streaming: false };
          return next;
        });
        setStreaming(false);
      },
      onError: (msg) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.streaming) {
            next[next.length - 1] = { role: "assistant", content: msg, error: true };
          } else {
            next.push({ role: "assistant", content: msg, error: true });
          }
          return next;
        });
        setStreaming(false);
      }
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-[340px] sm:w-[380px] bg-surface-container-lowest rounded-2xl shadow-2xl shadow-black/20 border border-outline-variant/30 flex flex-col overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 primary-gradient flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                smart_toy
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">JatraXpress Assistant</p>
              <p className="text-white/70 text-[11px]">
                {streaming ? "Typing…" : "Powered by AI · Always available"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {isLoggedIn() && view === "chat" && (
                <button
                  onClick={openHistory}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Chat history"
                >
                  <span className="material-symbols-outlined text-white text-[18px]">history</span>
                </button>
              )}
              {view === "history" && (
                <button
                  onClick={() => setView("chat")}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Back to chat"
                >
                  <span className="material-symbols-outlined text-white text-[18px]">arrow_back</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-white text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* History panel */}
          {view === "history" && (
            <div className="flex-1 overflow-y-auto flex flex-col">
              <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">Recent Conversations</span>
                <button
                  onClick={newConversation}
                  className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  New chat
                </button>
              </div>
              {historyLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl">chat_bubble</span>
                  <p className="text-sm text-on-surface-variant">No conversations yet. Start chatting!</p>
                  <button onClick={newConversation} className="mt-1 text-sm text-primary font-medium hover:underline">
                    Start new chat
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => loadConversation(conv)}
                      className={`w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors flex items-start gap-3 ${
                        conv.id === conversationId ? "bg-primary/5 border-l-2 border-primary" : ""
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary/60 text-[18px] mt-0.5 flex-shrink-0">
                        chat_bubble_outline
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-on-surface truncate font-medium">
                          {conv.title ?? "Untitled conversation"}
                        </p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {new Date(conv.createdAt).toLocaleDateString("en-BD", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat panel */}
          {view === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-primary text-[13px]"
                          style={{ fontVariationSettings: '"FILL" 1' }}>smart_toy</span>
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "primary-gradient text-white rounded-tr-sm"
                        : msg.error
                        ? "bg-error/10 text-error border border-error/20 rounded-tl-sm"
                        : "bg-surface-container-low text-on-surface rounded-tl-sm"
                    }`}>
                      {msg.content}
                      {msg.streaming && !msg.content && (
                        <span className="inline-flex gap-1 items-center">
                          {[0, 1, 2].map((j) => (
                            <span key={j} className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50 animate-bounce"
                              style={{ animationDelay: `${j * 150}ms` }} />
                          ))}
                        </span>
                      )}
                      {msg.streaming && msg.content && (
                        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="flex items-center gap-2 px-3 py-3 border-t border-outline-variant/20 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 bg-surface-container-low rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 border border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all"
                  placeholder="Ask me anything…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  disabled={streaming}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || streaming}
                  className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-white text-[18px]">
                    {streaming ? "stop_circle" : "send"}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 primary-gradient rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:opacity-95 active:scale-95 transition-all duration-200 relative"
        aria-label={open ? "Close assistant" : "Open AI assistant"}
      >
        <span
          className="material-symbols-outlined text-white text-2xl transition-transform duration-200"
          style={{ fontVariationSettings: '"FILL" 1', transform: open ? "rotate(20deg)" : "rotate(0deg)" }}
        >
          {open ? "close" : "auto_awesome"}
        </span>
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-surface-container-lowest animate-pulse" />
        )}
      </button>
    </div>
  );
}
