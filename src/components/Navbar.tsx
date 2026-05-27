export function Navbar() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      borderBottom: "1px solid var(--border)",
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(20px)",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>L</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>
            Limitless<span style={{ color: "var(--accent-light)" }}>Bot</span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#features" style={{ fontSize: 14, color: "var(--muted)", transition: "color 0.2s" }}>Features</a>
          <a href="#how-it-works" style={{ fontSize: 14, color: "var(--muted)" }}>How It Works</a>
          <a href="#demo" style={{ fontSize: 14, color: "var(--muted)" }}>Demo</a>
          <a href="/chat" style={{
            borderRadius: 8, background: "var(--accent)", padding: "8px 20px",
            fontSize: 14, fontWeight: 600, color: "#fff",
          }}>
            Launch App
          </a>
        </div>
      </div>
    </nav>
  );
}
