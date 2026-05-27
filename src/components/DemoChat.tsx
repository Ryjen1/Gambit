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
    role: "assistant" as const, text: "Here\u2019s your order preview:",
    order: {
      market: "Argentina vs Algeria \u2014 Jun 17", side: "BUY YES",
      price: "$0.71", shares: "14.08", total: "$10.00 USDC", potential: "$14.08 if Argentina wins (+40.8%)",
    },
  },
  { role: "user" as const, text: "Confirm" },
  {
    role: "assistant" as const,
    text: "\u2705 Order placed!\n\nArgentina vs Algeria \u2014 YES @ $0.71\nShares: 14.08 | Cost: $10.00 USDC\nPotential payout: $14.08 (40.8% return)\n\nI\u2019ll notify you when the market resolves. Good luck!",
  },
];

export function DemoChat() {
  return (
    <section id="demo" style={{ padding: "128px 24px", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>
            See it in <span className="text-gradient">action</span>
          </h2>
          <p style={{ maxWidth: 640, margin: "0 auto", fontSize: 18, color: "var(--muted)" }}>
            A real conversation flow &mdash; from discovering markets to placing a bet on the World Cup.
          </p>
        </div>

        <div style={{
          borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)", overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "16px 24px", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>L</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Gambit</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--green)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
                Online
              </div>
            </div>
          </div>

          <div style={{ maxHeight: 600, overflow: "auto", padding: 24 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 16,
              }}>
                <div style={{
                  maxWidth: "85%", borderRadius: 16, padding: "12px 16px", fontSize: 14, lineHeight: 1.6,
                  ...(msg.role === "user"
                    ? { background: "var(--accent)", color: "#fff" }
                    : { border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)" }),
                }}>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
                  {msg.table && (
                    <table style={{ width: "100%", marginTop: 12, fontSize: 12, borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                          <th style={{ textAlign: "left", padding: "4px 0", fontWeight: 500 }}>Match</th>
                          <th style={{ textAlign: "right", padding: "4px 0", fontWeight: 500 }}>YES</th>
                          <th style={{ textAlign: "right", padding: "4px 0", fontWeight: 500 }}>NO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {msg.table.map((row, j) => (
                          <tr key={j} style={{ borderBottom: "1px solid rgba(26,26,26,0.5)" }}>
                            <td style={{ padding: "6px 0" }}>{row.match}</td>
                            <td style={{ padding: "6px 0", textAlign: "right", color: "var(--green)" }}>{row.yes}</td>
                            <td style={{ padding: "6px 0", textAlign: "right", color: "var(--red)" }}>{row.no}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {msg.order && (
                    <div style={{
                      marginTop: 12, padding: 12, borderRadius: 8,
                      border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.05)",
                      fontSize: 12,
                    }}>
                      {Object.entries(msg.order).map(([k, v]) => (
                        <div key={k} style={{
                          display: "flex", justifyContent: "space-between", padding: "3px 0",
                        }}>
                          <span style={{ color: "var(--muted)", textTransform: "capitalize" }}>{k}</span>
                          <span style={{
                            fontWeight: 500,
                            color: k === "potential" ? "var(--green)" : k === "side" ? "var(--green)" : "inherit",
                          }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: "16px 24px", borderTop: "1px solid var(--border)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", padding: "12px 16px",
            }}>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>
                Ask about markets, odds, or place a bet...
              </span>
              <div style={{
                marginLeft: "auto", width: 32, height: 32, borderRadius: 8,
                background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="/chat" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            borderRadius: 12, background: "var(--accent)", padding: "14px 28px",
            fontSize: 16, fontWeight: 600, color: "#fff",
            boxShadow: "0 0 30px rgba(99,102,241,0.15)",
          }}>
            Try the Interactive Demo \u2192
          </a>
        </div>
      </div>
    </section>
  );
}
