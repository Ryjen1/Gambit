"use client";

import { Session } from "@aomi-labs/client";
import { useState, useRef, useEffect, useCallback } from "react";

// =============================================================================
// Wallet
// =============================================================================

function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const connect = useCallback(async () => {
    if (!(window as any).ethereum) { alert("Install MetaMask or Coinbase Wallet."); return; }
    setConnecting(true);
    try { const a = await (window as any).ethereum.request({ method: "eth_requestAccounts" }); if (a?.[0]) setAddress(a[0]); } catch (e) { console.error(e); }
    setConnecting(false);
  }, []);
  const disconnect = useCallback(() => setAddress(null), []);
  return { address, connecting, connect, disconnect };
}

// =============================================================================
// Wallet Gate
// =============================================================================

function WalletGate({ onConnect, connecting }: { onConnect: () => void; connecting: boolean }) {
  return (
    <div className="noise" style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", color: "var(--text-primary)", padding: 24 }}>
      <div style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%, -50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>{"\u26bd"}</div>
        <h1 className="font-display" style={{ fontSize: 48, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 12, lineHeight: 1 }}>
          <span style={{ color: "var(--text-primary)" }}>GAM</span><span style={{ color: "var(--accent)" }}>BIT</span>
        </h1>
        <p className="font-display" style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 28 }}>AI PREDICTION MARKETS ON LIMITLESS EXCHANGE</p>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 40 }}>Bet on football, crypto, and politics by chatting. Connect your wallet on Base to get started.</p>
        <button onClick={onConnect} disabled={connecting} className="font-display" style={{ fontSize: 14, letterSpacing: "0.08em", padding: "16px 40px", background: "var(--accent)", borderRadius: 10, color: "#fff", boxShadow: "0 20px 60px -28px rgba(59,130,246,0.4)", marginBottom: 24, opacity: connecting ? 0.6 : 1, transition: "all 0.2s" }}>
          {connecting ? "CONNECTING..." : "CONNECT WALLET"}
        </button>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 8 }}>
          <a href="/" className="font-display" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--text-muted)" }}>BACK TO HOME</a>
        </div>
        <p style={{ fontSize: 11, color: "rgba(168,175,188,0.5)", marginTop: 40, lineHeight: 1.5 }}>Supports MetaMask, Coinbase Wallet. Your wallet stays on your device.</p>
      </div>
    </div>
  );
}

// =============================================================================
// Message types
// =============================================================================

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// =============================================================================
// Markdown-lite renderer
// =============================================================================

function renderContent(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: "8px 0", paddingLeft: 20, listStyle: "none" }}>
          {listItems.map((item, j) => (
            <li key={j} style={{ position: "relative", paddingLeft: 16, marginBottom: 4, lineHeight: 1.6, fontSize: 14 }}>
              <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>&#x2022;</span>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    if (line.startsWith("### ")) { flushList(); elements.push(<h3 key={i} style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginTop: 16, marginBottom: 6 }}>{renderInline(line.slice(4))}</h3>); continue; }
    if (line.startsWith("## ")) { flushList(); elements.push(<h2 key={i} style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginTop: 16, marginBottom: 6 }}>{renderInline(line.slice(3))}</h2>); continue; }
    if (line.startsWith("# ")) { flushList(); elements.push(<h1 key={i} style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 16, marginBottom: 6 }}>{renderInline(line.slice(2))}</h1>); continue; }

    // List items
    if (line.match(/^\s*[-*]\s/)) { listItems.push(line.replace(/^\s*[-*]\s/, "")); continue; }

    // Numbered list
    if (line.match(/^\s*\d+\.\s/)) { listItems.push(line.replace(/^\s*\d+\.\s/, "")); continue; }

    // Empty line
    if (!line.trim()) { flushList(); continue; }

    // Regular paragraph
    flushList();
    elements.push(<p key={i} style={{ margin: "4px 0", lineHeight: 1.65, fontSize: 14 }}>{renderInline(line)}</p>);
  }
  flushList();
  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Bold + italic combined
  let result: React.ReactNode[] = [];
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.startsWith("***") && p.endsWith("***")) result.push(<strong key={i}><em>{p.slice(3, -3)}</em></strong>);
    else if (p.startsWith("**") && p.endsWith("**")) result.push(<strong key={i} style={{ color: "var(--text-primary)" }}>{p.slice(2, -2)}</strong>);
    else if (p.startsWith("*") && p.endsWith("*")) result.push(<em key={i} style={{ color: "var(--accent-light)" }}>{p.slice(1, -1)}</em>);
    else if (p.startsWith("`") && p.endsWith("`")) result.push(<code key={i} style={{ background: "rgba(59,130,246,0.1)", padding: "1px 5px", borderRadius: 4, fontSize: 13, fontFamily: "JetBrains Mono, monospace", color: "var(--accent-light)" }}>{p.slice(1, -1)}</code>);
    else result.push(<span key={i}>{p}</span>);
  }
  return <>{result}</>;
}

// =============================================================================
// Chat Interface
// =============================================================================

