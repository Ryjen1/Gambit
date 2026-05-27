export function Footer() {
  return (
    <footer style={{ padding: "64px 24px", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 32,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>L</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>
              Limitless<span style={{ color: "var(--accent-light)" }}>Bot</span>
            </span>
          </div>

          <div style={{ display: "flex", gap: 24, fontSize: 14, color: "var(--muted)" }}>
            <a href="https://limitless.exchange" target="_blank" rel="noopener" style={{ color: "var(--muted)" }}>Limitless Exchange</a>
            <a href="https://aomi.dev" target="_blank" rel="noopener" style={{ color: "var(--muted)" }}>Aomi</a>
            <a href="https://base.org" target="_blank" rel="noopener" style={{ color: "var(--muted)" }}>Base</a>
            <a href="/chat" style={{ color: "var(--muted)" }}>Launch App</a>
          </div>

          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Built for OpenPandora Early Forge &middot; May 2026
          </div>
        </div>

        <div style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "rgba(161,161,170,0.6)" }}>
          Prediction markets involve risk. Never bet more than you can afford to lose.
          Gambit is an AI assistant &mdash; not financial advice.
        </div>
      </div>
    </footer>
  );
}
