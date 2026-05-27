use serde_json::Value;

const BASE_URL: &str = "https://api.limitless.exchange";

pub(crate) async fn public_get(path: &str) -> Result<Value, String> {
    let url = format!("{BASE_URL}{path}");
    let resp = reqwest::Client::new()
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("[gambit] HTTP error: {e}"))?;
    let status = resp.status();
    let body = resp
        .text()
        .await
        .map_err(|e| format!("[gambit] read body: {e}"))?;
    if !status.is_success() {
        return Err(format!("[gambit] {path} returned {status}: {body}"));
    }
    serde_json::from_str(&body).map_err(|e| {
        format!(
            "[gambit] not JSON ({e}); first 200: {}",
            body.chars().take(200).collect::<String>()
        )
    })
}

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
