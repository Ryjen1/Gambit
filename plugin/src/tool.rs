use crate::client::{public_get, urlencode};
use aomi_sdk::schemars::JsonSchema;
use aomi_sdk::*;
use serde::Deserialize;
use serde_json::{Value, json};

#[derive(Clone, Default)]
pub(crate) struct GambitApp;

fn ok(value: Value) -> Result<Value, String> {
    Ok(json!({ "source": "gambit", "data": value }))
}

fn rt() -> Result<tokio::runtime::Runtime, String> {
    tokio::runtime::Runtime::new().map_err(|e| format!("[gambit] runtime: {e}"))
}

fn pct(price: f64) -> String {
    format!("{}%", (price * 100.0).round())
}

// ============================================================================
// Tool 1: gambit_search_markets — find markets by topic
// ============================================================================

pub(crate) struct SearchMarkets;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct SearchMarketsArgs {
    /// Free-text query. Examples: "World Cup", "Argentina", "ETH price", "election".
    pub query: String,
    /// Max results (default 10).
    #[serde(default)]
    pub limit: Option<i64>,
}

impl DynAomiTool for SearchMarkets {
    type App = GambitApp;
    type Args = SearchMarketsArgs;
    const NAME: &'static str = "gambit_search_markets";
    const DESCRIPTION: &'static str = "Find prediction markets by topic. Use when the user asks about football matches, crypto prices, elections, or any event they can bet on. Returns market list with titles, YES/NO prices, and slugs. Public — no API key needed.";

    fn run(_app: &GambitApp, args: Self::Args, _ctx: DynToolCallCtx) -> Result<Value, String> {
        let runtime = rt()?;
        runtime.block_on(async move {
            let limit = args.limit.unwrap_or(10);
            let path = format!(
                "/markets/search?query={}&limit={}",
                urlencode(&args.query),
                limit
            );
            let resp = public_get(&path).await?;

            // Simplify the response for consumers
            let markets = if let Some(arr) = resp.as_array() {
                arr.iter()
                    .map(|m| {
                        let title = m.get("title").or_else(|| m.get("question")).and_then(|v| v.as_str()).unwrap_or("Unknown");
                        let slug = m.get("slug").and_then(|v| v.as_str()).unwrap_or("");
                        let yes = m.get("yesPrice").or_else(|| m.get("outcomePrices").and_then(|o| o.get(0))).and_then(|v| v.as_f64()).unwrap_or(0.0);
                        let no = m.get("noPrice").or_else(|| m.get("outcomePrices").and_then(|o| o.get(1))).and_then(|v| v.as_f64()).unwrap_or(0.0);
                        let volume = m.get("volume").or_else(|| m.get("volume24hr")).and_then(|v| v.as_f64()).unwrap_or(0.0);
                        let end = m.get("endDate").and_then(|v| v.as_str()).unwrap_or("");
                        json!({
                            "title": title,
                            "slug": slug,
                            "yes_price": pct(yes),
                            "no_price": pct(no),
                            "volume_usd": volume,
                            "expires": end,
                        })
                    })
                    .collect::<Vec<_>>()
            } else {
                vec![resp.clone()]
            };

            ok(Value::Array(markets))
        })
    }
}

// ============================================================================
// Tool 2: gambit_get_market — get details for one market
// ============================================================================

pub(crate) struct GetMarket;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct GetMarketArgs {
    /// Market slug (e.g. "argentina-vs-algeria-jun-17-2026").
    pub slug: String,
}

impl DynAomiTool for GetMarket {
    type App = GambitApp;
    type Args = GetMarketArgs;
    const NAME: &'static str = "gambit_get_market";
    const DESCRIPTION: &'static str = "Get full details for a specific market — title, description, current prices, volume, and expiration. Use after search to show details for a market the user is interested in. Public — no API key needed.";

