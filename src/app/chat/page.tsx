"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  table?: { match: string; yes: string; no: string }[];
  receipt?: Record<string, string>;
}

// Only market discovery works without wallet
const DISCOVERY_RESPONSES: Record<string, Message> = {
  "what football matches can i bet on?": {
    role: "assistant",
    content: "Here are the upcoming FIFA World Cup 2026 matches on Limitless:",
    table: [
      { match: "Mexico vs South Africa (Jun 11)", yes: "67%", no: "14%" },
      { match: "South Korea vs Czech Republic (Jun 12)", yes: "37%", no: "36%" },
      { match: "Canada vs Bosnia & Herzegovina (Jun 12)", yes: "54%", no: "23%" },
      { match: "Argentina vs Algeria (Jun 17)", yes: "71%", no: "12%" },
      { match: "Germany vs Curacao (Jun 14)", yes: "94%", no: "5%" },
    ],
  },
  "will eth hit $5k by year end?": {
    role: "assistant",
    content: "Found a market: \"Will ETH be above $5,000 by EOY 2026\"",
    receipt: {
      market: "ETH above $5,000 by EOY",
      yes: "23% ($0.23/share)",
      no: "77% ($0.77/share)",
      volume: "$142,850",
      liquidity: "$38,200",
      expires: "Dec 31, 2026",
      analysis: "94% rally needed. 23% fair for bull cycle.",
    },
  },
};

