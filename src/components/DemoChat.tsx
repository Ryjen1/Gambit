const messages = [
  { role: "user" as const, text: "What football matches can I bet on right now?" },
  {
    role: "assistant" as const, text: "Here are the upcoming FIFA World Cup 2026 matches:",
    table: [
      { match: "Mexico vs South Africa", yes: "67%", no: "14%" },
      { match: "South Korea vs Czech Republic", yes: "37%", no: "36%" },
      { match: "Canada vs Bosnia & Herzegovina", yes: "54%", no: "23%" },
      { match: "Argentina vs Algeria", yes: "71%", no: "12%" },
    ],
  },
  { role: "user" as const, text: "Bet $10 on Argentina to beat Algeria" },
  {
    role: "assistant" as const, text: "Order preview:",
    order: {
      market: "Argentina vs Algeria \u2014 Jun 17", side: "BUY YES",
      price: "$0.71", shares: "14.08", cost: "$10.00 USDC", potential: "$14.08 if Argentina wins (+40.8%)",
    },
  },
  { role: "user" as const, text: "Confirm" },
  {
    role: "assistant" as const,
    text: "\u2705 Order placed!\n\nArgentina vs Algeria \u2014 YES @ $0.71\nShares: 14.08 | Cost: $10.00 USDC\nPotential payout: $14.08 (40.8% return)\n\nI\u2019ll notify you when the market resolves.",
  },
];

export function DemoChat() {
  return (
    <section id="demo" style={{ padding: "80px 16px", borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2 className="font-display" style={{ fontSize: 20, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", marginBottom: 48 }}>
          SEE IT IN ACTION
        </h2>

        <div className="glass-card" style={{ overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "14px 20px",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="font-display" style={{ fontSize: 14, color: "#000" }}>G</span>
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 14, letterSpacing: "0.04em" }}>GAMBIT</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--turf)" }} className="animate-pulse-live" />
                <span style={{ fontSize: 10, color: "var(--turf)" }}>Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ maxHeight: 450, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"} style={{
                  maxWidth: "85%", padding: "12px 16px", fontSize: 13, lineHeight: 1.6,
                }}>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
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
                  {msg.order && (
                    <div style={{
                      marginTop: 10, padding: 12, borderRadius: 10,
                      background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)",
                      fontSize: 12,
                    }}>
                      {Object.entries(msg.order).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                          <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{k}</span>
                          <span style={{
                            color: k === "potential" ? "var(--turf)" : k === "side" ? "var(--accent)" : "var(--text-primary)",
                          }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--bg-base)", border: "1px solid var(--border-default)",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)", flex: 1 }}>
                Ask about markets, odds, or place a bet...
              </span>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6,
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#000" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="/chat" className="font-display" style={{
            fontSize: 14, letterSpacing: "0.08em", padding: "12px 28px",
            background: "var(--accent)", color: "#000", borderRadius: 8, display: "inline-block",
          }}>
            TRY THE INTERACTIVE DEMO
          </a>
        </div>
      </div>
    </section>
  );
}
