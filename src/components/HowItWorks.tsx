const steps = [
  { step: "01", title: "Connect Wallet", desc: "Link your wallet on Base. Aomi handles the connection \u2014 your keys never leave your device." },
  { step: "02", title: "Ask in Plain English", desc: "\"What football matches can I bet on?\" or \"Bet $10 on Argentina\" \u2014 the AI understands intent." },
  { step: "03", title: "Review & Confirm", desc: "The AI shows a preview: market, odds, cost, potential payout. One click to confirm." },
  { step: "04", title: "Track Positions", desc: "\"Show my bets\" \u2014 see all open positions, unrealized P&L, and upcoming resolutions." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{
      padding: "128px 24px", borderTop: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>
            From chat to <span className="text-gradient-gold">bet</span> in 4 steps
          </h2>
          <p style={{ maxWidth: 640, margin: "0 auto", fontSize: 18, color: "var(--muted)" }}>
            No seed phrases. No gas estimates. No orderbook screens. Just a conversation.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 48, position: "relative",
        }}>
          {steps.map((s) => (
            <div key={s.step} style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, margin: "0 auto 24px",
                border: "1px solid var(--accent)", background: "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, color: "var(--accent-light)",
              }}>
                {s.step}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: 2, color: "var(--accent)", marginBottom: 8,
              }}>
                Step {s.step}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
