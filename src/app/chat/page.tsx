"use client";

import {
  AomiRuntimeProvider,
  useAomiRuntime,
  useUser,
  useControl,
} from "@aomi-labs/react";
import { useState, useRef, useEffect, useCallback } from "react";

// =============================================================================
// Chat UI — uses Aomi headless library
// =============================================================================

function ChatInterface() {
  const { messages, isStreaming, sendMessage, currentThreadId } =
    useAomiRuntime();
  const { connect, isConnected, address } = useUser();
  const { app, setApp, apiKey, setApiKey } = useControl();
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Set app slug on mount
  useEffect(() => {
    const slug = process.env.NEXT_PUBLIC_AOMI_APP_SLUG || "gambit";
    if (setApp) setApp(slug);
  }, [setApp]);

  // Set API key on mount
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AOMI_API_KEY;
    if (key && setApiKey) setApiKey(key);
  }, [setApiKey]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage(text);
    setInput("");
    inputRef.current?.focus();
  }, [input, isStreaming, sendMessage]);

  const quickPrompts = [
    "What football matches can I bet on?",
    "Bet $10 on Argentina to beat Algeria",
    "Show my positions",
    "Will ETH hit $5K by year end?",
  ];

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              G
            </span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Gambit</div>
            <div
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isConnected ? "var(--green)" : "var(--muted)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: isConnected ? "var(--green)" : "var(--muted)",
                  fontFamily: "var(--mono)",
                }}
              >
                {isConnected
                  ? `Connected ${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : "Demo Mode"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="pill-btn pill-btn-ghost"
            style={{ fontSize: 10, padding: "8px 12px" }}
          >
            Settings
          </button>
          {!isConnected && (
            <button
              onClick={() => connect()}
              className="pill-btn pill-btn-primary"
              style={{ fontSize: 10, padding: "8px 16px" }}
            >
              Connect Wallet
            </button>
          )}
          <a
            href="/"
            className="pill-btn pill-btn-ghost"
            style={{ fontSize: 10, padding: "8px 12px" }}
          >
            {"\u2190"} Back
          </a>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--card)",
          }}
        >
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  fontFamily: "var(--mono)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                App Slug
              </label>
              <input
                type="text"
                value={app || ""}
                onChange={(e) => setApp?.(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--fg)",
                  fontFamily: "var(--mono)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  fontFamily: "var(--mono)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                API Key
              </label>
              <input
                type="password"
                value={apiKey || ""}
                onChange={(e) => setApiKey?.(e.target.value)}
                placeholder="Set via NEXT_PUBLIC_AOMI_API_KEY or enter here"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--fg)",
                  fontFamily: "var(--mono)",
                }}
              />
            </div>
            <p
              style={{
                fontSize: 11,
                color: "var(--muted)",
                lineHeight: 1.5,
              }}
            >
              Get your API key from{" "}
              <a
                href="https://aomi.dev"
                target="_blank"
                rel="noopener"
                style={{ color: "var(--accent)" }}
              >
                aomi.dev
              </a>{" "}
              after registering your app. The app slug should be{" "}
              <code
                style={{
                  background: "var(--bg)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontFamily: "var(--mono)",
                }}
              >
                gambit
              </code>
              .
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.length === 0 && (
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u26bd"}</div>
              <p className="eyebrow" style={{ marginBottom: 20 }}>
                AI Prediction Markets
              </p>
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: -1,
                  marginBottom: 12,
                }}
              >
                Welcome to{" "}
                <span className="serif-italic" style={{ fontWeight: 400 }}>
                  Gambit
                </span>
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  maxWidth: 400,
                  margin: "0 auto 40px",
                  lineHeight: 1.7,
                }}
              >
                Ask about markets, get odds analysis, or place a bet — all by
                chatting.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="pill-btn"
                    style={{
                      fontSize: 10,
                      padding: "10px 18px",
                      borderColor: "var(--border)",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg: any, i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                className={
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"
                }
                style={{
                  maxWidth: "85%",
                  padding: "14px 18px",
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isStreaming && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                className="chat-bubble-bot"
                style={{ padding: "16px 22px", display: "flex", gap: 6 }}
              >
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
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "12px 16px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleSend())
              }
              placeholder="Ask about markets, odds, or place a bet..."
              disabled={isStreaming}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: "var(--fg)",
                fontFamily: "var(--mono)",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background:
                  input.trim() && !isStreaming
                    ? "var(--accent)"
                    : "var(--muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: input.trim() && !isStreaming ? 1 : 0.4,
                transition: "all 0.2s",
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#fff"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: 10,
              color: "var(--muted)",
              marginTop: 8,
              fontFamily: "var(--mono)",
              letterSpacing: "0.05em",
            }}
          >
            Powered by Aomi + Limitless on Base
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Page — wraps with AomiRuntimeProvider
// =============================================================================

export default function ChatPage() {
  const backendUrl =
    process.env.NEXT_PUBLIC_AOMI_BACKEND_URL || "https://api.aomi.dev";

  return (
    <AomiRuntimeProvider backendUrl={backendUrl}>
      <ChatInterface />
    </AomiRuntimeProvider>
  );
}
