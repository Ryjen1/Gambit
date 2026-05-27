const messages = [
  { role: "user" as const, text: "What football matches can I bet on right now?" },
  {
    role: "assistant" as const, text: "Here are the upcoming FIFA World Cup 2026 matches on Limitless:",
    table: [
      { match: "Mexico vs South Africa", yes: "67%", no: "14%" },
      { match: "South Korea vs Czech Republic", yes: "37%", no: "36%" },
      { match: "Canada vs Bosnia & Herzegovina", yes: "54%", no: "23%" },
      { match: "Argentina vs Algeria", yes: "71%", no: "12%" },
    ],
  },
  { role: "user" as const, text: "Bet $10 on Argentina to beat Algeria" },
  {
    role: "assistant" as const,
    receipt: {
      market: "Argentina vs Algeria \u2014 Jun 17",
      side: "BUY YES",
      price: "$0.71",
      shares: "14.08",
      cost: "$10.00 USDC",
      potential: "$14.08 if Argentina wins (+40.8%)",
    },
  },
  { role: "user" as const, text: "Confirm" },
  {
    role: "assistant" as const,
    receipt: {
      status: "\u2705 Order placed",
      market: "Argentina vs Algeria \u2014 YES @ $0.71",
      shares: "14.08",
      cost: "$10.00 USDC",
      payout: "$14.08 (40.8% return)",
    },
  },
];

export function DemoChat() {
  return (
    <section id="demo" style={{
      padding: "96px 24px", borderTop: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 64, maxWidth: 640 }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Live Demo</p>
          <h2 style={{
            fontSize: "clamp(24px, 3.5vw, 48px)", fontWeight: 500,
            letterSpacing: -1, lineHeight: 1.2, marginBottom: 16,
          }}>
            See it in <span style={{ fontStyle: "italic", fontFamily: "Instrument Serif, Georgia, serif" }}>action</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted-foreground)", lineHeight: 1.7 }}>
            A real conversation flow &mdash; from discovering markets to placing a bet on the World Cup.
          </p>
        </div>

        <div className="liquid-glass" style={{ borderRadius: 20, overflow: "hidden" }}>
          {/* Chat header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "16px 24px", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "var(--seal-500)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>L</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Gambit</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--evidence-400)" }} />
                <span style={{ fontSize: 11, color: "var(--evidence-400)" }}>Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ maxHeight: 500, overflow: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"} style={{
                  maxWidth: "85%", padding: "12px 16px", fontSize: 14, lineHeight: 1.6,
                }}>
                  {msg.text && <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>}

                  {msg.table && (
                    <div className="receipt" style={{ marginTop: 12, fontSize: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "4px 16px" }}>
                        <span className="eyebrow" style={{ fontSize: 9, marginBottom: 8 }}>Match</span>
                        <span className="eyebrow" style={{ fontSize: 9, marginBottom: 8, textAlign: "right" }}>YES</span>
                        <span className="eyebrow" style={{ fontSize: 9, marginBottom: 8, textAlign: "right" }}>NO</span>
                        {msg.table.map((row, j) => (
                          <div key={j} style={{ display: "contents" }}>
                            <span style={{ color: "var(--foreground)", fontSize: 12 }}>{row.match}</span>
                            <span style={{ textAlign: "right", fontSize: 12 }}>{row.yes}</span>
                            <span style={{ textAlign: "right", color: "var(--muted-foreground)", fontSize: 12 }}>{row.no}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.receipt && (
                    <div className="receipt" style={{ marginTop: 12, fontSize: 12 }}>
                      {Object.entries(msg.receipt).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                          <span style={{ color: "var(--muted-foreground)" }}>{k}</span>
                          <span style={{
                            color: k === "potential" || k === "payout" || k === "status" ? "var(--evidence-400)" : "var(--foreground)",
                          }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "12px 16px",
            }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)", fontFamily: "JetBrains Mono, monospace" }}>
                Ask about markets, odds, or place a bet...
              </span>
              <div style={{
                marginLeft: "auto", width: 28, height: 28, borderRadius: "50%",
                background: "var(--seal-500)", display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0.6,
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a href="/chat" className="pill-btn pill-btn-primary">
            Try the interactive demo
          </a>
        </div>
      </div>
    </section>
  );
}
