# CLAUDE.md — Gambit
> Last updated: 2026-05-27

## 1. Project Identity

- **Purpose:** AI-powered prediction market assistant on Base. Users bet on football, crypto, and politics by chatting in plain English.
- **Persona:** A casual football fan watching the FIFA World Cup who wants to bet on matches but finds crypto prediction markets intimidating.
- **Protocol:** Limitless Exchange on Base mainnet (chain ID 8453) — CLOB-style binary outcome markets.
- **Platform:** Aomi — on-chain AI agent runtime with simulation-first execution and non-custodial wallet integration.
- **Hackathon:** OpenPandora Early Forge — May 20–30 deadline.
- **Stage:** Build complete. Polish and deploy phase.

## 2. Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, CSS (no Tailwind — plain CSS for zero build complexity).
- **AI Runtime:** Aomi cloud (hosted). The `limitless` plugin is pre-built in the Aomi SDK with 9 tools.
- **Blockchain:** Base mainnet. Limitless Exchange CLOB. USDC collateral.
- **Wallet:** Para + wagmi (non-custodial). Aomi handles all signing.

## 3. Project Structure

```
gambit/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata, fonts
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles (plain CSS, no Tailwind)
│   │   └── chat/
│   │       └── page.tsx        # Interactive demo chat UI
│   └── components/
│       ├── Navbar.tsx           # Fixed navbar
│       ├── Hero.tsx             # Hero section
│       ├── Features.tsx         # Feature cards
│       ├── HowItWorks.tsx       # 4-step flow
│       ├── DemoChat.tsx         # Demo conversation
│       └── Footer.tsx           # Footer
├── PREAMBLE.md                  # Aomi app system prompt
├── README.md                    # Submission README
├── CLAUDE.md                    # This file
└── .env.example                 # Environment variables
```

## 4. The 9 Aomi Tools (pre-built in SDK)

These tools exist in `aomi-sdk/apps/limitless/`. We do NOT implement them — we configure the Aomi app to use them.

| Tool | Auth | Description |
|------|------|-------------|
| `limitless_search_markets` | Public | Semantic search across markets |
| `limitless_browse_active` | Public | Browse active markets by category |
| `limitless_get_market` | Public | Full detail for one market |
| `limitless_get_orderbook` | Public | L2 orderbook depth |
| `limitless_check_key` | Signed | Verify API key works |
| `limitless_get_my_positions` | Signed | Open positions with P&L |
| `limitless_get_my_trades` | Signed | Trade history |
| `limitless_build_order` | Routed | Build order + EIP-712 wallet signing |
| `limitless_submit_order` | Signed | POST signed order to Limitless |

## 5. Architecture Rules

1. **No custom Rust plugin.** We use the existing `limitless` plugin from the Aomi SDK. Our value-add is the consumer UX, persona, and polish.
2. **System prompt is the product.** The PREAMBLE.md defines the persona, safety rules, formatting, and workflow. This is what makes Gambit feel different from raw Limitless.
3. **Demo-first.** The chat page works without API keys — it uses pre-built responses to demonstrate the UX. The live version connects to Aomi.
4. **No crypto jargon in user-facing strings.** "Bet" not "place order." "Odds" not "implied probability." "Your bets" not "open positions."

## 6. Competitive Advantage (vs FanForge)

| Dimension | FanForge (Zora) | Gambit (Limitless) |
|-----------|-----------------|--------------------------|
| Protocol | Zora creator coins | Limitless prediction markets |
| Persona | Nigerian musician | Football fan (World Cup) |
| Frontend | None (Telegram only) | Polished landing + chat UI |
| Timing | Generic creator economy | FIFA World Cup starts Jun 11 |
| Demo | Requires Zora knowledge | "Bet $10 on Argentina" — instant |
| Status | Phase 1, blocked on env | Build passes, demo works |

## 7. Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_AOMI_APP_SLUG` | yes | Default: `gambit` |
| `NEXT_PUBLIC_AOMI_API_KEY` | yes | From aomi.dev dashboard |
| `NEXT_PUBLIC_AOMI_API_URL` | no | Default: `https://api.aomi.dev` |

## 8. Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run start        # Start production server
```

## 9. Submission Checklist (May 30)

- [x] Project builds and runs
- [x] Landing page with hero, features, how-it-works, demo
- [x] Chat demo page with interactive prompts
- [x] README with architecture, setup, and submission info
- [x] PREAMBLE.md with full system prompt
- [ ] Product Twitter page with logo
- [ ] Demo video on Twitter (90 sec)
- [ ] Deployed to Vercel
- [ ] Aomi app registered with Limitless plugin
- [ ] Submission form filled
