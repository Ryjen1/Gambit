export function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", paddingTop: 80,
    }}>
      <div style={{
        position: "absolute", left: "50%", top: "33%", transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "var(--accent)", opacity: 0.07, filter: "blur(120px)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          borderRadius: 999, border: "1px solid var(--border)", background: "var(--card)",
          padding: "8px 16px", marginBottom: 32,
        }}>
          <span style={{
            position: "relative", display: "inline-flex", width: 8, height: 8,
          }}>
            <span style={{
              position: "absolute", inset: 0, borderRadius: "50%", background: "var(--green)",
              animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite", opacity: 0.75,
            }} />
            <span style={{
              position: "relative", display: "inline-flex", width: 8, height: 8,
              borderRadius: "50%", background: "var(--green)",
            }} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>
            Live on Base &middot; Powered by Aomi + Limitless
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 900, lineHeight: 1.1,
          letterSpacing: -2, marginBottom: 24,
        }}>
          Bet on anything.<br />
          <span className="text-gradient">Just ask.</span>
        </h1>

        <p style={{
          maxWidth: 640, margin: "0 auto 40px", fontSize: "clamp(16px, 2vw, 20px)",
          color: "var(--muted)", lineHeight: 1.6,
        }}>
          The first AI prediction market assistant on Base. Chat to discover
          markets, analyze odds, and place bets on Limitless &mdash; no crypto
          expertise required.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/chat" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            borderRadius: 12, background: "var(--accent)", padding: "16px 32px",
            fontSize: 18, fontWeight: 600, color: "#fff",
            boxShadow: "0 0 40px rgba(99,102,241,0.15)",
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start Chatting
          </a>
          <a href="#how-it-works" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)",
            padding: "16px 32px", fontSize: 18, fontWeight: 600, color: "#fff",
          }}>
            How It Works
          </a>
        </div>

        <div style={{
          maxWidth: 720, margin: "64px auto 0", display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", gap: 32,
        }}>
          {[
            { value: "200+", label: "Active Markets" },
            { value: "5", label: "Categories" },
            { value: "$0", label: "Gas Fees (Base)" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 32, fontWeight: 700 }} className={s.value === "5" ? "text-gradient" : "text-gradient-gold"}>
                {s.value}
              </div>
              <div style={{ marginTop: 4, fontSize: 14, color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
