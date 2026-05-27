const features = [
  {
    num: "01",
    title: "Football Predictions",
    desc: "Bet on FIFA World Cup 2026, EPL, Champions League. Just say \"Bet $20 on Argentina to win\".",
  },
  {
    num: "02",
    title: "Crypto Markets",
    desc: "Will ETH hit $5K? Will BTC break $150K? Trade crypto price predictions with AI-powered odds analysis.",
  },
  {
    num: "03",
    title: "Political Outcomes",
    desc: "Elections, policy decisions, and governance votes. The AI finds the market, you make the call.",
  },
  {
    num: "04",
    title: "AI Odds Analysis",
    desc: "Get implied probability calculations, value bet detection, and risk assessment before every trade.",
  },
  {
    num: "05",
    title: "Natural Language",
    desc: "No orderbooks, no slippage settings, no wallet popups. Just chat like you're texting a friend.",
  },
  {
    num: "06",
    title: "Non-Custodial",
    desc: "Your wallet, your funds. Aomi simulates every transaction before you sign. Nothing happens without approval.",
  },
];

export function Features() {
  return (
    <section id="features" style={{
      padding: "96px 24px", borderTop: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div style={{ marginBottom: 64, maxWidth: 640 }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Capabilities</p>
          <h2 style={{
            fontSize: "clamp(24px, 3.5vw, 48px)", fontWeight: 500,
            letterSpacing: -1, lineHeight: 1.2, marginBottom: 16,
          }}>
            Everything you need to{" "}
            <span style={{ fontStyle: "italic", fontFamily: "Instrument Serif, Georgia, serif" }}>
              trade predictions
            </span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted-foreground)", lineHeight: 1.7 }}>
            From World Cup matches to Bitcoin price targets &mdash; if it has an
            outcome, you can bet on it through LimitlessBot.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 1,
          background: "var(--border)",
          borderRadius: 16, overflow: "hidden",
        }}>
          {features.map((f) => (
            <div key={f.num} style={{
              background: "var(--background)", padding: 32,
            }}>
              <span className="eyebrow" style={{ display: "block", marginBottom: 16, color: "var(--seal-400)" }}>
                {f.num}
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted-foreground)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
