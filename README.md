# Gambit

**Custom Aomi SDK plugin that combines bookmaker odds with Limitless Exchange data to help football fans find value bets through natural language.**

Built for [OpenPandora Early Forge](https://t.me/openpandora) using [Aomi SDK](https://github.com/aomi-labs/aomi-sdk).

## What is Gambit?

Gambit is a custom Rust plugin for the Aomi runtime that helps football fans analyze and bet on prediction markets through natural language. It's a **multi-source analysis engine** — it pulls real-world bookmaker odds from The Odds API, compares them with Limitless Exchange market prices, and calculates where the market is mispriced.

**Persona**: A football fan watching the World Cup who wants to bet on matches but finds crypto prediction markets intimidating.

## How It Works

Gambit is an **Aomi plugin** — a Rust crate that compiles to a `.so` library the Aomi runtime loads at startup. The Aomi runtime (hosted by Aomi) handles:
- LLM orchestration (Claude Sonnet)
- Wallet connection and transaction signing (via Para + wagmi)
- On-chain simulation (Anvil fork)
- Session management

Gambit's plugin handles:
- Calling the Limitless Exchange HTTP API for market data
- Calling The Odds API for real-world bookmaker odds
- Custom analysis logic (edge calculation, value bet detection)
- Safety checks (amount limits, liquidity warnings)
- Plain-English output formatting

**We don't deploy contracts on Base.** The Limitless Exchange contracts are deployed by the Limitless team on Base. Our plugin calls their HTTP API. When a user places a real bet, the Aomi runtime handles the on-chain transaction through its wallet integration.

## Architecture

```
┌──────────────────────────────────────────┐
│   Frontend (Next.js 15)                  │
│   Landing page · Chat UI                 │
└─────────────────┬────────────────────────┘
                  │
┌─────────────────▼────────────────────────┐
│   Aomi Runtime (hosted by Aomi)          │
│   LLM · Wallet · Simulation · Sessions   │
└─────────────────┬────────────────────────┘
                  │
┌─────────────────▼────────────────────────┐
│   Gambit Plugin (Rust, aomi-sdk)         │  ← OUR CODE
│                                          │
│   6 tools:                               │
│   ├─ gambit_find_football_markets        │
│   ├─ gambit_analyze_value_bet            │
│   ├─ gambit_place_bet_simplified         │
│   ├─ gambit_get_my_bets_summary          │
│   ├─ gambit_get_upcoming_big_matches     │
│   └─ gambit_market_pulse                 │
│                                          │
│   HTTP calls to:                         │
│   ├─ api.limitless.exchange (market data)│
│   └─ api.the-odds-api.com (bookmaker)    │
└──────────────────────────────────────────┘
```

## How Gambit Uses Aomi SDK

Gambit is a **custom Rust plugin** built with `aomi-sdk`. It's not a wrapper around the existing `limitless` plugin — it's original code that adds multi-source intelligence.

### Plugin structure (4 files, ~500 lines of Rust)

**`src/lib.rs`** — App manifest + preamble. Registers 6 tools with `dyn_aomi_app!` macro. Defines secrets (`ODDS_API_KEY`, `LIMITLESS_API_KEY`, `LIMITLESS_API_SECRET`). Namespaces: `["evm-core"]` for wallet execution.

```rust
dyn_aomi_app!(
    app = tool::GambitApp,
    name = "gambit",
    version = "0.1.0",
    preamble = PREAMBLE,
    tools = [
        tool::FindFootballMarkets,
        tool::AnalyzeValueBet,
        tool::PlaceBetSimplified,
        tool::GetMyBetsSummary,
        tool::GetUpcomingBigMatches,
        tool::MarketPulse,
    ],
    secrets = [SECRET_ODDS_API_KEY, SECRET_LIMITLESS_KEY, SECRET_LIMITLESS_SECRET],
    namespaces = ["evm-core"]
);
```

**`src/auth.rs`** — HMAC-SHA256 signing for Limitless's `lmts-*` headers. Uses `aomi_ext::hmac_auth` primitives with Limitless's specific prehash format.

```rust
pub fn sign(secret_b64: &str, timestamp: &str, method: &str, path: &str, body: &str)
    -> Result<String, String>
{
    let key = base64_decode(secret_b64)?;
    let prehash = format!("{timestamp}\n{method}\n{path}\n{body}");
    Ok(hmac_sha256_base64(&key, prehash.as_bytes()))
}
```

**`src/client.rs`** — Dual HTTP clients:
- `limitless_public()` — public Limitless API (no auth)
- `limitless_signed()` — HMAC-signed Limitless API (positions, orders)
- `odds_api()` — The Odds API (bookmaker odds)
- Utility functions: `decimal_to_prob()`, `edge()`, `pct()`, `yes_price()`, `no_price()`

**`src/tool.rs`** — 6 high-level tools. Each tool:
1. Calls multiple APIs internally (Limitless + Odds API)
2. Adds persona logic (football context, plain English formatting)
3. Includes safety checks (amount limits, liquidity warnings)
4. Returns rich structured JSON for the LLM to present

### Key difference from the existing `limitless` plugin

| | `limitless` plugin | `gambit` plugin |
|---|---|---|
| **Data sources** | Limitless API only | Limitless + The Odds API |
| **Tools** | 9 raw API wrappers | 6 high-level persona tools |
| **Analysis** | None (passthrough) | Edge calculation, value bet detection |
| **Safety** | Basic | Amount limits, liquidity checks, preview-before-sign |
| **Output** | Raw API JSON | Structured data with plain-English summaries |
| **Auth** | HMAC for Limitless | HMAC for Limitless + API key for Odds API |

## The 6 Tools

### 1. `gambit_find_football_markets(query)`
Search Limitless for football markets. Returns simplified results with YES/NO prices, volume, and expiration.

### 2. `gambit_analyze_value_bet(slug)`
**Core intelligence tool.** Fetches Limitless market data + bookmaker odds, calculates edge (mispricing), recommends BUY YES/NO. Returns structured analysis with risk assessment.

### 3. `gambit_place_bet_simplified(amount, slug, outcome)`
Full bet flow: fetches market → checks orderbook liquidity → builds preview with cost/payout/risk → returns preview for confirmation. **Does NOT execute** — safety-first design. Enforces $1-$10,000 limits in Rust.

### 4. `gambit_get_my_bets_summary()`
Fetches open positions via HMAC-signed endpoint, formats as plain English: "You have 3 open bets. Invested: $45. Value: $52. P&L: +$7."

### 5. `gambit_get_upcoming_big_matches()`
**Multi-source tool.** Fetches today's football matches from The Odds API, cross-references with Limitless markets, shows which matches have prediction markets + odds comparison + edge calculation.

### 6. `gambit_market_pulse(category)`
Aggregate volume, sentiment, top markets for a category (football/crypto/politics).

## Safety (Enforced in Rust)

- **Max bet**: $10,000 USDC (hard limit in tool code)
- **Min bet**: $1 USDC
- **Liquidity check**: warns if orderbook depth < 2x bet size
- **Preview-first**: `gambit_place_bet_simplified` returns a preview, never executes directly
- **Auth validation**: checks API key presence before signed calls

## Quick Start

```bash
# Clone
git clone https://github.com/Ryjen1/Gambit.git
cd Gambit

# Frontend
npm install
npm run dev
# http://localhost:3456

# Plugin (requires Rust toolchain)
cd plugin
cargo check
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ODDS_API_KEY` | For bookmaker odds | Free at the-odds-api.com |
| `LIMITLESS_API_KEY` | For positions/orders | From limitless.exchange settings |
| `LIMITLESS_API_SECRET` | For positions/orders | HMAC secret from limitless.exchange |

## Tech Stack

| Layer | Technology |
|---|---|
| Plugin | Rust, aomi-sdk, aomi-ext (HMAC), reqwest, serde_json |
| Frontend | Next.js 15, React 19, TypeScript |
| AI Runtime | Aomi (hosted) — Claude Sonnet |
| Data Sources | Limitless Exchange API + The Odds API |

## Submission

- **GitHub**: [github.com/Ryjen1/Gambit](https://github.com/Ryjen1/Gambit)
- **Plugin**: `plugin/` — custom Rust plugin built with aomi-sdk
- **Frontend**: root — Next.js landing page + chat UI
- **Preamble**: `plugin/src/lib.rs` — football fan persona + analysis rules

## Built For

OpenPandora Early Forge — May 20-30, 2026

## License

MIT
