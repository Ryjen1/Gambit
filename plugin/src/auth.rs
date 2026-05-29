use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

/// HMAC-SHA256 output as a base64 string.
fn hmac_sha256_base64(key: &[u8], msg: &[u8]) -> String {
    let mut mac = HmacSha256::new_from_slice(key).expect("HMAC accepts any key length");
    mac.update(msg);
    let result = mac.finalize().into_bytes();
    BASE64.encode(result)
}

/// Decode a base64 string to bytes.
fn base64_decode(s: &str) -> Result<Vec<u8>, String> {
    BASE64
        .decode(s)
        .map_err(|e| format!("[gambit] base64 decode: {e}"))
}

/// ISO-8601 UTC timestamp with millisecond precision.
pub fn iso_timestamp() -> String {
    chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string()
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
    let key = base64_decode(secret_b64)?;
    let prehash = format!("{timestamp}\n{method}\n{path_with_query}\n{body}");
    Ok(hmac_sha256_base64(&key, prehash.as_bytes()))
}
