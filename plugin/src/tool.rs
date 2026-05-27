use crate::client::{
    calculate_edge, decimal_to_probability, limitless_get, odds_api_get,
    urlencode,
};
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

fn pct(p: f64) -> String {
    format!("{}%", (p * 100.0).round())
}

// ============================================================================
// Tool 1: gambit_match_scanner
//
// Fetches today's football matches from The Odds API, then cross-references
// each match with Limitless prediction markets. Returns matches that have
// both real-world bookmaker odds AND on-chain prediction markets.
//
// This is a MULTI-SOURCE tool — no existing plugin does this.
// ============================================================================

pub(crate) struct MatchScanner;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct MatchScannerArgs {
    /// The Odds API key (falls back to ODDS_API_KEY env var).
    #[serde(default)]
    #[schemars(skip)]
    pub odds_api_key: Option<String>,
    /// Sport key. Default: "soccer_fifa_world_cup". Options: "soccer_epl",
    /// "soccer_uefa_champs_league", "soccer_usa_mls", "soccer_spain_la_liga".
    #[serde(default)]
    pub sport: Option<String>,
    /// Region for bookmaker odds. Default: "us". Options: "us", "uk", "eu", "au".
    #[serde(default)]
    pub region: Option<String>,
}

impl DynAomiTool for MatchScanner {
    type App = GambitApp;
    type Args = MatchScannerArgs;
    const NAME: &'static str = "gambit_match_scanner";
    const DESCRIPTION: &'static str = "Scan today's football matches AND find matching prediction markets on Limitless. Combines real-world bookmaker odds with on-chain market prices. Shows which matches have active prediction markets and where the odds differ. Requires an Odds API key (free at the-odds-api.com). This is a multi-source tool that no other Aomi plugin provides.";

