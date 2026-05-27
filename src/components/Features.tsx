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
    <section id="features" style={{ padding: "96px 24px", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div style={{ marginBottom: 64, maxWidth: 640 }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Capabilities</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 48px)", fontWeight: 600, letterSpacing: -1, lineHeight: 1.2 }}>
            Everything you need to{" "}
            <span className="serif-italic" style={{ fontWeight: 400 }}>trade predictions</span>
          </h2>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1,
          background: "var(--border)", borderRadius: 16, overflow: "hidden",
        }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: "var(--bg)", padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
