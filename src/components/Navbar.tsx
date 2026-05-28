export function Navbar() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, padding: "12px 16px",
      background: "rgba(8, 12, 16, 0.85)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div style={{ maxWidth: 1024, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="font-display" style={{ fontSize: 20, letterSpacing: "0.04em", display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ color: "var(--accent)" }}>GAM</span>
            <span style={{ color: "var(--accent-light)" }}>BIT</span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <a href="#features" className="font-display" style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.08em", padding: "8px 12px" }}>FEATURES</a>
          <a href="#how-it-works" className="font-display" style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.08em", padding: "8px 12px" }}>HOW IT WORKS</a>
          <a href="/chat" className="font-display" style={{
            fontSize: 13, letterSpacing: "0.08em", padding: "8px 20px",
            background: "var(--accent)", color: "#000", borderRadius: 8,
            fontWeight: 400,
          }}>
            ENTER APP
          </a>
        </div>
      </div>
    </header>
  );
}
