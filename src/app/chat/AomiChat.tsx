"use client";

import { AomiRuntimeProvider, useAomiRuntime, useCurrentThreadMessages } from "@aomi-labs/react";
import { useState, useRef, useEffect, useCallback } from "react";

// =============================================================================
// Mock fallback (only used if Aomi doesn't respond within 5 seconds)
// =============================================================================

interface MockMsg { role: "user" | "assistant"; content: string; table?: { match: string; yes: string; no: string }[]; receipt?: Record<string, string>; }

function mockResponse(input: string): MockMsg {
  const l = input.toLowerCase();
  if (l.includes("football") || l.includes("world cup")) return { role: "assistant", content: "Here are the upcoming FIFA World Cup 2026 matches on Limitless:", table: [
    { match: "Mexico vs South Africa (Jun 11)", yes: "67%", no: "14%" },
    { match: "South Korea vs Czech Republic (Jun 12)", yes: "37%", no: "36%" },
    { match: "Argentina vs Algeria (Jun 17)", yes: "71%", no: "12%" },
    { match: "Germany vs Curacao (Jun 14)", yes: "94%", no: "5%" },
  ]};
  if (l.includes("eth") || l.includes("crypto")) return { role: "assistant", content: "Found a market: \"Will ETH be above $5,000 by EOY 2026\"", receipt: { market: "ETH above $5,000 by EOY", yes: "23%", no: "77%", volume: "$142,850", expires: "Dec 31, 2026", analysis: "94% rally needed. 23% fair for bull cycle." }};
  if (l.includes("bet") || l.includes("buy")) return { role: "assistant", content: "Order preview \u2014 please confirm:", receipt: { market: "Argentina vs Algeria \u2014 Jun 17", side: "BUY YES", price: "$0.71", shares: "14.08", cost: "$10.00 USDC", potential: "$14.08 if Argentina wins (+40.8%)", risk: "Thin liquidity." }};
  if (l.includes("position") || l.includes("portfolio")) return { role: "assistant", content: "Your open positions:", receipt: { "pos 1": "Argentina YES @ $0.71 | 14.08 shares | P&L: +$1.26", "pos 2": "Germany YES @ $0.94 | 21.28 shares | P&L: +$0.85", total: "$32.11 | P&L: +$2.11" }};
  return { role: "assistant", content: "Try:\n\u2022 \"What football matches can I bet on?\"\n\u2022 \"Bet $10 on Argentina\"\n\u2022 \"Show my positions\"\n\u2022 \"Will ETH hit $5K?\"" };
}

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
// Chat — tries Aomi, falls back to mock after 5s
// =============================================================================

function ChatInterface({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  const { isRunning, sendMessage, currentThreadId, createThread } = useAomiRuntime();
  const aomiMessages = useCurrentThreadMessages();
  const [mockMessages, setMockMessages] = useState<MockMsg[]>([]);
  const [useMock, setUseMock] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aomiMessages, mockMessages, isTyping]);

  const sendMock = useCallback((text: string) => {
    setIsTyping(true);
    setMockMessages((p) => [...p, { role: "user", content: text }]);
    setTimeout(() => { setMockMessages((p) => [...p, mockResponse(text)]); setIsTyping(false); inputRef.current?.focus(); }, 600 + Math.random() * 800);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isRunning || isTyping) return;
    setInput("");

    if (useMock) { sendMock(text); return; }

    try {
      if (!currentThreadId) await createThread();
      await sendMessage(text);
      // If no Aomi response in 5s, switch to mock
      const startLen = aomiMessages.length;
      setTimeout(() => {
        if (!useMock && aomiMessages.length <= startLen) {
          console.log("[Gambit] Aomi timeout, switching to mock");
          setUseMock(true);
          sendMock(text);
        }
      }, 5000);
    } catch (e) {
      console.error("[Gambit] Error:", e);
      setUseMock(true);
      sendMock(text);
    }
    inputRef.current?.focus();
  }, [input, isRunning, isTyping, useMock, sendMessage, currentThreadId, createThread, aomiMessages.length, sendMock]);

  const messages = useMock ? mockMessages : aomiMessages;
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
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: useMock ? "var(--gold, #fbbf24)" : "var(--turf)" }} />
              <span style={{ fontSize: 10, color: useMock ? "var(--gold, #fbbf24)" : "var(--turf)", fontFamily: "monospace" }}>
                {useMock ? `Demo \u00b7 ${shortAddr}` : `Live \u00b7 ${shortAddr}`}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onDisconnect} className="font-display" style={{ fontSize: 11, letterSpacing: "0.06em", padding: "8px 16px", border: "1px solid var(--border-default)", background: "rgba(14,20,32,0.5)", borderRadius: 8, color: "var(--text-muted)" }}>DISCONNECT</button>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && (
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

          {messages.map((msg: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"} style={{ maxWidth: "85%", padding: "14px 18px", fontSize: 14, lineHeight: 1.6 }}>
                {msg.content && <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}</p>}
                {msg.table && <div style={{ marginTop: 10, fontSize: 12 }}>{msg.table.map((r: any, j: number) => <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: j < msg.table!.length - 1 ? "1px solid var(--border-subtle)" : "none" }}><span>{r.match}</span><span><span style={{ color: "var(--turf)", marginRight: 8 }}>{r.yes}</span><span style={{ color: "var(--red-alert)" }}>{r.no}</span></span></div>)}</div>}
                {msg.receipt && <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", fontSize: 12 }}>{Object.entries(msg.receipt).map(([k, v]: any) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ color: "var(--text-muted)" }}>{k}</span><span style={{ color: k.includes("p&l") || k.includes("potential") || k === "analysis" || k.includes("risk") ? "var(--turf)" : "var(--text-primary)" }}>{v}</span></div>)}</div>}
              </div>
            </div>
          ))}

          {(isRunning || isTyping) && <div style={{ display: "flex", justifyContent: "flex-start" }}><div className="chat-bubble-bot" style={{ padding: "16px 22px", display: "flex", gap: 6 }}><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", background: "rgba(8,12,16,0.85)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 12, padding: "12px 16px" }}>
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())} placeholder="Ask about markets, odds, or place a bet..." disabled={isRunning || isTyping} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--text-primary)", fontFamily: "monospace" }} />
            <button onClick={handleSend} disabled={!input.trim() || isRunning || isTyping} style={{ width: 30, height: 30, borderRadius: 8, background: input.trim() && !isRunning && !isTyping ? "var(--accent)" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", opacity: input.trim() && !isRunning && !isTyping ? 1 : 0.4, transition: "all 0.2s" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            </button>
          </div>
          <p className="font-display" style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", marginTop: 8, letterSpacing: "0.08em" }}>GAMBIT {"\u00b7"} POWERED BY AOMI SDK {"\u00b7"} LIMITLESS EXCHANGE</p>
        </div>
      </div>
    </div>
  );
}

export default function AomiChat() {
  const { address, connecting, connect, disconnect } = useWallet();
  const backendUrl = process.env.NEXT_PUBLIC_AOMI_BACKEND_URL || "https://api.aomi.dev";
  if (!address) return <WalletGate onConnect={connect} connecting={connecting} />;
  return <AomiRuntimeProvider backendUrl={backendUrl}><ChatInterface address={address} onDisconnect={disconnect} /></AomiRuntimeProvider>;
}
