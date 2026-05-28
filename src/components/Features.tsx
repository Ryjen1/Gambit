const features = [
  { color: "var(--accent)", label: "FOOTBALL", desc: "Bet on FIFA World Cup 2026, EPL, Champions League. Just say \"Bet $20 on Argentina to win\"." },
  { color: "var(--accent-light)", label: "CRYPTO", desc: "Will ETH hit $5K? Will BTC break $150K? Trade crypto price predictions with AI analysis." },
  { color: "var(--turf)", label: "AI ANALYSIS", desc: "Compares bookmaker odds vs on-chain prices. Calculates edge and flags value bets automatically." },
  { color: "var(--accent)", label: "NATURAL LANGUAGE", desc: "No orderbooks, no slippage settings, no wallet popups. Just chat like you're texting a friend." },
  { color: "var(--accent-light)", label: "NON-CUSTODIAL", desc: "Your wallet, your funds. Every transaction is simulated before you sign. Nothing happens without approval." },
  { color: "var(--turf)", label: "MULTI-SOURCE", desc: "Combines real-world bookmaker odds with on-chain Limitless markets. No other bot does this." },
];

export function Features() {
  return (
    <section id="features" style={{ padding: "80px 16px", borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="font-display" style={{ fontSize: 20, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            WHY GAMBIT
          </h2>
          <p style={{ maxWidth: 480, margin: "0 auto", fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Not just another betting bot. Multi-source intelligence that finds
            value bets other tools miss.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {features.map((f) => (
            <div key={f.label} className="glass-card" style={{ padding: 24 }}>
              <div className="font-display" style={{ fontSize: 13, letterSpacing: "0.08em", color: f.color, marginBottom: 10 }}>
                {f.label}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
