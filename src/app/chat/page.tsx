"use client";

import { AomiRuntimeProvider, useAomiRuntime, useCurrentThreadMessages } from "@aomi-labs/react";
import { useState, useRef, useEffect, useCallback } from "react";

function ChatInterface() {
  const { isRunning, sendMessage, currentThreadId, error } = useAomiRuntime();
  const messages = useCurrentThreadMessages();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isRunning]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isRunning) return;
    sendMessage(text);
    setInput("");
    inputRef.current?.focus();
  }, [input, isRunning, sendMessage]);

  const quickPrompts = [
    "What football matches can I bet on?",
    "Bet $10 on Argentina to beat Algeria",
    "Show my positions",
    "Will ETH hit $5K by year end?",
  ];

  return (
    <div className="noise" style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(8,12,16,0.85)", backdropFilter: "blur(16px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="font-display" style={{ fontSize: 15, color: "#fff" }}>G</span>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 15, letterSpacing: "0.04em" }}>GAMBIT</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: error ? "var(--red-alert)" : "var(--turf)",
              }} className="animate-pulse-live" />
              <span style={{
                fontSize: 10,
                color: error ? "var(--red-alert)" : "var(--turf)",
              }}>
                {error ? "Connection error" : "Connected to Aomi"}
              </span>
            </div>
          </div>
        </div>
        <a href="/" className="font-display" style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--text-muted)", padding: "8px 14px" }}>
          BACK
        </a>
      </header>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: "12px 20px", background: "rgba(255,61,87,0.1)",
          borderBottom: "1px solid rgba(255,61,87,0.2)", fontSize: 13, color: "var(--red-alert)",
        }}>
          <strong>Aomi connection error:</strong> {typeof error === "string" ? error : error.message || "Could not connect to Aomi backend. The app may not be activated yet."}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && !error && (
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{"\u26bd"}</div>
              <p className="font-display" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 16 }}>AI PREDICTION MARKETS</p>
              <h2 className="font-display" style={{ fontSize: 32, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 10 }}>
                <span style={{ color: "var(--text-primary)" }}>WELCOME TO </span>
                <span style={{ color: "var(--accent)" }}>GAMBIT</span>
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, margin: "0 auto 36px", lineHeight: 1.7 }}>
                Ask about markets, get odds analysis, or place a bet &mdash; all by chatting.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {quickPrompts.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)} className="font-display" style={{
                    fontSize: 11, letterSpacing: "0.06em", padding: "10px 18px",
                    border: "1px solid var(--border-default)", background: "rgba(14,20,32,0.5)",
                    borderRadius: 8, color: "var(--text-secondary)", backdropFilter: "blur(8px)",
                  }}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"} style={{
                maxWidth: "85%", padding: "14px 18px", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>
                {typeof msg.content === "string" ? msg.content : msg.content?.map?.((c: any) => c.text || "").join("") || JSON.stringify(msg.content)}
              </div>
            </div>
          ))}

          {isRunning && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div className="chat-bubble-bot" style={{ padding: "16px 22px", display: "flex", gap: 6 }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", background: "rgba(8,12,16,0.85)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--bg-card)", border: "1px solid var(--border-default)",
            borderRadius: 12, padding: "12px 16px",
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={error ? "Aomi not connected — check activation" : "Ask about markets, odds, or place a bet..."}
              disabled={isTyping || !!error}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontSize: 14, color: "var(--text-primary)", fontFamily: "monospace",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || !!error}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: input.trim() && !isTyping && !error ? "var(--accent)" : "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: input.trim() && !isTyping && !error ? 1 : 0.4, transition: "all 0.2s",
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="font-display" style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", marginTop: 8, letterSpacing: "0.08em" }}>
            GAMBIT \u00b7 POWERED BY AOMI SDK
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const backendUrl = process.env.NEXT_PUBLIC_AOMI_BACKEND_URL || "https://staging-api.aomi.dev";

  return (
    <AomiRuntimeProvider backendUrl={backendUrl}>
      <ChatInterface />
    </AomiRuntimeProvider>
  );
}