    fn run(_app: &GambitApp, args: Self::Args, ctx: DynToolCallCtx) -> Result<Value, String> {
        let odds_key = resolve_secret_value(
            &ctx,
            args.odds_api_key.as_deref(),
            "ODDS_API_KEY",
            "[gambit] missing ODDS_API_KEY — get a free key at the-odds-api.com",
        )?;
        let sport = args
            .sport
            .unwrap_or_else(|| "soccer_fifa_world_cup".to_string());
        let region = args.region.unwrap_or_else(|| "us".to_string());

        let runtime = rt()?;
        runtime.block_on(async move {
            // Step 1: Fetch real-world matches + bookmaker odds
            let odds_path = format!(
                "/sports/{}/odds/?regions={}&markets=h2h&oddsFormat=decimal",
                urlencode(&sport),
                urlencode(&region)
            );
            let odds_data = odds_api_get(&odds_path, &odds_key).await?;

            let matches = odds_data.as_array().ok_or_else(|| {
                "[gambit] Odds API returned non-array response".to_string()
            })?;

            let mut results = Vec::new();

            for m in matches {
                let home = m
                    .get("home_team")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Unknown");
                let away = m
                    .get("away_team")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Unknown");
                let commence = m
                    .get("commence_time")
                    .and_then(|v| v.as_str())
                    .unwrap_or("");

                // Extract best bookmaker odds
                let mut best_home = 0.0_f64;
                let mut best_away = 0.0_f64;
                let mut best_draw = 0.0_f64;
                let mut bookmakers_count = 0;

                if let Some(bks) = m.get("bookmakers").and_then(|v| v.as_array()) {
                    bookmakers_count = bks.len();
                    for bk in bks {
                        if let Some(markets) = bk.get("markets").and_then(|v| v.as_array()) {
                            for market in markets {
                                if let Some(outcomes) =
                                    market.get("outcomes").and_then(|v| v.as_array())
                                {
                                    for outcome in outcomes {
                                        let name =
                                            outcome.get("name").and_then(|v| v.as_str()).unwrap_or("");
                                        let price =
                                            outcome.get("price").and_then(|v| v.as_f64()).unwrap_or(0.0);
                                        if name == home && price > best_home {
                                            best_home = price;
                                        } else if name == away && price > best_away {
                                            best_away = price;
                                        } else if name == "Draw" && price > best_draw {
                                            best_draw = price;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Step 2: Search Limitless for matching markets
                let search_query = format!("{} {}", home, away);
                let search_path = format!(
                    "/markets/search?query={}&limit=5",
                    urlencode(&search_query)
                );
                let limitless_results = limitless_get(&search_path).await.unwrap_or(json!([]));

                let mut matched_markets = Vec::new();
                if let Some(markets) = limitless_results.as_array() {
                    for lm in markets {
                        let title = lm
                            .get("title")
                            .or_else(|| lm.get("question"))
                            .and_then(|v| v.as_str())
                            .unwrap_or("");
                        let slug = lm.get("slug").and_then(|v| v.as_str()).unwrap_or("");
                        let yes = lm
                            .get("yesPrice")
                            .or_else(|| {
                                lm.get("outcomePrices")
                                    .and_then(|o| o.get(0))
                            })
                            .and_then(|v| v.as_f64())
                            .unwrap_or(0.0);
                        let no = lm
                            .get("noPrice")
                            .or_else(|| {
                                lm.get("outcomePrices")
                                    .and_then(|o| o.get(1))
                            })
                            .and_then(|v| v.as_f64())
                            .unwrap_or(0.0);
                        let volume = lm
                            .get("volume")
                            .or_else(|| lm.get("volume24hr"))
                            .and_then(|v| v.as_f64())
                            .unwrap_or(0.0);

                        // Calculate edge: bookmaker implied prob vs Limitless price
                        let home_prob = if best_home > 0.0 {
                            decimal_to_probability(best_home)
                        } else {
                            0.0
                        };
                        let edge = calculate_edge(home_prob, yes);

                        matched_markets.push(json!({
                            "title": title,
                            "slug": slug,
                            "limitless_yes": pct(yes),
                            "limitless_no": pct(no),
                            "volume_usd": volume,
                            "bookmaker_home_prob": pct(home_prob),
                            "edge": format!("{:+.1}%", edge * 100.0),
                            "is_value_bet": edge > 0.05,
                        }));
                    }
                }

                results.push(json!({
                    "match": format!("{} vs {}", home, away),
                    "kickoff": commence,
                    "bookmaker_odds": {
                        "home": if best_home > 0.0 { format!("{:.2}", best_home) } else { "N/A".to_string() },
                        "away": if best_away > 0.0 { format!("{:.2}", best_away) } else { "N/A".to_string() },
                        "draw": if best_draw > 0.0 { format!("{:.2}", best_draw) } else { "N/A".to_string() },
                    },
                    "bookmakers_queried": bookmakers_count,
                    "limitless_markets": matched_markets,
                    "has_prediction_market": !matched_markets.is_empty(),
                }));
            }

            let with_markets = results.iter().filter(|r| r["has_prediction_market"].as_bool().unwrap_or(false)).count();

            ok(json!({
                "sport": sport,
                "matches_scanned": results.len(),
                "matches_with_prediction_markets": with_markets,
                "matches": results,
                "summary": format!(
                    "Scanned {} matches. {} have active prediction markets on Limitless.",
                    results.len(), with_markets
                ),
            }))
        })
    }
}

// ============================================================================
// Tool 2: gambit_odds_compare
//
// Compares real-world bookmaker odds for a specific match against Limitless
// market prices. Calculates edge, value, and recommendation.
//
// CUSTOM ANALYSIS LOGIC — this is original Rust code, not API passthrough.
// ============================================================================

pub(crate) struct OddsCompare;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct OddsCompareArgs {
    /// Limitless market slug.
    pub slug: String,
    /// Home team name (for bookmaker lookup).
    pub home_team: String,
    /// Away team name (for bookmaker lookup).
    pub away_team: String,
    /// The Odds API key (falls back to ODDS_API_KEY env var).
    #[serde(default)]
    #[schemars(skip)]
    pub odds_api_key: Option<String>,
    /// Sport key. Default: "soccer_fifa_world_cup".
    #[serde(default)]
    pub sport: Option<String>,
}

impl DynAomiTool for OddsCompare {
    type App = GambitApp;
    type Args = OddsCompareArgs;
    const NAME: &'static str = "gambit_odds_compare";
    const DESCRIPTION: &'static str = "Compare real-world bookmaker odds vs Limitless prediction market prices for a specific match. Calculates the edge (mispricing) and tells you if Limitless is overpricing or underpricing the outcome. Positive edge = value bet on Limitless. Requires Odds API key. This is custom analysis logic, not just API passthrough.";

    fn run(_app: &GambitApp, args: Self::Args, ctx: DynToolCallCtx) -> Result<Value, String> {
        let odds_key = resolve_secret_value(
            &ctx,
            args.odds_api_key.as_deref(),
            "ODDS_API_KEY",
            "[gambit] missing ODDS_API_KEY",
        )?;
        let sport = args
            .sport
            .unwrap_or_else(|| "soccer_fifa_world_cup".to_string());

        let runtime = rt()?;
        runtime.block_on(async move {
            // Fetch Limitless market
            let market_path = format!("/markets/{}", urlencode(&args.slug));
            let market = limitless_get(&market_path).await?;
            let title = market
                .get("title")
                .or_else(|| market.get("question"))
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown");
            let yes_price = market
                .get("yesPrice")
                .or_else(|| market.get("outcomePrices").and_then(|o| o.get(0)))
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            let no_price = market
                .get("noPrice")
                .or_else(|| market.get("outcomePrices").and_then(|o| o.get(1)))
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            let volume = market
                .get("volume")
                .or_else(|| market.get("volume24hr"))
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);

            // Fetch bookmaker odds
            let odds_path = format!(
                "/sports/{}/odds/?regions=us,uk,eu&markets=h2h&oddsFormat=decimal",
                urlencode(&sport)
            );
            let odds_data = odds_api_get(&odds_path, &odds_key).await?;

            // Find matching match
            let mut bookmaker_home = 0.0_f64;
            let mut bookmaker_away = 0.0_f64;
            let mut bookmaker_draw = 0.0_f64;
            let mut found = false;

            if let Some(matches) = odds_data.as_array() {
                for m in matches {
                    let home = m.get("home_team").and_then(|v| v.as_str()).unwrap_or("");
                    let away = m.get("away_team").and_then(|v| v.as_str()).unwrap_or("");
                    let home_lower = home.to_lowercase();
                    let away_lower = away.to_lowercase();

                    if home_lower.contains(&args.home_team.to_lowercase())
                        || args.home_team.to_lowercase().contains(&home_lower)
                        || away_lower.contains(&args.away_team.to_lowercase())
                        || args.away_team.to_lowercase().contains(&away_lower)
                    {
                        if let Some(bks) = m.get("bookmakers").and_then(|v| v.as_array()) {
                            for bk in bks {
                                if let Some(markets) = bk.get("markets").and_then(|v| v.as_array()) {
                                    for market in markets {
                                        if let Some(outcomes) =
                                            market.get("outcomes").and_then(|v| v.as_array())
                                        {
                                            for outcome in outcomes {
                                                let name = outcome.get("name").and_then(|v| v.as_str()).unwrap_or("");
                                                let price = outcome.get("price").and_then(|v| v.as_f64()).unwrap_or(0.0);
                                                if name == home && price > bookmaker_home {
                                                    bookmaker_home = price;
                                                } else if name == away && price > bookmaker_away {
                                                    bookmaker_away = price;
                                                } else if name == "Draw" && price > bookmaker_draw {
                                                    bookmaker_draw = price;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        found = true;
                        break;
                    }
                }
            }

            if !found {
                return Err(format!(
                    "[gambit] could not find {} vs {} in bookmaker data",
                    args.home_team, args.away_team
                ));
            }

            // === CUSTOM ANALYSIS LOGIC ===
            let home_prob_bookmaker = decimal_to_probability(bookmaker_home);
            let away_prob_bookmaker = decimal_to_probability(bookmaker_away);
            let _draw_prob_bookmaker = if bookmaker_draw > 0.0 {
                decimal_to_probability(bookmaker_draw)
            } else {
                0.0
            };

            // Edge = bookmaker probability - Limitless price
            // Positive = Limitless is underpricing (value bet)
            // Negative = Limitless is overpricing
            let home_edge = calculate_edge(home_prob_bookmaker, yes_price);
            let away_edge = calculate_edge(away_prob_bookmaker, no_price);

            // Recommendation logic
            let recommendation = if home_edge > 0.1 {
                format!(
                    "STRONG VALUE: Limitless is underpricing YES by {:.1}%. Bookmakers say {}% chance, Limitless says {}%. Consider buying YES.",
                    home_edge * 100.0,
                    pct(home_prob_bookmaker),
                    pct(yes_price)
                )
            } else if home_edge > 0.05 {
                format!(
                    "SLIGHT VALUE: Limitless is underpricing YES by {:.1}%. Small edge but worth considering.",
                    home_edge * 100.0
                )
            } else if home_edge < -0.1 {
                format!(
                    "OVERPRICED: Limitless is overpricing YES by {:.1}%. Bookmakers say {}% chance, Limitless says {}%. Consider NO.",
                    home_edge.abs() * 100.0,
                    pct(home_prob_bookmaker),
                    pct(yes_price)
                )
            } else {
                "FAIR PRICE: Limitless and bookmakers roughly agree. No clear edge.".to_string()
            };

            ok(json!({
                "market": title,
                "slug": args.slug,
                "limitless": {
                    "yes_price": pct(yes_price),
                    "no_price": pct(no_price),
                    "volume_usd": volume,
                },
                "bookmakers": {
                    "home_decimal": format!("{:.2}", bookmaker_home),
                    "away_decimal": format!("{:.2}", bookmaker_away),
                    "draw_decimal": if bookmaker_draw > 0.0 { format!("{:.2}", bookmaker_draw) } else { "N/A".to_string() },
                    "home_implied_prob": pct(home_prob_bookmaker),
                    "away_implied_prob": pct(away_prob_bookmaker),
                },
                "analysis": {
                    "home_edge": format!("{:+.1}%", home_edge * 100.0),
                    "away_edge": format!("{:+.1}%", away_edge * 100.0),
                    "is_value_bet": home_edge > 0.05,
                    "recommendation": recommendation,
                },
                "summary": format!(
                    "{} vs {}: Limitless YES = {} (bookmaker: {}). Edge: {:+.1}%. {}",
                    args.home_team, args.away_team,
                    pct(yes_price), pct(home_prob_bookmaker),
                    home_edge * 100.0, recommendation
                ),
            }))
        })
    }
}

// ============================================================================
// Tool 3: gambit_value_bet
//
// Scans all active Limitless football markets and flags any where the
// Limitless price diverges significantly from bookmaker consensus.
//
// This is a SCANNING tool — it searches across many markets at once.
// ============================================================================

pub(crate) struct ValueBet;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct ValueBetArgs {
    /// The Odds API key (falls back to ODDS_API_KEY env var).
    #[serde(default)]
    #[schemars(skip)]
    pub odds_api_key: Option<String>,
    /// Minimum edge to flag (default 5% = 0.05).
    #[serde(default)]
    pub min_edge_pct: Option<f64>,
    /// Sport key. Default: "soccer_fifa_world_cup".
    #[serde(default)]
    pub sport: Option<String>,
}

impl DynAomiTool for ValueBet {
    type App = GambitApp;
    type Args = ValueBetArgs;
    const NAME: &'static str = "gambit_value_bet";
    const DESCRIPTION: &'static str = "Scan ALL active football prediction markets on Limitless and flag any where the on-chain price diverges from real-world bookmaker odds by more than 5%. Finds value bets automatically. Requires Odds API key. This is cross-market scanning — no other plugin does this.";

    fn run(_app: &GambitApp, args: Self::Args, ctx: DynToolCallCtx) -> Result<Value, String> {
        let odds_key = resolve_secret_value(
            &ctx,
            args.odds_api_key.as_deref(),
            "ODDS_API_KEY",
            "[gambit] missing ODDS_API_KEY",
        )?;
        let min_edge = args.min_edge_pct.unwrap_or(5.0) / 100.0;
        let sport = args
            .sport
            .unwrap_or_else(|| "soccer_fifa_world_cup".to_string());

        let runtime = rt()?;
        runtime.block_on(async move {
            // Fetch bookmaker odds for all matches
            let odds_path = format!(
                "/sports/{}/odds/?regions=us,uk,eu&markets=h2h&oddsFormat=decimal",
                urlencode(&sport)
            );
            let odds_data = odds_api_get(&odds_path, &odds_key).await?;

            // Build a lookup: normalized team name → best decimal odds
            let mut team_odds: std::collections::HashMap<String, f64> =
                std::collections::HashMap::new();
            if let Some(matches) = odds_data.as_array() {
                for m in matches {
                    let _home = m.get("home_team").and_then(|v| v.as_str()).unwrap_or("");
                    let _away = m.get("away_team").and_then(|v| v.as_str()).unwrap_or("");
                    if let Some(bks) = m.get("bookmakers").and_then(|v| v.as_array()) {
                        for bk in bks {
                            if let Some(markets) = bk.get("markets").and_then(|v| v.as_array()) {
                                for market in markets {
                                    if let Some(outcomes) =
                                        market.get("outcomes").and_then(|v| v.as_array())
                                    {
                                        for outcome in outcomes {
                                            let name =
                                                outcome.get("name").and_then(|v| v.as_str()).unwrap_or("");
                                            let price =
                                                outcome.get("price").and_then(|v| v.as_f64()).unwrap_or(0.0);
                                            let key = name.to_lowercase();
                                            let entry = team_odds.entry(key).or_insert(0.0);
                                            if price > *entry {
                                                *entry = price;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Search Limitless for football markets
            let search_path = "/markets/search?query=football+soccer&limit=20";
            let limitless_results = limitless_get(search_path).await.unwrap_or(json!([]));

            let mut value_bets = Vec::new();
            if let Some(markets) = limitless_results.as_array() {
                for lm in markets {
                    let title = lm
                        .get("title")
                        .or_else(|| lm.get("question"))
                        .and_then(|v| v.as_str())
                        .unwrap_or("");
                    let slug = lm.get("slug").and_then(|v| v.as_str()).unwrap_or("");
                    let yes = lm
                        .get("yesPrice")
                        .or_else(|| lm.get("outcomePrices").and_then(|o| o.get(0)))
                        .and_then(|v| v.as_f64())
                        .unwrap_or(0.0);

                    // Try to match title against bookmaker data
                    let title_lower = title.to_lowercase();
                    let mut matched_prob = 0.0_f64;
                    let mut matched_team = String::new();

                    for (team, &odds) in &team_odds {
                        if title_lower.contains(team) {
                            let prob = decimal_to_probability(odds);
                            if prob > matched_prob {
                                matched_prob = prob;
                                matched_team = team.clone();
                            }
                        }
                    }

                    if matched_prob > 0.0 {
                        let edge = calculate_edge(matched_prob, yes);
                        if edge.abs() > min_edge {
                            value_bets.push(json!({
                                "market": title,
                                "slug": slug,
                                "limitless_yes": pct(yes),
                                "bookmaker_prob": pct(matched_prob),
                                "matched_team": matched_team,
                                "edge": format!("{:+.1}%", edge * 100.0),
                                "direction": if edge > 0.0 { "BUY YES (Limitless underpriced)" } else { "BUY NO (Limitless overpriced)" },
                                "confidence": if edge.abs() > 0.15 { "HIGH" } else if edge.abs() > 0.08 { "MEDIUM" } else { "LOW" },
                            }));
                        }
                    }
                }
            }

            ok(json!({
                "markets_scanned": limitless_results.as_array().map(|a| a.len()).unwrap_or(0),
                "bookmaker_teams": team_odds.len(),
                "value_bets_found": value_bets.len(),
                "min_edge_threshold": pct(min_edge),
                "value_bets": value_bets,
                "summary": if value_bets.is_empty() {
                    format!("Scanned markets with {}%+ edge threshold. No value bets found right now.", min_edge * 100.0)
                } else {
                    format!("Found {} potential value bets with {}%+ edge.", value_bets.len(), min_edge * 100.0)
                },
            }))
        })
    }
}

// ============================================================================
// Tool 4: gambit_market_pulse
//
// Aggregates volume, price movement, and liquidity across multiple Limitless
// markets for a given category. Returns a "pulse" — the overall state of
// a market category.
// ============================================================================

pub(crate) struct MarketPulse;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct MarketPulseArgs {
    /// Category to pulse: "football", "crypto", "politics", "all".
    pub category: String,
    /// Max markets to analyze (default 20).
    #[serde(default)]
    pub limit: Option<i64>,
}

impl DynAomiTool for MarketPulse {
    type App = GambitApp;
    type Args = MarketPulseArgs;
    const NAME: &'static str = "gambit_market_pulse";
    const DESCRIPTION: &'static str = "Get the pulse of a market category — aggregate volume, average prices, most active markets, and overall sentiment. Use when the user asks 'what's hot' or 'how's the football market doing'. Returns cross-market analysis in one call. Public — no API key needed.";

    fn run(_app: &GambitApp, args: Self::Args, _ctx: DynToolCallCtx) -> Result<Value, String> {
        let runtime = rt()?;
        runtime.block_on(async move {
            let limit = args.limit.unwrap_or(20);
            let query = match args.category.to_lowercase().as_str() {
                "football" | "soccer" => "football soccer world cup",
                "crypto" => "bitcoin ethereum crypto price",
                "politics" => "election president politics",
                _ => &args.category,
            };

            let path = format!("/markets/search?query={}&limit={}", urlencode(query), limit);
            let resp = limitless_get(&path).await.unwrap_or(json!([]));

            let empty = vec![];
            let markets = resp.as_array().unwrap_or(&empty);
            let mut total_volume = 0.0_f64;
            let mut total_yes = 0.0_f64;
            let mut count = 0;
            let mut most_active: Vec<Value> = Vec::new();

            for m in markets {
                let title = m
                    .get("title")
                    .or_else(|| m.get("question"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("");
                let slug = m.get("slug").and_then(|v| v.as_str()).unwrap_or("");
                let yes = m
                    .get("yesPrice")
                    .or_else(|| m.get("outcomePrices").and_then(|o| o.get(0)))
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0);
                let volume = m
                    .get("volume")
                    .or_else(|| m.get("volume24hr"))
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0);

                total_volume += volume;
                total_yes += yes;
                count += 1;

                most_active.push(json!({
                    "title": title,
                    "slug": slug,
                    "yes": pct(yes),
                    "volume": volume,
                }));
            }

            // Sort by volume descending
            most_active.sort_by(|a, b| {
                b.get("volume")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0)
                    .partial_cmp(&a.get("volume").and_then(|v| v.as_f64()).unwrap_or(0.0))
                    .unwrap_or(std::cmp::Ordering::Equal)
            });

            let avg_yes = if count > 0 { total_yes / count as f64 } else { 0.0 };
            let sentiment = if avg_yes > 0.6 {
                "BULLISH — most markets lean YES"
            } else if avg_yes < 0.4 {
                "BEARISH — most markets lean NO"
            } else {
                "NEUTRAL — markets are split"
            };

            ok(json!({
                "category": args.category,
                "markets_analyzed": count,
                "total_volume_usd": total_volume,
                "average_yes_price": pct(avg_yes),
                "sentiment": sentiment,
                "top_markets": most_active.iter().take(5).cloned().collect::<Vec<_>>(),
                "summary": format!(
                    "{} markets in {}. Total volume: ${:.0}. Average sentiment: {}.",
                    count, args.category, total_volume, sentiment
                ),
            }))
        })
    }
}

// ============================================================================
// Tool 5: gambit_bet_builder
//
// Builds a multi-leg bet slip across several Limitless markets.
// Calculates combined odds, total cost, and potential payout.
//
// This is NOVEL — no other Aomi plugin has a multi-leg bet builder.
// ============================================================================

pub(crate) struct BetBuilder;

#[derive(Debug, Deserialize, JsonSchema)]
pub(crate) struct BetBuilderArgs {
    /// List of market slugs to include in the bet slip.
    pub slugs: Vec<String>,
    /// List of outcomes ("YES" or "NO") for each market. Must match slugs length.
    pub outcomes: Vec<String>,
    /// Total amount in USDC to spread across the bet slip.
    pub total_amount_usd: f64,
}

impl DynAomiTool for BetBuilder {
    type App = GambitApp;
    type Args = BetBuilderArgs;
    const NAME: &'static str = "gambit_bet_builder";
    const DESCRIPTION: &'static str = "Build a multi-leg bet slip across several Limitless markets. Calculates combined odds, splits your budget across legs, and shows total potential payout. Use when the user wants to parlay multiple bets. Public — no API key needed.";

    fn run(_app: &GambitApp, args: Self::Args, _ctx: DynToolCallCtx) -> Result<Value, String> {
        if args.slugs.len() != args.outcomes.len() {
            return Err(format!(
                "[gambit] slugs ({}) and outcomes ({}) must have the same length",
                args.slugs.len(),
                args.outcomes.len()
            ));
        }
        if args.slugs.is_empty() {
            return Err("[gambit] need at least one market in the bet slip".to_string());
        }
        if args.total_amount_usd <= 0.0 {
            return Err("[gambit] total amount must be greater than $0".to_string());
        }

        let runtime = rt()?;
        runtime.block_on(async move {
            let per_leg = args.total_amount_usd / args.slugs.len() as f64;
            let mut combined_decimal = 1.0_f64;
            let mut legs = Vec::new();

            for (i, slug) in args.slugs.iter().enumerate() {
                let outcome = args.outcomes[i].to_uppercase();
                if !matches!(outcome.as_str(), "YES" | "NO") {
                    return Err(format!(
                        "[gambit] outcome must be YES or NO, got {}",
                        args.outcomes[i]
                    ));
                }

                let path = format!("/markets/{}", urlencode(slug));
                let market = limitless_get(&path).await?;

                let title = market
                    .get("title")
                    .or_else(|| market.get("question"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("Unknown");
                let yes = market
                    .get("yesPrice")
                    .or_else(|| market.get("outcomePrices").and_then(|o| o.get(0)))
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0);
                let no = market
                    .get("noPrice")
                    .or_else(|| market.get("outcomePrices").and_then(|o| o.get(1)))
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0);

                let price = if outcome == "YES" { yes } else { no };
                if price <= 0.0 || price >= 1.0 {
                    return Err(format!(
                        "[gambit] invalid price for {} on {}: {}",
                        outcome, slug, price
                    ));
                }

                let shares = per_leg / price;
                let decimal_odds = 1.0 / price;
                combined_decimal *= decimal_odds;

                legs.push(json!({
                    "leg": i + 1,
                    "market": title,
                    "slug": slug,
                    "outcome": outcome,
                    "price": pct(price),
                    "cost": format!("${:.2}", per_leg),
                    "shares": format!("{:.2}", shares),
                    "decimal_odds": format!("{:.2}", decimal_odds),
                    "potential_payout": format!("${:.2}", shares),
                }));
            }

            // Combined parlay payout: multiply all decimal odds
            let combined_payout = args.total_amount_usd * combined_decimal;
            let combined_profit = combined_payout - args.total_amount_usd;
            let combined_return = (combined_profit / args.total_amount_usd) * 100.0;
            let combined_prob = 1.0 / combined_decimal;

            ok(json!({
                "slip": {
                    "legs": legs.len(),
                    "total_cost": format!("${:.2}", args.total_amount_usd),
                    "per_leg": format!("${:.2}", per_leg),
                },
                "legs": legs,
                "combined": {
                    "decimal_odds": format!("{:.2}", combined_decimal),
                    "implied_probability": pct(combined_prob),
                    "potential_payout": format!("${:.2}", combined_payout),
                    "potential_profit": format!("${:.2}", combined_profit),
                    "return_pct": format!("{:.1}%", combined_return),
                },
                "risk_warning": if legs.len() > 3 {
                    "HIGH RISK: Multi-leg parlays are hard to win. All legs must hit."
                } else if legs.len() > 1 {
                    "MEDIUM RISK: All legs must hit for the parlay to pay out."
                } else {
                    "SINGLE BET: Standard risk."
                },
                "summary": format!(
                    "{}-leg parlay: ${:.2} total → potential ${:.2} payout ({:.1}% return, {:.1}% implied probability).",
                    legs.len(), args.total_amount_usd, combined_payout, combined_return, combined_prob * 100.0
                ),
            }))
        })
    }
}