function ChatInterface({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    const baseUrl = "/aomi";
    const apiKey = process.env.NEXT_PUBLIC_AOMI_API_KEY || undefined;
    const sessionId = crypto.randomUUID();
    const userState = {
      connection: { is_connected: true, auth_method: "wagmi" as const, auth_value: address },
      evm: { address, chain_id: 8453 },
    };
    const session = new Session({ baseUrl, apiKey }, { sessionId, app: "default", userState });
    sessionRef.current = session;
    return () => { session.close(); };
  }, [address]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isRunning]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isRunning || !sessionRef.current) return;
    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", content: text, timestamp: Date.now() }]);
    setIsRunning(true);

    try {
      const prevCount = messages.length;
      const result = await sessionRef.current.send(text);
      const allMsgs = result.messages || [];
      const newMsgs = allMsgs.slice(prevCount);
      const agentReply = newMsgs
        .filter((m: any) => m.sender === "agent")
        .map((m: any) => extractText(m.content))
        .filter((t: string) => t.length > 0)
        .pop();
      if (agentReply) {
        setMessages(prev => [...prev, { role: "assistant", content: agentReply, timestamp: Date.now() }]);
      }
      setIsRunning(false);
    } catch (e: any) {
      console.error("[Gambit] Error:", e);
      setError(e?.message || "Failed to send message.");
      setIsRunning(false);
    }
    inputRef.current?.focus();
  }, [input, isRunning, messages.length]);

  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const quickPrompts = ["What football matches can I bet on?", "Bet $10 on Argentina", "Show my positions", "Will ETH hit $5K?"];

  return (
    <div className="noise chat-root">
      {/* Header */}
      <header className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="chat-logo">
            <span className="font-display" style={{ fontSize: 14, color: "#fff" }}>G</span>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 16, letterSpacing: "0.04em", lineHeight: 1 }}>GAMBIT</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
              <span className={`chat-status-dot ${error ? "error" : "live"}`} />
              <span style={{ fontSize: 11, color: error ? "var(--red-alert)" : "var(--turf)", fontFamily: "JetBrains Mono, monospace" }}>
                {error ? "Error" : "Live"} &middot; {shortAddr}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onDisconnect} className="font-display chat-disconnect-btn">DISCONNECT</button>
      </header>

      {/* Messages */}
      <div className="chat-messages">
        <div className="chat-messages-inner">
          {messages.length === 0 && !error && (
            <div className="chat-empty">
              <div style={{ fontSize: 52, marginBottom: 16 }}>{"\u26bd"}</div>
              <p className="font-display" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 20 }}>AI PREDICTION MARKETS</p>
              <h2 className="font-display" style={{ fontSize: 32, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 12, lineHeight: 1 }}>
                <span style={{ color: "var(--text-primary)" }}>READY TO </span><span style={{ color: "var(--accent)" }}>PREDICT</span>
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, margin: "0 auto 36px", lineHeight: 1.7 }}>Ask about markets, analyze odds, or place a bet.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {quickPrompts.map((q) => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="chat-quick-btn">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="chat-error">
              <p style={{ margin: 0, fontWeight: 600, marginBottom: 4 }}>Connection Error</p>
              <p style={{ margin: 0, opacity: 0.8 }}>{error}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg-row ${msg.role}`}>
              {msg.role === "assistant" && (
                <div className="chat-avatar bot">G</div>
              )}
              <div className={`chat-bubble ${msg.role}`}>
                {msg.role === "assistant" && <div className="chat-sender">Gambit</div>}
                <div className="chat-bubble-content">
                  {msg.role === "assistant" ? renderContent(msg.content) : <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="chat-avatar user">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              )}
            </div>
          ))}

          {isRunning && (
            <div className="chat-msg-row assistant">
              <div className="chat-avatar bot">G</div>
              <div className="chat-bubble assistant chat-typing">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask about markets, odds, or place a bet..."
              disabled={isRunning}
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isRunning}
              className="chat-send-btn"
              style={{ opacity: input.trim() && !isRunning ? 1 : 0.35 }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="font-display" style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", marginTop: 8, letterSpacing: "0.08em" }}>GAMBIT &middot; POWERED BY AOMI SDK &middot; LIMITLESS EXCHANGE</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function extractText(content: unknown): string {
  if (typeof content === "string") {
    try { return extractText(JSON.parse(content)); } catch { return content.trim(); }
  }
  if (Array.isArray(content)) {
    return content.map(p => (typeof p === "object" && p !== null && "text" in p) ? String((p as any).text) : extractText(p)).join("\n").trim();
  }
  if (typeof content === "object" && content !== null) {
    const obj = content as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message.trim();
    if (typeof obj.text === "string") return obj.text.trim();
    if (typeof obj.summary === "string") return obj.summary.trim();
    const { source: _, ...rest } = obj;
    return JSON.stringify(rest, null, 2);
  }
  return String(content);
}

// =============================================================================
// Root
// =============================================================================

export default function AomiChat() {
  const { address, connecting, connect, disconnect } = useWallet();
  if (!address) return <WalletGate onConnect={connect} connecting={connecting} />;
  return <ChatInterface address={address} onDisconnect={disconnect} />;
}