    fn run(_app: &GambitApp, args: Self::Args, _ctx: DynToolCallCtx) -> Result<Value, String> {
        let runtime = rt()?;
        runtime.block_on(async move {
            let path = format!("/markets/{}", urlencode(&args.slug));
            let resp = public_get(&path).await?;

            // Extract consumer-friendly fields
            let title = resp.get("title").or_else(|| resp.get("question")).and_then(|v| v.as_str()).unwrap_or("Unknown");
            let desc = resp.get("description").and_then(|v| v.as_str()).unwrap_or("");
            let slug = resp.get("slug").and_then(|v| v.as_str()).unwrap_or("");
            let yes = resp.get("yesPrice").or_else(|| resp.get("outcomePrices").and_then(|o| o.get(0))).and_then(|v| v.as_f64()).unwrap_or(0.0);
            let no = resp.get("noPrice").or_else(|| resp.get("outcomePrices").and_then(|o| o.get(1))).and_then(|v| v.as_f64()).unwrap_or(0.0);
            let volume = resp.get("volume").or_else(|| resp.get("volume24hr")).and_then(|v| v.as_f64()).unwrap_or(0.0);
            let end = resp.get("endDate").and_then(|v| v.as_str()).unwrap_or("");
            let liquidity = resp.get("liquidity").and_then(|v| v.as_f64()).unwrap_or(0.0);

            ok(json!({
                "title": title,
                "description": desc,
                "slug": slug,
                "yes_price": pct(yes),
                "no_price": pct(no),
                "volume_usd": volume,
                "liquidity_usd": liquidity,
                "expires": end,
                "raw": resp,
            }))
        })
    }
}

// ============================================================================
// Tool 3: gambit_get_odds — YES/NO prices with analysis
// ============================================================================

pub(crate) struct GetOdds;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct GetOddsArgs {
    /// Market slug.
    pub slug: String,
}

impl DynAomiTool for GetOdds {
    type App = GambitApp;
    type Args = GetOddsArgs;
    const NAME: &'static str = "gambit_get_odds";
    const DESCRIPTION: &'static str = "Get YES/NO odds for a market with implied probability and a plain-English summary. Use when the user asks 'what are the odds' or 'how likely is this'. Public — no API key needed.";

    fn run(_app: &GambitApp, args: Self::Args, _ctx: DynToolCallCtx) -> Result<Value, String> {
        let runtime = rt()?;
        runtime.block_on(async move {
            let path = format!("/markets/{}", urlencode(&args.slug));
            let resp = public_get(&path).await?;

            let title = resp.get("title").or_else(|| resp.get("question")).and_then(|v| v.as_str()).unwrap_or("Unknown");
            let yes = resp.get("yesPrice").or_else(|| resp.get("outcomePrices").and_then(|o| o.get(0))).and_then(|v| v.as_f64()).unwrap_or(0.0);
            let no = resp.get("noPrice").or_else(|| resp.get("outcomePrices").and_then(|o| o.get(1))).and_then(|v| v.as_f64()).unwrap_or(0.0);
            let volume = resp.get("volume").or_else(|| resp.get("volume24hr")).and_then(|v| v.as_f64()).unwrap_or(0.0);

            let yes_return = if yes > 0.0 { format!("{:.1}%", ((1.0 / yes) - 1.0) * 100.0) } else { "N/A".to_string() };
            let no_return = if no > 0.0 { format!("{:.1}%", ((1.0 / no) - 1.0) * 100.0) } else { "N/A".to_string() };

            ok(json!({
                "market": title,
                "slug": args.slug,
                "yes": {
                    "price": pct(yes),
                    "implied_probability": pct(yes),
                    "potential_return": yes_return,
                },
                "no": {
                    "price": pct(no),
                    "implied_probability": pct(no),
                    "potential_return": no_return,
                },
                "volume_usd": volume,
                "analysis": format!(
                    "The market thinks there's a {} chance of YES. A $10 YES bet would pay ${:.2} if correct ({} return). A $10 NO bet would pay ${:.2} if correct ({} return).",
                    pct(yes),
                    10.0 / yes,
                    yes_return,
                    10.0 / no,
                    no_return,
                ),
            }))
        })
    }
}

