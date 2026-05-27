const features = [
  { icon: "\u26bd", title: "Football Predictions", desc: "Bet on FIFA World Cup 2026, EPL, Champions League. Just say \"Bet $20 on Argentina to win\"." },
  { icon: "\ud83d\udcc8", title: "Crypto Markets", desc: "Will ETH hit $5K? Will BTC break $150K? Trade crypto price predictions with AI-powered odds analysis." },
  { icon: "\ud83c\udfdb\ufe0f", title: "Political Outcomes", desc: "Elections, policy decisions, and governance votes. The AI finds the market, you make the call." },
  { icon: "\ud83e\udd16", title: "AI Odds Analysis", desc: "Get implied probability calculations, value bet detection, and risk assessment before every trade." },
  { icon: "\ud83d\udcac", title: "Natural Language", desc: "No orderbooks, no slippage settings, no wallet popups. Just chat like you're texting a friend." },
  { icon: "\ud83d\udd12", title: "Non-Custodial", desc: "Your wallet, your funds. Aomi simulates every transaction before you sign. Nothing happens without your approval." },
];

export function Features() {
  return (
    <section id="features" style={{ padding: "128px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>
            Everything you need to{" "}
            <span className="text-gradient">trade predictions</span>
          </h2>
          <p style={{ maxWidth: 640, margin: "0 auto", fontSize: 18, color: "var(--muted)" }}>
            From World Cup matches to Bitcoin price targets &mdash; if it has an outcome, you can bet on it.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24,
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)",
              padding: 32, transition: "border-color 0.2s, box-shadow 0.2s",
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
