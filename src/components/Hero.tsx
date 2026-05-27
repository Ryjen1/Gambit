export function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", paddingTop: 80,
    }}>
      {/* Purple ambient glow */}
      <div style={{
        position: "absolute", left: "50%", top: "35%", transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />
      {/* Orbiting ring */}
      <div style={{
        position: "absolute", left: "50%", top: "35%", transform: "translate(-50%, -50%)",
        width: 450, height: 450, borderRadius: "50%",
        border: "1px solid rgba(99,102,241,0.06)", pointerEvents: "none",
        animation: "ambientSpin 24s linear infinite",
      }}>
        <div style={{
          position: "absolute", top: -3, left: "50%", width: 6, height: 6,
          borderRadius: "50%", background: "var(--accent)", opacity: 0.5,
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 800, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          borderRadius: 999, border: "1px solid var(--border)", background: "var(--card)",
          padding: "8px 16px", marginBottom: 32,
        }}>
          <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
            <span style={{
              position: "absolute", inset: 0, borderRadius: "50%", background: "var(--green)",
              animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite", opacity: 0.75,
            }} />
            <span style={{
              position: "relative", display: "inline-flex", width: 8, height: 8,
              borderRadius: "50%", background: "var(--green)",
            }} />
          </span>
          <span style={{ fontSize: 11, fontFamily: "var(--mono)", letterSpacing: "0.1em", color: "var(--muted)" }}>
            Live on Base
          </span>
        </div>

        {/* Headline with serif italic */}
        <h1 style={{
          fontSize: "clamp(40px, 7vw, 76px)", fontWeight: 700, lineHeight: 1.05,
          letterSpacing: -2, marginBottom: 24,
        }}>
          Bet on anything,<br />
          without the{" "}
          <span className="serif-italic" style={{ fontWeight: 400 }}>complexity.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          maxWidth: 520, margin: "0 auto 40px", fontSize: "clamp(15px, 1.8vw, 18px)",
          color: "var(--muted)", lineHeight: 1.7,
        }}>
          Chat to bet on the World Cup, crypto prices, and more on Limitless. No orderbooks. No wallet popups.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/chat" className="pill-btn pill-btn-primary">Start chatting</a>
          <a href="#how-it-works" className="pill-btn pill-btn-ghost">How it works</a>
        </div>

        {/* Stats */}
        <div style={{
          maxWidth: 600, margin: "72px auto 0", display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", gap: 32, textAlign: "center",
        }}>
          <div>
            <div className="text-gradient-gold" style={{ fontSize: 36, fontWeight: 800 }}>200+</div>
            <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>Markets</div>
          </div>
          <div>
            <div className="text-gradient" style={{ fontSize: 36, fontWeight: 800 }}>5</div>
            <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>Categories</div>
          </div>
          <div>
            <div className="text-gradient-gold" style={{ fontSize: 36, fontWeight: 800 }}>$0</div>
            <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>Gas Fees</div>
          </div>
        </div>
      </div>
    </section>
  );
}
