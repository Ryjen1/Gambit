"use client";

import { AomiClient, Session } from "@aomi-labs/client";
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
        <button onClick={onConnect} disabled={connecting} className="font-display" style={{ fontSize: 14, letterSpacing: "0.08em", padding: "16px 40px", background: "var(--accent)", borderRadius: 10, color: "#fff", boxShadow: "0 20px 60px -28px rgba(59,130,246,0.4)", marginBottom: 24, opacity: connecting ? 0.6 : 1 }}>
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
}

// =============================================================================
// Chat — Direct AomiClient + Session (like FanForge)
// =============================================================================

function ChatInterface({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<Session | null>(null);

  // Create Aomi session on mount
  useEffect(() => {
    const baseUrl = "/aomi"; // proxied through Next.js rewrite
    const apiKey = process.env.NEXT_PUBLIC_AOMI_API_KEY || undefined;
    const sessionId = crypto.randomUUID();

    const userState = {
      connection: { is_connected: true, auth_method: "wagmi" as const, auth_value: address },
      evm: { address, chain_id: 8453 },
    };

    const session = new Session(
      { baseUrl, apiKey },
      { sessionId, app: "default", userState }
    );
    sessionRef.current = session;

    return () => { session.close(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isRunning]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isRunning || !sessionRef.current) return;
    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setIsRunning(true);

    try {
      const prevCount = messages.length;
      const result = await sessionRef.current.send(text);
      const allMsgs = result.messages || [];
      // Only take messages that are new (index >= prevCount)
      const newMsgs = allMsgs.slice(prevCount);
      const agentReply = newMsgs
        .filter((m: any) => m.sender === "agent")
        .map((m: any) => extractText(m.content))
        .filter((t: string) => t.length > 0)
        .pop(); // last agent message
      if (agentReply) {
        setMessages(prev => [...prev, { role: "assistant", content: agentReply }]);
      }
      setIsRunning(false);
    } catch (e: any) {
      console.error("[Gambit] Error:", e);
      setError(e?.message || "Failed to send message.");
      setIsRunning(false);
    }
    inputRef.current?.focus();
  }, [input, isRunning]);

  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const quickPrompts = ["What football matches can I bet on?", "Bet $10 on Argentina to beat Algeria", "Show my positions", "Will ETH hit $5K by year end?"];

  return (
    <div className="noise" style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)", background: "rgba(8,12,16,0.85)", backdropFilter: "blur(16px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="font-display" style={{ fontSize: 15, color: "#fff" }}>G</span>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 15, letterSpacing: "0.04em" }}>GAMBIT</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: error ? "var(--red-alert)" : "var(--turf)" }} />
              <span style={{ fontSize: 10, color: error ? "var(--red-alert)" : "var(--turf)", fontFamily: "monospace" }}>
                {error ? "Error" : "Live"} &middot; {shortAddr}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onDisconnect} className="font-display" style={{ fontSize: 11, letterSpacing: "0.06em", padding: "8px 16px", border: "1px solid var(--border-default)", background: "rgba(14,20,32,0.5)", borderRadius: 8, color: "var(--text-muted)" }}>DISCONNECT</button>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && !error && (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{"\u26bd"}</div>
              <p className="font-display" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 16 }}>AI PREDICTION MARKETS</p>
              <h2 className="font-display" style={{ fontSize: 28, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 10 }}>
                <span style={{ color: "var(--text-primary)" }}>READY TO </span><span style={{ color: "var(--accent)" }}>PREDICT</span>
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, margin: "0 auto 36px", lineHeight: 1.7 }}>Ask about markets, analyze odds, or place a bet.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {quickPrompts.map((q) => <button key={q} onClick={() => setInput(q)} className="font-display" style={{ fontSize: 11, letterSpacing: "0.06em", padding: "10px 18px", border: "1px solid var(--border-default)", background: "rgba(14,20,32,0.5)", borderRadius: 8, color: "var(--text-secondary)", backdropFilter: "blur(8px)" }}>{q}</button>)}
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,61,87,0.08)", border: "1px solid rgba(255,61,87,0.2)", fontSize: 13, color: "var(--red-alert)" }}>
              <p style={{ margin: 0, fontWeight: 600, marginBottom: 4 }}>Connection Error</p>
              <p style={{ margin: 0, opacity: 0.8 }}>{error}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"} style={{ maxWidth: "85%", padding: "14px 18px", fontSize: 14, lineHeight: 1.6 }}>
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
              </div>
            </div>
          ))}

          {isRunning && <div style={{ display: "flex", justifyContent: "flex-start" }}><div className="chat-bubble-bot" style={{ padding: "16px 22px", display: "flex", gap: 6 }}><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", background: "rgba(8,12,16,0.85)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 12, padding: "12px 16px" }}>
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())} placeholder="Ask about markets, odds, or place a bet..." disabled={isRunning} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--text-primary)", fontFamily: "monospace" }} />
            <button onClick={handleSend} disabled={!input.trim() || isRunning} style={{ width: 30, height: 30, borderRadius: 8, background: input.trim() && !isRunning ? "var(--accent)" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", opacity: input.trim() && !isRunning ? 1 : 0.4, transition: "all 0.2s" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
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
