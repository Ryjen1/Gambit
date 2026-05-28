export function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", padding: "80px 16px 48px",
    }}>
      {/* Gold glow */}
      <div style={{
        position: "absolute", left: "50%", top: "25%", transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          borderRadius: 8, border: "1px solid rgba(255,215,0,0.2)",
          background: "rgba(255,215,0,0.05)", padding: "6px 14px", marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--turf)" }} className="animate-pulse-live" />
          <span className="font-display" style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em" }}>
            LIVE ON BASE &middot; BUILT WITH AOMI SDK
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display" style={{
          fontSize: "clamp(48px, 10vw, 96px)", lineHeight: 0.95, letterSpacing: "0.02em",
          textTransform: "uppercase", marginBottom: 24,
          textShadow: "0 4px 24px rgba(0,0,0,0.6)",
        }}>
          <span style={{ color: "var(--text-primary)" }}>PREDICT FOOTBALL.</span><br />
          <span style={{ color: "var(--gold)" }}>BET SMART.</span>{" "}
          <span style={{ color: "var(--amber)" }}>BY CHAT.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          maxWidth: 560, margin: "0 auto 40px", fontSize: 16, lineHeight: 1.7,
          color: "var(--text-secondary)",
        }}>
          AI-powered prediction markets on Base. Chat to bet on football,
          crypto, and politics &mdash; no crypto expertise required.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/chat" className="font-display" style={{
            fontSize: 14, letterSpacing: "0.08em", padding: "14px 32px",
            background: "var(--gold)", color: "#000", borderRadius: 8,
            boxShadow: "0 20px 60px -28px rgba(255, 215, 0, 0.32)",
          }}>
            ENTER APP
          </a>
          <a href="#how-it-works" className="font-display" style={{
            fontSize: 14, letterSpacing: "0.08em", padding: "14px 32px",
            border: "1px solid var(--border-default)", background: "rgba(14,20,32,0.5)",
            borderRadius: 8, backdropFilter: "blur(8px)", color: "var(--text-primary)",
          }}>
            HOW IT WORKS
          </a>
        </div>

        {/* Stats */}
        <div style={{
          maxWidth: 500, margin: "64px auto 0", display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
        }}>
          {[
            { value: "200+", label: "ACTIVE MARKETS" },
            { value: "6", label: "AI TOOLS" },
            { value: "$0", label: "GAS FEES" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div className="font-display" style={{ fontSize: 40, color: "var(--gold)", textShadow: "0 2px 12px rgba(255,215,0,0.2)" }}>{s.value}</div>
              <div className="font-display" style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
