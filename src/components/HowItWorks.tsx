const steps = [
  { num: "01", title: "Connect Wallet", desc: "Link your wallet on Base. Aomi handles the connection \u2014 your keys never leave your device." },
  { num: "02", title: "Ask in Plain English", desc: "\"What football matches can I bet on?\" or \"Bet $10 on Argentina\" \u2014 the AI understands intent." },
  { num: "03", title: "Review & Confirm", desc: "The AI shows a preview: market, odds, cost, potential payout. One click to confirm." },
  { num: "04", title: "Track Positions", desc: "\"Show my bets\" \u2014 see all open positions, unrealized P&L, and upcoming resolutions." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "96px 24px", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div style={{ marginBottom: 64, maxWidth: 640 }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Workflow</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 48px)", fontWeight: 600, letterSpacing: -1, lineHeight: 1.2 }}>
            From chat to <span className="serif-italic" style={{ fontWeight: 400 }}>bet</span> in 4 steps
          </h2>
        </div>

        <div style={{ display: "grid", gap: 1, background: "var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {steps.map((s) => (
            <div key={s.num} style={{
              background: "var(--bg)", padding: "32px 32px 32px 32px",
              display: "grid", gridTemplateColumns: "80px 1fr", gap: 24, alignItems: "start",
            }}>
              <span className="eyebrow" style={{ color: "var(--accent)", paddingTop: 4 }}>{s.num}</span>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
