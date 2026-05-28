export function Footer() {
  return (
    <footer style={{ padding: "48px 16px", borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto", textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: 18, letterSpacing: "0.04em", marginBottom: 16 }}>
          <span style={{ color: "var(--accent)" }}>GAM</span>
          <span style={{ color: "var(--accent-light)" }}>BIT</span>
        </div>

        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 20 }}>
          <a href="https://limitless.exchange" target="_blank" rel="noopener" style={{ fontSize: 12, color: "var(--text-muted)" }}>Limitless Exchange</a>
          <a href="https://aomi.dev" target="_blank" rel="noopener" style={{ fontSize: 12, color: "var(--text-muted)" }}>Aomi</a>
          <a href="https://base.org" target="_blank" rel="noopener" style={{ fontSize: 12, color: "var(--text-muted)" }}>Base</a>
          <a href="/chat" style={{ fontSize: 12, color: "var(--text-muted)" }}>Launch App</a>
        </div>

        <div className="font-display" style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>
          BUILT FOR OPENPANDORA EARLY FORGE &middot; MAY 2026
        </div>

        <div style={{ fontSize: 11, color: "rgba(168,175,188,0.5)" }}>
          Prediction markets involve risk. Not financial advice.
        </div>
      </div>
    </footer>
  );
}
