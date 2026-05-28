const steps = [
  { num: "01", title: "CONNECT WALLET", desc: "Link your wallet on Base. Aomi handles the connection \u2014 your keys never leave your device." },
  { num: "02", title: "ASK IN PLAIN ENGLISH", desc: "\"What football matches can I bet on?\" or \"Bet $10 on Argentina\" \u2014 the AI understands intent." },
  { num: "03", title: "REVIEW & CONFIRM", desc: "The AI shows a preview: market, odds, cost, potential payout. One click to confirm." },
  { num: "04", title: "TRACK POSITIONS", desc: "\"Show my bets\" \u2014 see all open positions, unrealized P&L, and upcoming resolutions." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "80px 16px", borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <h2 className="font-display" style={{ fontSize: 20, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", marginBottom: 48 }}>
          FROM CHAT TO BET IN 4 STEPS
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {steps.map((s) => (
            <div key={s.num} className="glass-card" style={{
              padding: "24px 28px", display: "grid", gridTemplateColumns: "60px 1fr", gap: 20, alignItems: "start",
            }}>
              <span className="font-display" style={{ fontSize: 32, color: "var(--accent)", textShadow: "0 2px 12px rgba(59,130,246,0.15)" }}>{s.num}</span>
              <div>
                <h3 className="font-display" style={{ fontSize: 15, letterSpacing: "0.08em", marginBottom: 6, color: "var(--text-primary)" }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