// ============================================================================
// Tool 4: gambit_preview_bet — show bet preview before confirming
// ============================================================================

pub(crate) struct PreviewBet;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct PreviewBetArgs {
    /// Market slug.
    pub slug: String,
    /// "YES" or "NO".
    pub outcome: String,
    /// Amount in USDC the user wants to bet.
    pub amount_usd: f64,
}

impl DynAomiTool for PreviewBet {
    type App = GambitApp;
    type Args = PreviewBetArgs;
    const NAME: &'static str = "gambit_preview_bet";
    const DESCRIPTION: &'static str = "Show a bet preview before the user commits — market, side, cost, shares, potential payout, and risk. ALWAYS call this before any real bet. Use when the user says 'bet $X on Y'. Public — no API key needed.";

    fn run(_app: &GambitApp, args: Self::Args, _ctx: DynToolCallCtx) -> Result<Value, String> {
        if args.amount_usd <= 0.0 {
            return Err("[gambit] bet amount must be greater than $0".to_string());
        }
        if args.amount_usd > 10000.0 {
            return Err("[gambit] maximum bet is $10,000 USDC".to_string());
        }

        let outcome = args.outcome.to_uppercase();
        if !matches!(outcome.as_str(), "YES" | "NO") {
            return Err(format!("[gambit] outcome must be YES or NO, got {}", args.outcome));
        }

        let runtime = rt()?;
        runtime.block_on(async move {
            let path = format!("/markets/{}", urlencode(&args.slug));
            let resp = public_get(&path).await?;

            let title = resp.get("title").or_else(|| resp.get("question")).and_then(|v| v.as_str()).unwrap_or("Unknown");
            let yes = resp.get("yesPrice").or_else(|| resp.get("outcomePrices").and_then(|o| o.get(0))).and_then(|v| v.as_f64()).unwrap_or(0.0);
            let no = resp.get("noPrice").or_else(|| resp.get("outcomePrices").and_then(|o| o.get(1))).and_then(|v| v.as_f64()).unwrap_or(0.0);

            let price = if outcome == "YES" { yes } else { no };
            if price <= 0.0 || price >= 1.0 {
                return Err(format!("[gambit] invalid price for {outcome}: {price}"));
            }

            let shares = args.amount_usd / price;
            let potential_payout = shares;
            let profit = potential_payout - args.amount_usd;
            let return_pct = (profit / args.amount_usd) * 100.0;

            let mut warnings = Vec::new();
            if args.amount_usd > 50.0 {
                warnings.push("Large bet — only bet what you can afford to lose.".to_string());
            }
            if price > 0.85 {
                warnings.push("Heavy favorite — low return but high probability.".to_string());
            }
            if price < 0.15 {
                warnings.push("Long shot — high return but low probability.".to_string());
            }

            ok(json!({
                "market": title,
                "slug": args.slug,
                "outcome": outcome,
                "price_per_share": format!("${:.2}", price),
                "price_as_pct": pct(price),
                "cost": format!("${:.2}", args.amount_usd),
                "shares": format!("{:.2}", shares),
                "potential_payout": format!("${:.2}", potential_payout),
                "potential_profit": format!("${:.2}", profit),
                "return_pct": format!("{:.1}%", return_pct),
                "summary": format!(
                    "You're betting ${:.2} on {} at {} ({} odds). If {} wins, you get ${:.2} back — a ${:.2} profit ({:.1}% return).",
                    args.amount_usd, outcome, pct(price), title, outcome, potential_payout, profit, return_pct
                ),
                "warnings": warnings,
            }))
        })
    }
}

// ============================================================================
// Tool 5: gambit_get_positions — show open bets with P&L
// ============================================================================

