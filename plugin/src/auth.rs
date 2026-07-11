use base64::{Engine, engine::general_purpose::STANDARD};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use chrono::Utc;

type HmacSha256 = Hmac<Sha256>;

/// Decode a base64 string to bytes.
fn base64_decode(input: &str) -> Result<Vec<u8>, String> {
    STANDARD.decode(input).map_err(|e| format!("base64 decode: {e}"))
}

/// Compute HMAC-SHA256 of `data` using `key`, return the result as a base64 string.
fn hmac_sha256_base64(key: &[u8], data: &[u8]) -> String {
    let mut mac = HmacSha256::new_from_slice(key)
        .expect("HMAC can take key of any size");
    mac.update(data);
    let result = mac.finalize();
    STANDARD.encode(result.into_bytes())
}

/// ISO-8601 UTC timestamp with millisecond precision.
fn iso_timestamp_ms() -> String {
    Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string()
}

/// Compute the `lmts-signature` value for one Limitless API request.
///
/// `secret_b64` is the raw string from the dashboard (already base64).
/// `path_with_query` MUST include leading `/` and any `?query=...` suffix.
/// `body` is `""` for GET / DELETE without bodies.
pub fn sign(
    secret_b64: &str,
    timestamp: &str,
    method: &str,
    path_with_query: &str,
    body: &str,
) -> Result<String, String> {
    let key = base64_decode(secret_b64)
        .map_err(|e| format!("[gambit] base64 decode secret: {e}"))?;
    let prehash = format!("{timestamp}\n{method}\n{path_with_query}\n{body}");
    Ok(hmac_sha256_base64(&key, prehash.as_bytes()))
}

/// ISO-8601 UTC timestamp with millisecond precision.
pub fn iso_timestamp() -> String {
    iso_timestamp_ms()
}