function getResponse(input: string, walletConnected: boolean): Message {
  const lower = input.toLowerCase().trim();

  // Discovery works without wallet
  if (DISCOVERY_RESPONSES[lower]) return DISCOVERY_RESPONSES[lower];
  if (lower.includes("football") || lower.includes("soccer") || lower.includes("world cup"))
    return DISCOVERY_RESPONSES["what football matches can i bet on?"];
  if (lower.includes("eth") || lower.includes("bitcoin") || lower.includes("crypto"))
    return DISCOVERY_RESPONSES["will eth hit $5k by year end?"];

  // Betting requires wallet
  if (lower.includes("bet") || lower.includes("buy") || lower.includes("wager")) {
    if (!walletConnected) {
      return {
        role: "assistant",
        content: "You need to connect your wallet before placing bets.\n\nTap \"Connect Wallet\" in the top right corner to get started. Your wallet stays on your device \u2014 Gambit never sees your keys.",
      };
    }
    return {
      role: "assistant",
      content: "Order preview \u2014 please confirm:",
      receipt: {
        market: "Argentina vs Algeria \u2014 Jun 17",
        side: "BUY YES",
        price: "$0.71",
        shares: "14.08",
        cost: "$10.00 USDC",
        potential: "$14.08 if Argentina wins (+40.8%)",
        "risk warning": "Thin liquidity \u2014 your order may not fill entirely.",
      },
    };
  }

  // Positions require wallet
  if (lower.includes("position") || lower.includes("portfolio") || lower.includes("bets") || lower.includes("my ")) {
    if (!walletConnected) {
      return {
        role: "assistant",
        content: "You need to connect your wallet to see your positions.\n\nTap \"Connect Wallet\" in the top right corner.",
      };
    }
    return {
      role: "assistant",
      content: "Your open positions on Limitless:",
      receipt: {
        "position 1": "Argentina vs Algeria YES @ $0.71",
        "  14.08 shares": "Cost: $10.00 | P&L: +$1.26",
        "position 2": "Germany vs Curacao YES @ $0.94",
        "  21.28 shares": "Cost: $20.00 | P&L: +$0.85",
        "total invested": "$30.00",
        "total value": "$32.11",
        "total p&l": "+$2.11",
      },
    };
  }

  return {
    role: "assistant",
    content: "Try asking:\n\u2022 \"What football matches can I bet on?\" (no wallet needed)\n\u2022 \"Bet $10 on Argentina to beat Algeria\" (wallet required)\n\u2022 \"Show my positions\" (wallet required)\n\u2022 \"Will ETH hit $5K by year end?\" (no wallet needed)",
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const connectWallet = useCallback(() => {
    // Simulate wallet connection
    setWalletConnected(true);
    setWalletAddress("0x742d...5f8e");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Wallet connected: 0x742d...5f8e\n\nYou're ready to bet. Try \"What football matches can I bet on?\" to see available markets, or \"Bet $10 on Argentina\" to place a bet.",
      },
    ]);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletConnected(false);
    setWalletAddress(null);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Wallet disconnected. You can still browse markets, but you'll need to reconnect to place bets.",
      },
    ]);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setInput("");
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, getResponse(text, walletConnected)]);
        setIsTyping(false);
        inputRef.current?.focus();
      }, 600 + Math.random() * 800);
    },
    [walletConnected]
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;
    sendMessage(text);
  }, [input, isTyping, sendMessage]);

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
                background: walletConnected ? "var(--turf)" : "var(--text-muted)",
              }} />
              <span style={{
                fontSize: 10,
                color: walletConnected ? "var(--turf)" : "var(--text-muted)",
              }}>
                {walletConnected ? `${walletAddress}` : "Not connected"}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {walletConnected ? (
            <button onClick={disconnectWallet} className="font-display" style={{
              fontSize: 11, letterSpacing: "0.06em", padding: "8px 16px",
              border: "1px solid var(--red-alert)", background: "rgba(255,61,87,0.1)",
              borderRadius: 8, color: "var(--red-alert)",
            }}>
              DISCONNECT
            </button>
          ) : (
            <button onClick={connectWallet} className="font-display" style={{
              fontSize: 11, letterSpacing: "0.06em", padding: "8px 16px",
              background: "var(--accent)", borderRadius: 8, color: "#fff",
            }}>
              CONNECT WALLET
            </button>
          )}
          <a href="/" className="font-display" style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--text-muted)", padding: "8px 14px" }}>
            BACK
          </a>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{"\u26bd"}</div>
              <p className="font-display" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 16 }}>AI PREDICTION MARKETS</p>
              <h2 className="font-display" style={{ fontSize: 32, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 10 }}>
                <span style={{ color: "var(--text-primary)" }}>WELCOME TO </span>
                <span style={{ color: "var(--accent)" }}>GAMBIT</span>
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, margin: "0 auto 12px", lineHeight: 1.7 }}>
                Ask about markets, get odds analysis, or place a bet &mdash; all by chatting.
              </p>
              {!walletConnected && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 320, margin: "0 auto 36px", lineHeight: 1.6 }}>
                  Connect your wallet to place bets and view positions. Market discovery works without a wallet.
                </p>
              )}
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

          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"} style={{
                maxWidth: "85%", padding: "14px 18px", fontSize: 14, lineHeight: 1.6,
              }}>
                {msg.content && <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>}

                {msg.table && (
                  <div style={{ marginTop: 10, fontSize: 12 }}>
                    {msg.table.map((row, j) => (
                      <div key={j} style={{
                        display: "flex", justifyContent: "space-between", padding: "4px 0",
                        borderBottom: j < msg.table!.length - 1 ? "1px solid var(--border-subtle)" : "none",
                      }}>
                        <span style={{ color: "var(--text-primary)" }}>{row.match}</span>
                        <span>
                          <span style={{ color: "var(--turf)", marginRight: 8 }}>{row.yes}</span>
                          <span style={{ color: "var(--red-alert)" }}>{row.no}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {msg.receipt && (
                  <div style={{
                    marginTop: 10, padding: 12, borderRadius: 10,
                    background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)",
                    fontSize: 12,
                  }}>
                    {Object.entries(msg.receipt).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                        <span style={{ color: "var(--text-muted)" }}>{k}</span>
                        <span style={{
                          color: k.includes("p&l") || k.includes("potential") || k.includes("payout") || k === "status" || k === "analysis" || k.includes("warning")
                            ? "var(--turf)" : "var(--text-primary)",
                        }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
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
              placeholder="Ask about markets, odds, or place a bet..."
              disabled={isTyping}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontSize: 14, color: "var(--text-primary)", fontFamily: "monospace",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: input.trim() && !isTyping ? "var(--accent)" : "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: input.trim() && !isTyping ? 1 : 0.4, transition: "all 0.2s",
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="font-display" style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", marginTop: 8, letterSpacing: "0.08em" }}>
            GAMBIT \u00b7 DEMO MODE \u00b7 BUILT WITH AOMI SDK
          </p>
        </div>
      </div>
    </div>
  );
}