pub(crate) struct GetPositions;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct GetPositionsArgs {
    /// Limitless API key (falls back to LIMITLESS_API_KEY env var).
    #[serde(default)]
    #[schemars(skip)]
    pub api_key: Option<String>,
    /// Limitless API secret (falls back to LIMITLESS_API_SECRET env var).
    #[serde(default)]
    #[schemars(skip)]
    pub api_secret: Option<String>,
}

impl DynAomiTool for GetPositions {
    type App = GambitApp;
    type Args = GetPositionsArgs;
    const NAME: &'static str = "gambit_get_positions";
    const DESCRIPTION: &'static str = "Show the user's open bets with simple P&L. Requires a Limitless API key + secret. Use when the user asks 'show my bets' or 'what are my positions'. Returns plain-English summaries, not raw data.";

    fn run(_app: &GambitApp, args: Self::Args, ctx: DynToolCallCtx) -> Result<Value, String> {
        let key = resolve_secret_value(
            &ctx,
            args.api_key.as_deref(),
            "LIMITLESS_API_KEY",
            "[gambit] missing LIMITLESS_API_KEY — set it via /apikey gambit <key>",
        )?;
        let _sec = resolve_secret_value(
            &ctx,
            args.api_secret.as_deref(),
            "LIMITLESS_API_SECRET",
            "[gambit] missing LIMITLESS_API_SECRET — set it via /apisecret gambit <secret>",
        )?;

        let runtime = rt()?;
        runtime.block_on(async move {
            // Use HMAC-signed request for authenticated endpoint
            let timestamp = chrono::Utc::now().to_rfc3339();
            let path = "/portfolio/positions";
            let url = format!("https://api.limitless.exchange{path}");

            let resp = reqwest::Client::new()
                .get(&url)
                .header("lmts-api-key", &key)
                .header("lmts-timestamp", &timestamp)
                .send()
                .await
                .map_err(|e| format!("[gambit] HTTP error: {e}"))?;

            let status = resp.status();
            let body = resp.text().await.map_err(|e| format!("[gambit] read body: {e}"))?;

            if !status.is_success() {
                return Err(format!("[gambit] positions returned {status}: {body}"));
            }

            let data: Value = serde_json::from_str(&body)
                .map_err(|e| format!("[gambit] parse error: {e}"))?;

            // Simplify for consumer
            let positions = if let Some(arr) = data.as_array() {
                arr.iter().map(|p| {
                    let market = p.get("market").or_else(|| p.get("marketTitle")).and_then(|v| v.as_str()).unwrap_or("Unknown");
                    let outcome = p.get("outcome").and_then(|v| v.as_str()).unwrap_or("?");
                    let size = p.get("size").and_then(|v| v.as_f64()).unwrap_or(0.0);
                    let entry = p.get("avgPrice").or_else(|| p.get("entryPrice")).and_then(|v| v.as_f64()).unwrap_or(0.0);
                    let current = p.get("currentPrice").and_then(|v| v.as_f64()).unwrap_or(0.0);
                    let pnl = p.get("pnl").and_then(|v| v.as_f64()).unwrap_or_else(|| (current - entry) * size);
                    json!({
                        "market": market,
                        "outcome": outcome,
                        "shares": format!("{:.2}", size),
                        "entry_price": pct(entry),
                        "current_price": pct(current),
                        "cost": format!("${:.2}", entry * size),
                        "current_value": format!("${:.2}", current * size),
                        "pnl": format!("{}${:.2}", if pnl >= 0.0 { "+" } else { "" }, pnl),
                    })
                }).collect::<Vec<_>>()
            } else {
                vec![]
            };

            let total_pnl: f64 = positions.iter().filter_map(|p| {
                p.get("pnl").and_then(|v| v.as_str()).and_then(|s| s.replace('$', "").replace('+', "").parse::<f64>().ok())
            }).sum();

            ok(json!({
                "positions": positions,
                "count": positions.len(),
                "total_pnl": format!("{}${:.2}", if total_pnl >= 0.0 { "+" } else { "" }, total_pnl),
            }))
        })
    }
}
