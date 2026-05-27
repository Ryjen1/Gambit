export function Hero() {
  return (
    <section style={{
      minHeight: "100svh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "96px 24px 64px", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient gradient */}
      <div style={{
        position: "absolute", left: "50%", top: "40%", transform: "translate(-50%, -50%)",
        width: 800, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,141,240,0.08) 0%, rgba(81,104,227,0.04) 40%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      {/* Orbiting ring */}
      <div style={{
        position: "absolute", left: "50%", top: "40%", transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        border: "1px solid rgba(124,141,240,0.06)", pointerEvents: "none",
        animation: "ambientSpin 24s linear infinite",
      }}>
        <div style={{
          position: "absolute", top: -3, left: "50%", width: 6, height: 6,
          borderRadius: "50%", background: "var(--seal-400)", opacity: 0.6,
        }} />
      </div>

      <p className="eyebrow relative z-10" style={{ marginBottom: 32, textAlign: "center" }}>
        AI prediction markets on Base
      </p>

      <h1 className="relative z-10" style={{
        maxWidth: 800, textAlign: "center", fontSize: "clamp(32px, 6vw, 72px)",
        fontWeight: 500, lineHeight: 1.1, letterSpacing: -2, marginBottom: 32,
      }}>
        Bet on anything,<br />
        without the <span style={{ fontStyle: "italic", fontFamily: "Instrument Serif, Georgia, serif" }}>complexity.</span>
      </h1>

      <p className="relative z-10" style={{
        maxWidth: 560, textAlign: "center", fontSize: "clamp(14px, 1.5vw, 18px)",
        color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: 48,
      }}>
        The first AI prediction market assistant on Base. Chat to discover
        markets, analyze odds, and place bets on Limitless &mdash; no crypto
        expertise required.
      </p>

      <div className="relative z-10" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/chat" className="pill-btn pill-btn-primary">
          Start chatting
        </a>
        <a href="#how-it-works" className="pill-btn pill-btn-ghost">
          How it works
        </a>
        <a href="https://limitless.exchange" target="_blank" rel="noopener" className="pill-btn pill-btn-ghost">
          Limitless Exchange ↗
        </a>
      </div>
    </section>
  );
}
