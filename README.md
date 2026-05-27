# Gambit

**AI-powered prediction market assistant on Base. Bet on football, crypto, and politics by chatting.**

Built for [OpenPandora Early Forge](https://t.me/openpandora) using [Aomi](https://aomi.dev) + [Limitless Exchange](https://limitless.exchange) on [Base](https://base.org).

## What is Gambit?

Gambit is a consumer-facing AI chat app that lets anyone trade prediction markets on Limitless Exchange through natural language. No orderbooks, no wallet popups, no crypto expertise required — just chat.

**Persona**: A casual football fan watching the FIFA World Cup who wants to bet on matches but finds crypto prediction markets intimidating.

**Protocol**: Limitless Exchange on Base — CLOB-style binary outcome markets for sports, crypto, politics, and more.

**Platform**: Aomi — on-chain AI agent runtime with simulation-first execution and non-custodial wallet integration.

## Features

- **Natural Language Betting**: "Bet $10 on Argentina to win" → order preview → confirm → done
- **Market Discovery**: "What football matches can I bet on?" → live market list with odds
- **Odds Analysis**: AI calculates implied probability and flags value bets
- **Position Tracking**: "Show my bets" → open positions with unrealized P&L
- **Simulation-First**: Every transaction is simulated on an Anvil fork before you sign
- **Non-Custodial**: Your wallet, your funds. Aomi never holds your keys or USDC.

## Architecture

```
┌─────────────────────────────────────────────┐
│   Frontend (Next.js 15 + Aomi Widget)       │
│   Chat UI · Landing Page · Wallet Connect   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Aomi Runtime (hosted)                │
│   System prompt · Model selection · Tools    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│   Limitless Plugin (existing Aomi SDK)       │
│   9 tools: search, browse, get, orderbook,   │
│   positions, trades, build_order, submit     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│   Limitless Exchange (Base L2)               │
│   CLOB · Conditional Tokens · USDC collateral│
└──────────────────────────────────────────────┘
```

## Aomi Tools Used

The Limitless plugin in the Aomi SDK provides these tools:

| Tool | Auth | Description |
|---|---|---|
| `limitless_search_markets` | Public | Semantic search across markets |
| `limitless_browse_active` | Public | Browse active markets by category |
| `limitless_get_market` | Public | Full detail for one market |
| `limitless_get_orderbook` | Public | L2 orderbook depth |
| `limitless_check_key` | Signed | Verify API key works |
| `limitless_get_my_positions` | Signed | Open positions with P&L |
| `limitless_get_my_trades` | Signed | Trade history |
| `limitless_build_order` | Routed | Build order + EIP-712 wallet signing |
| `limitless_submit_order` | Signed | POST signed order to Limitless |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Ryjen1/Gambit.git
cd Gambit

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# Fill in your Aomi API key

# 4. Run
npm run dev
# Open http://localhost:3000
```

## Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Aomi App
1. Go to [aomi.dev](https://aomi.dev)
2. Create a new app with slug `gambit`
3. Set the preamble from `PREAMBLE.md`
4. Enable the `limitless` plugin
5. Set model to Claude Sonnet
6. Deploy — get your API key

### Telegram Bot
Aomi hosts the Telegram bot. Contact the Aomi team to set up `@GambitBot` on Telegram with the same backend and tools.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| AI Runtime | Aomi (hosted) — Claude Sonnet |
| Plugin | Limitless Exchange SDK (Rust, aomi-sdk) |
| Blockchain | Base (L2), USDC, CLOB Exchange |
| Wallet | Para + wagmi (non-custodial) |

## Submission

- **Twitter**: @GambitAI
- **Demo Video**: [link]
- **Live App**: [link]
- **GitHub**: This repo
- **Docs**: This README + PREAMBLE.md

## Built For

OpenPandora Early Forge — May 20-30, 2026

**Tracks**: Best Overall Project ($300), Runner-Up ($150), Best Video ($50)

## License

MIT
