"use client";

import { useEffect, useRef, useState } from "react";
import { sendChatMessage, type ChatMessage } from "../lib/aiClient";

type Message = ChatMessage & { error?: boolean };

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm the JatraXpress assistant. Ask me about routes, bookings, refund policies, or anything about your journey." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = nextMessages
        .slice(-11, -1)
        .map(({ role, content }) => ({ role, content }));
      const reply = await sendChatMessage(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          error: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-[340px] sm:w-[380px] bg-surface-container-lowest rounded-2xl shadow-2xl shadow-black/20 border border-outline-variant/30 flex flex-col overflow-hidden animate-slide-down"
          style={{ height: "520px" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 primary-gradient flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                smart_toy
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">JatraXpress Assistant</p>
              <p className="text-white/70 text-[11px]">Powered by AI · Always available</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <span className="material-symbols-outlined text-white text-[18px]">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-[13px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      smart_toy
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "primary-gradient text-white rounded-tr-sm"
                      : msg.error
                      ? "bg-error/10 text-error border border-error/20 rounded-tl-sm"
                      : "bg-surface-container-low text-on-surface rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-[13px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    smart_toy
                  </span>
                </div>
                <div className="bg-surface-container-low rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-outline-variant/20 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-surface-container-low rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 border border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all"
              placeholder="Ask me anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-white text-[18px]">send</span>
            </button>
          </div>
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
