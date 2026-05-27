export function Footer() {
  return (
    <footer style={{
      padding: "64px 24px", borderTop: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center",
          justifyContent: "space-between", gap: 32, marginBottom: 32,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: "var(--seal-500)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>G</span>
            </div>
            <span className="eyebrow">Gambit</span>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            <a href="https://limitless.exchange" target="_blank" rel="noopener" className="pill-btn-ghost" style={{ fontSize: 10 }}>Limitless</a>
            <a href="https://aomi.dev" target="_blank" rel="noopener" className="pill-btn-ghost" style={{ fontSize: 10 }}>Aomi</a>
            <a href="https://base.org" target="_blank" rel="noopener" className="pill-btn-ghost" style={{ fontSize: 10 }}>Base</a>
            <a href="/chat" className="pill-btn-ghost" style={{ fontSize: 10 }}>Launch</a>
          </div>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 24, borderTop: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Built for OpenPandora Early Forge &middot; May 2026
          </span>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Prediction markets involve risk. Not financial advice.
          </span>
        </div>
      </div>
    </footer>
  );
}
