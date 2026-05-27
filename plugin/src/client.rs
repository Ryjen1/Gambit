use serde_json::Value;

const LIMITLESS_URL: &str = "https://api.limitless.exchange";
const ODDS_API_URL: &str = "https://api.the-odds-api.com/v4";

// ============================================================================
// Limitless API (prediction markets on Base)
// ============================================================================

pub(crate) async fn limitless_get(path: &str) -> Result<Value, String> {
    let url = format!("{LIMITLESS_URL}{path}");
    let resp = reqwest::Client::new()
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("[gambit] Limitless HTTP error: {e}"))?;
    let status = resp.status();
    let body = resp
        .text()
        .await
        .map_err(|e| format!("[gambit] read body: {e}"))?;
    if !status.is_success() {
        return Err(format!("[gambit] Limitless {path} returned {status}: {body}"));
    }
    serde_json::from_str(&body).map_err(|e| {
        format!(
            "[gambit] not JSON ({e}); first 200: {}",
            body.chars().take(200).collect::<String>()
        )
    })
}

// ============================================================================
// The Odds API (real-world bookmaker odds)
// ============================================================================

pub(crate) async fn odds_api_get(path: &str, api_key: &str) -> Result<Value, String> {
    let separator = if path.contains('?') { "&" } else { "?" };
    let url = format!("{ODDS_API_URL}{path}{separator}apiKey={api_key}");
    let resp = reqwest::Client::new()
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("[gambit] Odds API HTTP error: {e}"))?;
    let status = resp.status();
    let body = resp
        .text()
        .await
        .map_err(|e| format!("[gambit] read body: {e}"))?;
    if !status.is_success() {
        return Err(format!(
            "[gambit] Odds API {path} returned {status}: {body}"
        ));
    }
    serde_json::from_str(&body).map_err(|e| {
        format!(
            "[gambit] not JSON ({e}); first 200: {}",
            body.chars().take(200).collect::<String>()
        )
    })
}

// ============================================================================
// Helpers
// ============================================================================

pub(crate) fn urlencode(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for b in s.as_bytes() {
        let c = *b as char;
        if c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.' | '~') {
            out.push(c);
        } else {
            use std::fmt::Write;
            let _ = write!(out, "%{:02X}", b);
        }
    }
    out
}

/// Convert American odds to implied probability (0.0 - 1.0).
/// Positive odds: probability = 100 / (odds + 100)
/// Negative odds: probability = |odds| / (|odds| + 100)
pub(crate) fn american_to_probability(american: f64) -> f64 {
    if american > 0.0 {
        100.0 / (american + 100.0)
    } else {
        let abs = american.abs();
        abs / (abs + 100.0)
    }
}

/// Convert decimal odds to implied probability.
pub(crate) fn decimal_to_probability(decimal: f64) -> f64 {
    if decimal > 0.0 {
        1.0 / decimal
    } else {
        0.0
    }
}

/// Calculate edge: difference between bookmaker probability and market probability.
/// Positive edge = market is underpricing (value bet).
pub(crate) fn calculate_edge(bookmaker_prob: f64, market_prob: f64) -> f64 {
    bookmaker_prob - market_prob
}
