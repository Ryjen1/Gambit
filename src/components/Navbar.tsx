export function Navbar() {
  return (
    <nav className="liquid-glass" style={{
      position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 50, borderRadius: 9999, padding: "8px 8px 8px 24px",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: "var(--seal-500)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>L</span>
        </div>
        <span className="eyebrow" style={{ letterSpacing: "0.15em" }}>LimitlessBot</span>
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a href="#features" className="pill-btn-ghost" style={{ padding: "8px 12px", fontSize: 10 }}>Features</a>
        <a href="#how-it-works" className="pill-btn-ghost" style={{ padding: "8px 12px", fontSize: 10 }}>How It Works</a>
        <a href="#demo" className="pill-btn-ghost" style={{ padding: "8px 12px", fontSize: 10 }}>Demo</a>
        <a href="/chat" className="pill-btn pill-btn-primary" style={{ padding: "8px 20px", fontSize: 10 }}>
          Launch
        </a>
      </div>
    </nav>
  );
}
